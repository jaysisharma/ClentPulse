import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockInviteSingle = vi.fn()
const mockMemberInsert = vi.fn()
const mockInviteUpdate = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'organization_invites') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockInviteSingle,
      update: vi.fn().mockReturnValue({
        eq: mockInviteUpdate.mockResolvedValue({ error: null }),
      }),
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }), // not yet member
      insert: mockMemberInsert.mockResolvedValue({ error: null }),
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

describe('/api/invites/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'usr-new', email: 'dev@studio.com' } } })
    mockInviteSingle.mockResolvedValue({
      data: {
        id: 'inv-1',
        org_id: 'org-abc',
        email: 'dev@studio.com',
        role: 'member',
        status: 'pending',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        org: { id: 'org-abc', name: 'Hyperion Agency', slug: 'hyperion' },
      },
      error: null,
    })
  })

  it('validates a pending invite token on GET', async () => {
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ token: 'tok_valid' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.valid).toBe(true)
    expect(json.invite.organization.name).toBe('Hyperion Agency')
  })

  it('rejects expired invite with 410', async () => {
    mockInviteSingle.mockResolvedValue({
      data: {
        id: 'inv-1',
        org_id: 'org-abc',
        status: 'pending',
        expires_at: new Date(Date.now() - 1000).toISOString(),
      },
      error: null,
    })
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ token: 'tok_expired' }),
    })
    expect(res.status).toBe(410)
  })

  it('adds user to organization_members and accepts invite on POST', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost', { method: 'POST' }), {
      params: Promise.resolve({ token: 'tok_valid' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockMemberInsert).toHaveBeenCalledWith({
      org_id: 'org-abc',
      user_id: 'usr-new',
      role: 'member',
    })
  })
})
