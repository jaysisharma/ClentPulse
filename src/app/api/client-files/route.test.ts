import { describe, it, expect, vi, beforeEach } from 'vitest'

const PROJECT = { id: 'proj-1', slug: 'acme', passcode: null as string | null }

const mockProjectLookup = vi.fn()
const mockCount = vi.fn()
const mockUpsert = vi.fn()
const mockInfo = vi.fn()
const mockRemove = vi.fn()
const mockCreateSignedUploadUrl = vi.fn()
const mockCreateSignedUrl = vi.fn()
const mockCookieGet = vi.fn()
const mockNotify = vi.fn()
const mockRateLimit = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}))

vi.mock('@/lib/notifications', () => ({
  notifyFreelancerOfClientFiles: (...args: unknown[]) => mockNotify(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'projects') {
        return { select: () => ({ eq: () => ({ maybeSingle: mockProjectLookup }) }) }
      }
      return {
        select: () => ({ eq: mockCount }),
        upsert: (rows: unknown[]) => ({ select: () => mockUpsert(rows) }),
      }
    },
    storage: {
      from: () => ({
        info: mockInfo,
        remove: mockRemove,
        createSignedUploadUrl: mockCreateSignedUploadUrl,
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  })),
}))

function post(url: string, body: object): Request {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockProjectLookup.mockResolvedValue({ data: { ...PROJECT } })
  mockCount.mockResolvedValue({ count: 0 })
  mockRateLimit.mockResolvedValue({ success: true })
  mockCookieGet.mockReturnValue(undefined)
  mockCreateSignedUploadUrl.mockImplementation(async (path: string) => ({ data: { path, token: 'tok', signedUrl: 'u' }, error: null }))
  mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed' } })
  mockInfo.mockResolvedValue({ data: { size: 1024, contentType: 'image/png' }, error: null })
  mockUpsert.mockImplementation(async (rows: object[]) => ({
    data: rows.map((r, i) => ({ ...r, id: `f${i}`, created_at: '2026-10-22' })),
    error: null,
  }))
})

describe('POST /api/client-files/upload-url', () => {
  it('issues a signed upload path scoped to the project with a sanitized name', async () => {
    const { POST } = await import('./upload-url/route')
    const res = await POST(post('/api/client-files/upload-url', { slug: 'acme', fileName: '../../etc/passwd', size: 10 }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.path).toMatch(/^proj-1\/[0-9a-f-]{36}-passwd$/)
    expect(data.token).toBe('tok')
  })

  it('rejects files over 50 MB', async () => {
    const { POST } = await import('./upload-url/route')
    const res = await POST(post('/api/client-files/upload-url', { slug: 'acme', fileName: 'a.zip', size: 51 * 1024 * 1024 }))
    expect(res.status).toBe(413)
    expect(mockCreateSignedUploadUrl).not.toHaveBeenCalled()
  })

  it('requires the portal passcode session when the project is gated', async () => {
    mockProjectLookup.mockResolvedValue({ data: { ...PROJECT, passcode: 'secret' } })
    const { POST } = await import('./upload-url/route')
    const res = await POST(post('/api/client-files/upload-url', { slug: 'acme', fileName: 'a.png', size: 10 }))
    expect(res.status).toBe(401)
  })

  it('returns 429 when rate limited', async () => {
    mockRateLimit.mockResolvedValue({ success: false })
    const { POST } = await import('./upload-url/route')
    const res = await POST(post('/api/client-files/upload-url', { slug: 'acme', fileName: 'a.png', size: 10 }))
    expect(res.status).toBe(429)
  })

  it('stops uploads once the project file cap is reached', async () => {
    mockCount.mockResolvedValue({ count: 100 })
    const { POST } = await import('./upload-url/route')
    const res = await POST(post('/api/client-files/upload-url', { slug: 'acme', fileName: 'a.png', size: 10 }))
    expect(res.status).toBe(409)
  })
})

describe('POST /api/client-files', () => {
  it('records uploaded files using the stored size and emails the studio once', async () => {
    const { POST } = await import('./route')
    const res = await POST(post('/api/client-files', {
      slug: 'acme',
      files: [
        { path: 'proj-1/abc-logo.png', fileName: 'logo.png' },
        { path: 'proj-1/def-copy.docx', fileName: 'copy.docx' },
      ],
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.files).toHaveLength(2)
    expect(data.files[0].size_bytes).toBe(1024)
    expect(data.files[0].download_url).toBe('https://signed')
    expect(mockNotify).toHaveBeenCalledTimes(1)
    expect(mockNotify).toHaveBeenCalledWith({ projectId: 'proj-1', fileNames: ['logo.png', 'copy.docx'] })
  })

  it("rejects paths that belong to another project", async () => {
    const { POST } = await import('./route')
    const res = await POST(post('/api/client-files', {
      slug: 'acme',
      files: [{ path: 'other-project/abc-logo.png', fileName: 'logo.png' }],
    }))
    expect(res.status).toBe(400)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('rejects traversal attempts inside the project folder', async () => {
    const { POST } = await import('./route')
    const res = await POST(post('/api/client-files', {
      slug: 'acme',
      files: [{ path: 'proj-1/../other/x', fileName: 'x' }],
    }))
    expect(res.status).toBe(400)
  })

  it('rejects uploads that never reached storage', async () => {
    mockInfo.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const { POST } = await import('./route')
    const res = await POST(post('/api/client-files', {
      slug: 'acme',
      files: [{ path: 'proj-1/abc-logo.png', fileName: 'logo.png' }],
    }))
    expect(res.status).toBe(400)
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it('deletes and rejects objects that exceed the size limit', async () => {
    mockInfo.mockResolvedValue({ data: { size: 60 * 1024 * 1024 }, error: null })
    const { POST } = await import('./route')
    const res = await POST(post('/api/client-files', {
      slug: 'acme',
      files: [{ path: 'proj-1/abc-big.zip', fileName: 'big.zip' }],
    }))
    expect(res.status).toBe(413)
    expect(mockRemove).toHaveBeenCalledWith(['proj-1/abc-big.zip'])
  })
})

describe('GET /api/client-files', () => {
  it('blocks studio listing for signed-out users', async () => {
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/client-files?projectId=proj-1'))
    expect(res.status).toBe(403)
  })
})
