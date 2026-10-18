import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChangeOrderSingle = vi.fn()
const mockProjectSingle = vi.fn()
const mockUserSingle = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'change_orders') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockChangeOrderSingle,
    }
  }
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
      single: mockUserSingle,
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
    from: mockFrom,
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/change-orders/co_123/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/change-orders/[id]/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChangeOrderSingle.mockResolvedValue({
      data: {
        id: 'co_123',
        status: 'pending',
        amount: 500,
        currency: 'USD',
        description: 'Extra scope',
        project_id: 'proj_abc',
        user_id: 'usr_owner',
      },
    })
    mockProjectSingle.mockResolvedValue({
      data: {
        id: 'proj_abc',
        project_name: 'Project Portal',
        slug: 'portal-1',
        client_email: 'client@example.com',
      },
    })
    mockUserSingle.mockResolvedValue({
      data: {
        name: 'Studio Owner',
      },
    })
  })

  it('fails closed with 503 PAYMENTS_UNAVAILABLE to prevent collecting funds into platform account without Connect', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}), { params: Promise.resolve({ id: 'co_123' }) })
    expect(res.status).toBe(503)
    const json = await res.json()
    expect(json.code).toBe('PAYMENTS_UNAVAILABLE')
    expect(json.disabled).toBe(true)
  })

  it('returns 404 when change order is not found', async () => {
    mockChangeOrderSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}), { params: Promise.resolve({ id: 'co_missing' }) })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Change order not found')
  })

  it('returns 400 when change order is already paid', async () => {
    mockChangeOrderSingle.mockResolvedValue({
      data: {
        id: 'co_123',
        status: 'paid',
        amount: 500,
      },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}), { params: Promise.resolve({ id: 'co_123' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Change order already paid')
  })
})
