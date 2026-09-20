import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

let mockProjectData: any = null
let mockResourcesData: any = []
let mockInsertResult: any = { data: null, error: null }
let mockDeleteResult: any = { error: null }

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockProjectData, error: null }),
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
  }
  if (table === 'project_resources') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockResourcesData, error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockInsertResult),
      delete: vi.fn().mockReturnThis(),
    }
  }
  return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeGetRequest(projectId: string): Request {
  return new Request(`http://localhost:3000/api/project-resources?projectId=${projectId}`)
}

function makePostRequest(body: object): Request {
  return new Request('http://localhost:3000/api/project-resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/project-resources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'owner-user' } } })
    mockProjectData = { user_id: 'owner-user', org_id: null }
    mockResourcesData = [
      { id: 'r1', provider: 'google_drive', name: 'Brand Guidelines.pdf', show_in_portal: true },
    ]
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const res = await GET(makeGetRequest('proj-1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when projectId is missing', async () => {
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost:3000/api/project-resources'))
    expect(res.status).toBe(400)
  })

  it('returns 403 when user does not own the project', async () => {
    mockProjectData = { user_id: 'someone-else', org_id: null }
    const { GET } = await import('./route')
    const res = await GET(makeGetRequest('proj-1'))
    expect(res.status).toBe(403)
  })

  it('returns resources for the project owner', async () => {
    const { GET } = await import('./route')
    const res = await GET(makeGetRequest('proj-1'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.resources)).toBe(true)
  })
})

describe('POST /api/project-resources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'owner-user' } } })
    mockProjectData = { user_id: 'owner-user', org_id: null }
    mockInsertResult = {
      data: {
        id: 'new-res-1',
        project_id: 'proj-1',
        provider: 'google_drive',
        resource_type: 'file',
        external_id: 'drive-file-id',
        name: 'Design.pdf',
        show_in_portal: true,
      },
      error: null,
    }
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makePostRequest({ projectId: 'proj-1', provider: 'google_drive', resourceType: 'file', externalId: 'x', name: 'Test' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makePostRequest({ projectId: 'proj-1' })) // missing provider, resourceType, etc.
    expect(res.status).toBe(400)
  })

  it('returns 403 when user does not own the project', async () => {
    mockProjectData = { user_id: 'other-user', org_id: null }
    const { POST } = await import('./route')
    const res = await POST(makePostRequest({
      projectId: 'proj-1', provider: 'google_drive', resourceType: 'file',
      externalId: 'drive-id', name: 'Design.pdf',
    }))
    expect(res.status).toBe(403)
  })

  it('returns 201 and the created resource on success', async () => {
    const { POST } = await import('./route')
    const res = await POST(makePostRequest({
      projectId: 'proj-1', provider: 'google_drive', resourceType: 'file',
      externalId: 'drive-id', name: 'Design.pdf',
    }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.id).toBe('new-res-1')
    expect(data.provider).toBe('google_drive')
  })
})
