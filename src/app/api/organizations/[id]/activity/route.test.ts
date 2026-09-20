import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
let mockMembership: { role: string } | null = { role: 'member' }
let mockLogs: any[] = []

const mockFrom = vi.fn((table: string) => {
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockMembership })),
    }
  }

  if (table === 'activity_logs') {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockImplementation((limitCount: number) =>
              Promise.resolve({
                data: mockLogs.slice(0, limitCount),
                error: null,
              })
            ),
          }),
        }),
      }),
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

describe('GET /api/organizations/[id]/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMembership = { role: 'member' }
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'dev@agency.com' } } })
    mockLogs = [
      {
        id: 'log-1',
        org_id: 'org-123',
        action: 'update.published',
        entity_type: 'update',
        created_at: new Date().toISOString(),
      },
      {
        id: 'log-2',
        org_id: 'org-123',
        action: 'comment.internal',
        entity_type: 'comment',
        created_at: new Date().toISOString(),
      },
    ]
  })

  it('rejects unauthenticated requests with 401', async () => {
    const { GET } = await import('./route')
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const req = new Request('http://localhost/api/organizations/org-123/activity')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(401)
  })

  it('rejects non-members of the organization with 403', async () => {
    const { GET } = await import('./route')
    mockMembership = null
    const req = new Request('http://localhost/api/organizations/org-123/activity')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(403)
  })

  it('returns activity logs for organization members', async () => {
    const { GET } = await import('./route')
    const req = new Request('http://localhost/api/organizations/org-123/activity?limit=10')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.activities).toHaveLength(2)
    expect(json.activities[0].action).toBe('update.published')
  })
})
