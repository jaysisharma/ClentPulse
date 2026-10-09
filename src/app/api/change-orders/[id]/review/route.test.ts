import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom } = vi.hoisted(() => {
  return {
    mockFrom: vi.fn(),
  }
})

let mockChangeOrder: any = null

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import { POST } from './route'

function makeReviewRequest(id: string, body: object): Request {
  return new Request(`http://localhost:3000/api/change-orders/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/change-orders/[id]/review', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangeOrder = {
      id: 'co-123',
      project_id: 'proj-1',
      amount: 400,
      requires_payment: true,
      status: 'pending',
    }
  })

  it('rejects invalid actions', async () => {
    const res = await POST(
      makeReviewRequest('co-123', { action: 'maybe' }),
      { params: Promise.resolve({ id: 'co-123' }) }
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/approve or decline/i)
  })

  it('approves change order successfully', async () => {
    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'co-123', status: 'approved', approved_at: new Date().toISOString() },
            error: null,
          }),
        }),
      }),
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'change_orders') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockChangeOrder, error: null }),
          update: updateMock,
        } as any
      }
      return {} as any
    })

    const res = await POST(
      makeReviewRequest('co-123', { action: 'approve' }),
      { params: Promise.resolve({ id: 'co-123' }) }
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.changeOrder.status).toBe('approved')
  })
})
