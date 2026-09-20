import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'msg_123' }, error: null })
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return {
      emails: {
        send: mockSend,
      },
    }
  }),
}))

const mockGetUser = vi.fn()
const mockProjectSingle = vi.fn()
const mockOwnerSingle = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockProjectSingle,
    }
  }
  if (table === 'users') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockOwnerSingle,
    }
  }
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/remind-client', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/remind-client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user_1', email: 'freelancer@example.com' } } })
    mockOwnerSingle.mockResolvedValue({ data: { name: 'Alex Freelancer', email: 'freelancer@example.com' } })
    mockProjectSingle.mockResolvedValue({
      data: {
        id: 'p1',
        project_name: 'Acme Redesign',
        client_name: 'Sarah Client',
        client_email: 'sarah@acme.corp',
        slug: 'acme-redesign',
        waiting_reason: 'Awaiting Stripe API Keys',
        user_id: 'user_1',
      },
    })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when missing projectId', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing projectId')
  })

  it('returns 404 if project is not found or does not belong to user', async () => {
    mockProjectSingle.mockResolvedValue({ data: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p_not_found' }))
    expect(res.status).toBe(404)
  })

  it('returns 400 if client has no email configured', async () => {
    mockProjectSingle.mockResolvedValue({
      data: {
        id: 'p1',
        project_name: 'Acme Redesign',
        client_name: 'Sarah Client',
        client_email: null,
        slug: 'acme-redesign',
      },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('No client email')
  })

  it('successfully sends email via Resend and returns success', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ projectId: 'p1' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)

    expect(mockSend).toHaveBeenCalledTimes(1)
    const emailPayload = mockSend.mock.calls[0][0]
    expect(emailPayload.to).toEqual(['sarah@acme.corp'])
    expect(emailPayload.subject).toContain('Acme Redesign')
    expect(emailPayload.html).toContain('Awaiting Stripe API Keys')
    expect(emailPayload.html).toContain('Acme Redesign')
  })
})
