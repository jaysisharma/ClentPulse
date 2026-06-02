import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock state ────────────────────────────────────────────────────────────────

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

const mockCreateUser = vi.fn()
const mockUpdateUserById = vi.fn()
const mockListUsers = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    auth: {
      admin: {
        createUser: mockCreateUser,
        updateUserById: mockUpdateUserById,
        listUsers: mockListUsers,
      },
    },
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/create-client', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/create-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ email: 'c@x.com', password: 'secret1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when password is too short', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ email: 'c@x.com', password: 'abc' }))
    expect(res.status).toBe(400)
  })

  it('creates a new client account for a fresh email', async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: 'client1' } }, error: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ email: 'new@x.com', password: 'secret1' }))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.created).toBe(true)
  })

  it('returns 409 without resetting the password when email already exists', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'Email already registered' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ email: 'existing@x.com', password: 'secret1' }))
    const json = await res.json()

    expect(res.status).toBe(409)
    expect(json.existed).toBe(true)
    // SECURITY: must NOT reset the existing user's password (account takeover prevention)
    expect(mockUpdateUserById).not.toHaveBeenCalled()
    expect(mockListUsers).not.toHaveBeenCalled()
  })

  it('returns 500 for other createUser errors', async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: 'Database unavailable' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ email: 'x@x.com', password: 'secret1' }))
    expect(res.status).toBe(500)
  })
})
