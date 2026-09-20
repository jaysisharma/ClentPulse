import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockTrackActivation = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({ insert: mockInsert })),
  }),
}))

vi.mock('@/lib/activation', () => ({
  trackActivationEvent: mockTrackActivation,
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/activation', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/activation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockTrackActivation.mockResolvedValue(true)
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ eventName: 'project_created' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when eventName is missing', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('eventName')
  })

  it('returns 200 and records event for authenticated user', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ eventName: 'project_created', projectId: 'proj-1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockTrackActivation).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        eventName: 'project_created',
        projectId: 'proj-1',
      })
    )
  })

  it('returns 200 when optional projectId and metadata are omitted', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ eventName: 'first_update_published' }))
    expect(res.status).toBe(200)
    expect(mockTrackActivation).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'first_update_published',
        projectId: null,
        metadata: {},
      })
    )
  })
})
