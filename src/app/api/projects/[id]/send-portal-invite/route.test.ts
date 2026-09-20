import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSendPortalInvite = vi.fn()
const mockTrackActivation = vi.fn()

let mockProjectData: any = null
let mockOrgMemberData: any = null
let mockOwnerData: any = null

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: mockProjectData,
          error: mockProjectData ? null : { message: 'Not found' },
        })
      ),
    }
  }
  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: mockOrgMemberData, error: null })
      ),
    }
  }
  if (table === 'users') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() =>
        Promise.resolve({ data: mockOwnerData, error: null })
      ),
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

vi.mock('@/lib/emails/onboarding', () => ({
  sendClientPortalInviteEmail: mockSendPortalInvite,
}))

vi.mock('@/lib/activation', () => ({
  trackActivationEvent: mockTrackActivation,
}))

function makeRequest(body: object, id = 'proj-123'): [Request, { params: Promise<{ id: string }> }] {
  const req = new Request(`http://localhost/api/projects/${id}/send-portal-invite`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  return [req, { params: Promise.resolve({ id }) }]
}

describe('POST /api/projects/[id]/send-portal-invite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner' } } })
    mockProjectData = {
      id: 'proj-123',
      user_id: 'user-owner',
      org_id: null,
      project_name: 'Brand Redesign',
      slug: 'brand-redesign',
      color: '#6366f1',
      passcode: null,
    }
    mockOwnerData = { name: 'Jane Smith', studio_name: null }
    mockOrgMemberData = null
    mockSendPortalInvite.mockResolvedValue({ success: true })
    mockTrackActivation.mockResolvedValue(true)
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when recipientEmail is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({}))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/email/i)
  })

  it('returns 400 when recipientEmail is invalid', async () => {
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when project does not exist', async () => {
    mockProjectData = null
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when caller does not own project and is not org admin', async () => {
    mockProjectData = { ...mockProjectData, user_id: 'different-user', org_id: 'org-abc' }
    mockOrgMemberData = { role: 'member' }
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(403)
  })

  it('returns 200 and sends email for project owner', async () => {
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.portalUrl).toContain('brand-redesign')
    expect(mockSendPortalInvite).toHaveBeenCalledOnce()
    expect(mockTrackActivation).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'client_portal_shared' })
    )
  })

  it('returns 200 for org admin accessing another member project', async () => {
    mockProjectData = { ...mockProjectData, user_id: 'project-creator', org_id: 'org-abc' }
    mockOrgMemberData = { role: 'admin' }
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(200)
  })

  it('returns 500 when email provider fails', async () => {
    mockSendPortalInvite.mockResolvedValue({ success: false, error: 'Resend error' })
    const { POST } = await import('./route')
    const res = await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(res.status).toBe(500)
  })

  it('uses studio_name as sender when available', async () => {
    mockOwnerData = { name: 'Jane Smith', studio_name: 'Jane Studio' }
    const { POST } = await import('./route')
    await POST(...makeRequest({ recipientEmail: 'client@example.com' }))
    expect(mockSendPortalInvite).toHaveBeenCalledWith(
      expect.objectContaining({ freelancerName: 'Jane Studio' })
    )
  })
})
