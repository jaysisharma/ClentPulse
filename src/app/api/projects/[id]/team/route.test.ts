import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockUpsert = vi.fn()
const mockDelete = vi.fn()

let mockProjectData: any = null
let mockOrgMemberData: any = null
let mockTeamMembersData: any = []

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: mockProjectData, error: mockProjectData ? null : { message: 'Not found' } })),
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockOrgMemberData, error: null })),
    }
  }
  if (table === 'project_team_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve({ data: mockTeamMembersData, error: null })),
      upsert: mockUpsert,
      delete: mockDelete,
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

function makeRequest(body?: object, method = 'POST', url = 'http://localhost/api/projects/proj-123/team'): Request {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/projects/[id]/team', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner', email: 'owner@agency.com' } } })
    mockProjectData = { id: 'proj-123', user_id: 'user-owner', org_id: 'org-abc' }
    mockOrgMemberData = null
    mockTeamMembersData = [
      {
        id: 'ptm-1',
        project_id: 'proj-123',
        user_id: 'user-specialist',
        role_title: 'Lead Architect',
        user: { id: 'user-specialist', name: 'Alice Smith', email: 'alice@agency.com' },
      },
    ]

    mockUpsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'ptm-2',
            project_id: 'proj-123',
            user_id: 'user-dev',
            role_title: 'Frontend Engineer',
            user: { id: 'user-dev', name: 'Bob Jones' },
          },
          error: null,
        }),
      }),
    })

    mockDelete.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
  })

  it('GET returns team members for project', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeRequest(undefined, 'GET'), { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.teamMembers).toHaveLength(1)
    expect(json.teamMembers[0].role_title).toBe('Lead Architect')
  })

  it('POST returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ userId: 'user-dev' }), { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(401)
  })

  it('POST returns 404 when project does not exist', async () => {
    mockProjectData = null
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ userId: 'user-dev' }), { params: Promise.resolve({ id: 'proj-999' }) })
    expect(res.status).toBe(404)
  })

  it('POST returns 403 when user is not owner and not org admin', async () => {
    mockProjectData = { id: 'proj-123', user_id: 'different-creator', org_id: 'org-abc' }
    mockOrgMemberData = { role: 'member' } // only regular member, not owner/admin
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ userId: 'user-dev' }), { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(403)
  })

  it('POST allows org admin to staff specialist into pod', async () => {
    mockProjectData = { id: 'proj-123', user_id: 'different-creator', org_id: 'org-abc' }
    mockOrgMemberData = { role: 'admin' }
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ userId: 'user-dev', roleTitle: 'Frontend Engineer' }), {
      params: Promise.resolve({ id: 'proj-123' }),
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.member.role_title).toBe('Frontend Engineer')
  })

  it('POST returns 400 when userId is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ roleTitle: 'Frontend Engineer' }), {
      params: Promise.resolve({ id: 'proj-123' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('userId is required')
  })

  it('DELETE returns 400 when userId query param is missing', async () => {
    const { DELETE } = await import('./route')
    const res = await DELETE(makeRequest(undefined, 'DELETE', 'http://localhost/api/projects/proj-123/team'), {
      params: Promise.resolve({ id: 'proj-123' }),
    })
    expect(res.status).toBe(400)
  })

  it('DELETE successfully removes member when caller has permission', async () => {
    const { DELETE } = await import('./route')
    const res = await DELETE(makeRequest(undefined, 'DELETE', 'http://localhost/api/projects/proj-123/team?userId=user-dev'), {
      params: Promise.resolve({ id: 'proj-123' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
