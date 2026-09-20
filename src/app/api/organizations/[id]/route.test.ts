import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()

let mockMembershipData: any = null
let mockExistingDomainData: any = null

const mockFrom = vi.fn((table: string) => {
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockMembershipData, error: null })),
    }
  }
  if (table === 'organizations') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockExistingDomainData, error: null })),
      single: vi.fn().mockResolvedValue({
        data: { id: 'org-123', name: 'Nova Studios', slug: 'nova-studios' },
        error: null,
      }),
      update: mockUpdate,
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

function makeRequest(body: object, method = 'PATCH'): Request {
  return new Request('http://localhost/api/organizations/org-123', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/organizations/[id] PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner', email: 'owner@agency.com' } } })
    mockMembershipData = { role: 'owner' }
    mockExistingDomainData = null

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => Promise.resolve({
            data: {
              id: 'org-123',
              name: 'Nova Studios',
              white_label: true,
              accent_color: '#10B981',
              custom_domain: 'status.novastudios.com',
            },
            error: null,
          })),
        }),
      }),
    })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({ white_label: true }), { params: Promise.resolve({ id: 'org-123' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is only a regular member', async () => {
    mockMembershipData = { role: 'member' }
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({ white_label: true }), { params: Promise.resolve({ id: 'org-123' }) })
    expect(res.status).toBe(403)
  })

  it('rejects reserved system domains like frevio.app with 400', async () => {
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({ custom_domain: 'portal.frevio.app' }), { params: Promise.resolve({ id: 'org-123' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('reserved')
  })

  it('rejects invalid domain format with 400', async () => {
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({ custom_domain: 'not a domain!' }), { params: Promise.resolve({ id: 'org-123' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Invalid domain format')
  })

  it('returns 409 conflict when custom domain is already claimed', async () => {
    mockExistingDomainData = { id: 'other-org-456' }
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({ custom_domain: 'status.claimed.com' }), { params: Promise.resolve({ id: 'org-123' }) })
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('already claimed')
  })

  it('successfully updates white-label, accent color, and custom domain', async () => {
    const { PATCH } = await import('./route')
    const res = await PATCH(makeRequest({
      white_label: true,
      accent_color: '#10B981',
      custom_domain: 'https://status.novastudios.com/',
    }), { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.organization.white_label).toBe(true)
    expect(json.organization.accent_color).toBe('#10B981')
    expect(json.organization.custom_domain).toBe('status.novastudios.com')
  })
})
