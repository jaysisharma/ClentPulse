import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock state ────────────────────────────────────────────────────────────────

type Filters = Record<string, unknown>
type Resolver = (filters: Filters) => unknown

/** Minimal chainable query builder: records eq/ilike filters, resolves via `resolve`. */
function queryBuilder(resolve: Resolver) {
  const filters: Filters = {}
  const builder: any = {
    select: () => builder,
    eq: (col: string, val: unknown) => { filters[col] = val; return builder },
    ilike: (col: string, val: unknown) => { filters[col] = val; return builder },
    single: async () => ({ data: resolve(filters) }),
    maybeSingle: async () => ({ data: resolve(filters) }),
    then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve({ data: resolve(filters) }).then(onFulfilled),
  }
  return builder
}

let sessionProject: unknown
let existingUser: unknown
let existingRole: string | undefined
let linkedProjects: { user_id: string; org_id: string | null }[]
let memberships: { org_id: string }[]

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: () => queryBuilder(() => sessionProject),
  })),
}))

const mockCreateUser = vi.fn()
const mockUpdateUserById = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => queryBuilder(filters => {
      if (table === 'users') return existingUser
      if (table === 'organization_members') return memberships
      if (table === 'projects') return 'client_user_id' in filters ? linkedProjects : []
      return null
    }),
    auth: {
      admin: {
        getUserById: vi.fn(async () => ({ data: { user: { user_metadata: { role: existingRole } } } })),
        createUser: mockCreateUser,
        updateUserById: mockUpdateUserById,
      },
    },
  })),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(async () => ({ success: true, resetIn: 0 })),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/client-access', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/client-access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'me', email: 'me@studio.com' } } })
    mockCreateUser.mockResolvedValue({ error: null })
    mockUpdateUserById.mockResolvedValue({ error: null })
    sessionProject = { client_email: 'client@acme.com' }
    existingUser = null
    existingRole = 'client'
    linkedProjects = []
    memberships = []
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(401)
  })

  it('returns 404 when the caller does not own the project', async () => {
    sessionProject = null
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(404)
  })

  it('creates a client account for a new email', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(200)
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'client@acme.com',
      user_metadata: { role: 'client' },
    }))
  })

  it('never touches an existing account in createOnly mode', async () => {
    existingUser = { id: 'c1' }
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1', createOnly: true }))
    expect(res.status).toBe(409)
    expect((await res.json()).existed).toBe(true)
    expect(mockUpdateUserById).not.toHaveBeenCalled()
  })

  it('refuses to reset a non-client (freelancer) account', async () => {
    existingUser = { id: 'c1' }
    existingRole = undefined
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(409)
    expect(mockUpdateUserById).not.toHaveBeenCalled()
  })

  it('refuses to reset a client shared with another studio', async () => {
    existingUser = { id: 'c1' }
    linkedProjects = [{ user_id: 'me', org_id: null }, { user_id: 'other-studio', org_id: null }]
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(409)
    expect(mockUpdateUserById).not.toHaveBeenCalled()
  })

  it('resets a client whose projects all belong to the caller or their orgs', async () => {
    existingUser = { id: 'c1' }
    memberships = [{ org_id: 'org-1' }]
    linkedProjects = [{ user_id: 'me', org_id: null }, { user_id: 'teammate', org_id: 'org-1' }]
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1', password: 'secret1' }))
    expect(res.status).toBe(200)
    expect(mockUpdateUserById).toHaveBeenCalledWith('c1', { password: 'secret1' })
  })
})
