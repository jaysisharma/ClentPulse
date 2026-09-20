import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockMaybeSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: (table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: mockUpdate,
      maybeSingle: mockMaybeSingle,
    }),
  }),
}))

vi.mock('@/lib/integrations/providers', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  ALLOWED_PROVIDERS: ['google', 'github', 'figma'],
}))

vi.mock('@/lib/integrations/oauth', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  getDecryptedConnection: vi.fn().mockResolvedValue({
    accessToken: 'mock-access',
    connection: { id: 'conn-1', provider: 'google' },
  }),
  revokeToken: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/activity', () => ({
  logAgencyActivity: vi.fn().mockResolvedValue(undefined),
}))

function makeRequest(provider: string): [Request, { params: Promise<{ provider: string }> }] {
  return [
    new Request(`http://localhost:3000/api/integrations/${provider}/disconnect`, { method: 'POST' }),
    { params: Promise.resolve({ provider }) },
  ]
}

describe('POST /api/integrations/[provider]/disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockUpdate.mockReturnValue({ eq: vi.fn().mockReturnThis(), eq2: vi.fn().mockResolvedValue({ error: null }) })
    mockMaybeSingle.mockResolvedValue({ data: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const [req, ctx] = makeRequest('google')
    const res = await POST(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 400 for unknown provider', async () => {
    const { POST } = await import('./route')
    const [req, ctx] = makeRequest('unknown')
    const res = await POST(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns 200 on successful disconnect', async () => {
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const { POST } = await import('./route')
    const [req, ctx] = makeRequest('google')
    const res = await POST(req, ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
