import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAccess, mockInsert, mockRateLimit, mockNotify } = vi.hoisted(() => ({
  mockAccess: vi.fn(),
  mockInsert: vi.fn(),
  mockRateLimit: vi.fn(),
  mockNotify: vi.fn(),
}))

vi.mock('@/lib/project-access', () => ({ getProjectAccess: (...a: any[]) => mockAccess(...a) }))
vi.mock('@/lib/rate-limit', () => ({ rateLimit: (...a: any[]) => mockRateLimit(...a) }))
vi.mock('@/lib/notifications', () => ({ notifyFreelancerOfFeedback: (...a: any[]) => mockNotify(...a) }))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ insert: (...a: any[]) => mockInsert(...a) }) }),
}))

import { POST } from './route'

function send(body: object) {
  return POST(new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRateLimit.mockResolvedValue({ success: true, resetIn: 0 })
    mockAccess.mockResolvedValue({ canActAsClient: true })
    mockInsert.mockResolvedValue({ error: null })
    mockNotify.mockResolvedValue(undefined)
  })

  it('records feedback and notifies the studio', async () => {
    const res = await send({ projectId: 'p1', type: 'question', message: '  When is launch? ' })
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith({ project_id: 'p1', type: 'question', message: 'When is launch?' })
    expect(mockNotify).toHaveBeenCalledOnce()
  })

  it('rejects unknown feedback types and oversized messages', async () => {
    expect((await send({ projectId: 'p1', type: 'spam' })).status).toBe(400)
    expect((await send({ projectId: 'p1', type: 'question', message: 'x'.repeat(2001) })).status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('throttles repeat submissions so the studio inbox can’t be flooded', async () => {
    mockRateLimit.mockResolvedValue({ success: false, resetIn: 1000 })
    expect((await send({ projectId: 'p1', type: 'thumbs_up' })).status).toBe(429)
    expect(mockNotify).not.toHaveBeenCalled()
  })

  it('requires portal access for passcode-protected projects', async () => {
    mockAccess.mockResolvedValue({ canActAsClient: false })
    expect((await send({ projectId: 'p1', type: 'thumbs_up' })).status).toBe(401)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('404s for an unknown project', async () => {
    mockAccess.mockResolvedValue(null)
    expect((await send({ projectId: 'nope', type: 'thumbs_up' })).status).toBe(404)
  })
})
