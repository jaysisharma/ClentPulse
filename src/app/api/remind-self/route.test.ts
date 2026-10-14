import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'msg_self_123' }, error: null })
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return {
      emails: {
        send: mockSend,
      },
    }
  }),
}))

const mockGetUser = vi.fn()
const mockProjectSingle = vi.fn()
const mockOrgMemberMaybeSingle = vi.fn()
const mockOwnerSingle = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockProjectSingle,
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockOrgMemberMaybeSingle,
    }
  }
  if (table === 'users') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockOwnerSingle,
    }
  }
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/remind-self', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/remind-self', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'owner@agency.com' } } })
    mockOwnerSingle.mockResolvedValue({ data: { name: 'Lead Dev', accent_color: '#7C3AED' } })
    mockOrgMemberMaybeSingle.mockResolvedValue(null)
  })

  it('returns 400 when projectId is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing projectId')
  })

  it('returns 401 when unauthorized', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(401)
  })

  it('returns 404 when project does not exist', async () => {
    mockProjectSingle.mockResolvedValue({ data: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p999' }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when user is neither project owner nor org member', async () => {
    mockProjectSingle.mockResolvedValue({
      data: { id: 'p1', project_name: 'Alpha', client_name: 'Acme', slug: 'alpha', user_id: 'other_user', org_id: null },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(403)
  })

  it('sends reminder successfully when user is project owner', async () => {
    mockProjectSingle.mockResolvedValue({
      data: { id: 'p1', project_name: 'Alpha', client_name: 'Acme', slug: 'alpha', user_id: 'u1', org_id: null },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['owner@agency.com'],
        subject: expect.stringContaining('Alpha'),
      })
    )
  })

  it('sends reminder successfully when user is organization member', async () => {
    mockProjectSingle.mockResolvedValue({
      data: { id: 'p1', project_name: 'Beta', client_name: 'Stark', slug: 'beta', user_id: 'creator_u2', org_id: 'org_123' },
    })
    mockOrgMemberMaybeSingle.mockResolvedValue({ data: { id: 'mem_1' } })

    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
