import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockInsertOrg = vi.fn()
const mockInsertMember = vi.fn()
const mockSelect = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'organizations') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }), // no slug conflict
      insert: mockInsertOrg,
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          {
            role: 'owner',
            org_id: 'org-123',
            organization: { id: 'org-123', name: 'Nova Studios', slug: 'nova-studios' },
          },
        ],
        error: null,
      }),
      insert: mockInsertMember,
    }
  }
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeRequest(body: object, method = 'POST'): Request {
  return new Request('http://localhost/api/organizations', {
    method,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/organizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc', email: 'owner@agency.com' } } })
    mockInsertOrg.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'org-123', name: 'Nova Studios', slug: 'nova-studios' },
          error: null,
        }),
      }),
    })
    mockInsertMember.mockResolvedValue({ error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET, POST } = await import('./route')
    const getRes = await GET()
    expect(getRes.status).toBe(401)
    const postRes = await POST(makeRequest({ name: 'Test' }))
    expect(postRes.status).toBe(401)
  })

  it('lists user organization memberships on GET', async () => {
    const { GET } = await import('./route')
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.memberships).toHaveLength(1)
    expect(json.memberships[0].role).toBe('owner')
  })

  it('rejects POST with empty name with 400', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ name: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('name is required')
  })

  it('creates organization and adds user as owner in organization_members on POST', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ name: 'Nova Studios' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.organization.name).toBe('Nova Studios')

    expect(mockInsertOrg).toHaveBeenCalledTimes(1)
    expect(mockInsertMember).toHaveBeenCalledWith({
      org_id: 'org-123',
      user_id: 'user-abc',
      role: 'owner',
    })
  })
})
