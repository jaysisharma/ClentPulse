import { describe, it, expect, vi, beforeEach } from 'vitest'

let mockChangeOrder: any = null
let mockAccess: any = null
const mockUpdate = vi.fn()

vi.mock('@/lib/project-access', () => ({
  getProjectAccess: vi.fn(async () => mockAccess),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => {
      const q: any = {
        select: () => q,
        eq: () => q,
        maybeSingle: async () => ({ data: mockChangeOrder, error: null }),
        update: (payload: any) => {
          mockUpdate(payload)
          const u: any = {
            eq: () => u,
            select: () => u,
            single: async () => ({ data: { ...mockChangeOrder, ...payload }, error: null }),
          }
          return u
        },
      }
      return q
    },
  }),
}))

import { POST } from './route'

function review(body: object) {
  return POST(
    new Request('http://localhost:3000/api/change-orders/co-123/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'co-123' }) }
  )
}

describe('POST /api/change-orders/[id]/review', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangeOrder = { id: 'co-123', project_id: 'proj-1', status: 'pending' }
    mockAccess = { canActAsClient: true, isWorkspaceMember: false }
  })

  it('rejects invalid actions', async () => {
    const res = await review({ action: 'maybe' })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/approve or decline/i)
  })

  it('approves a pending change order', async () => {
    const res = await review({ action: 'approve' })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.changeOrder.status).toBe('approved')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved', approved_at: expect.any(String) }))
  })

  it('declines with notes', async () => {
    const res = await review({ action: 'decline', notes: 'Too expensive' })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'declined', client_notes: 'Too expensive' })
  })

  it('requires portal access (passcode ticket) when the project is gated', async () => {
    mockAccess = { canActAsClient: false, isWorkspaceMember: false }
    const res = await review({ action: 'approve' })
    expect(res.status).toBe(401)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('does not expose draft change orders', async () => {
    mockChangeOrder = { ...mockChangeOrder, status: 'draft' }
    const res = await review({ action: 'approve' })
    expect(res.status).toBe(404)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('refuses to re-review an already decided or paid change order', async () => {
    mockChangeOrder = { ...mockChangeOrder, status: 'paid' }
    const res = await review({ action: 'decline' })
    expect(res.status).toBe(400)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
