import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockUpdate = vi.fn()
const mockLogAgencyActivity = vi.fn()

vi.mock('@/lib/activity', () => ({
  logAgencyActivity: (...args: any[]) => mockLogAgencyActivity(...args),
}))

let mockCallerRole = 'member'
let mockProjectUserId = 'owner-123'
let mockOrgId: string | null = 'org-123'

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'proj-123',
            user_id: mockProjectUserId,
            org_id: mockOrgId,
            project_name: 'Stripe Integration',
          },
          error: null,
        }),
      }),
    }
  }

  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({
        data: mockCallerRole ? { role: mockCallerRole } : null,
      })),
    }
  }

  if (table === 'updates') {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'up-456', project_id: 'proj-123', review_status: 'draft' },
              error: null,
            }),
          }),
        }),
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

function createRequest(body: object) {
  return new Request('http://localhost/api/projects/proj-123/updates/up-456/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/projects/[id]/updates/[updateId]/review', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallerRole = 'member'
    mockProjectUserId = 'owner-123'
    mockOrgId = 'org-123'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'specialist-99', email: 'spec@agency.com' } } })
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'up-456', review_status: 'review_ready' },
            error: null,
          }),
        }),
      }),
    })
  })

  it('allows a team specialist to submit an update for review', async () => {
    const { POST } = await import('./route')
    const req = createRequest({ action: 'submit_for_review' })
    const res = await POST(req, {
      params: Promise.resolve({ id: 'proj-123', updateId: 'up-456' }),
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ review_status: 'review_ready' })
    )
    expect(mockLogAgencyActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'update.review_submitted',
        orgId: 'org-123',
      })
    )
  })

  it('rejects draft approval by a member role without PM/owner rights', async () => {
    const { POST } = await import('./route')
    mockCallerRole = 'member'
    const req = createRequest({ action: 'approve_draft' })
    const res = await POST(req, {
      params: Promise.resolve({ id: 'proj-123', updateId: 'up-456' }),
    })

    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('only project owner or agency admins')
  })

  it('allows an agency admin/PM to approve a draft', async () => {
    const { POST } = await import('./route')
    mockCallerRole = 'admin'
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'up-456', review_status: 'approved', approved_by: 'specialist-99' },
            error: null,
          }),
        }),
      }),
    })

    const req = createRequest({ action: 'approve_draft' })
    const res = await POST(req, {
      params: Promise.resolve({ id: 'proj-123', updateId: 'up-456' }),
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        review_status: 'approved',
        approved_by: 'specialist-99',
      })
    )
    expect(mockLogAgencyActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'update.approved',
        orgId: 'org-123',
      })
    )
  })
})
