import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test_co', id: 'cs_test_co' })

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: mockCheckoutCreate } },
  },
}))

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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
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
        title: 'Extra scope',
        description: 'Extra scope item',
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
        id: 'usr_owner',
        name: 'Studio Owner',
        stripe_account_id: 'acct_owner123',
        stripe_charges_enabled: true,
      },
    })
  })

  it('returns 400 STRIPE_CONNECT_INCOMPLETE when creator has not onboarded Stripe Connect', async () => {
    mockUserSingle.mockResolvedValue({
      data: {
        id: 'usr_owner',
        name: 'Studio Owner',
        stripe_account_id: null,
        stripe_charges_enabled: false,
      },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}), { params: Promise.resolve({ id: 'co_123' }) })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('STRIPE_CONNECT_INCOMPLETE')
    expect(mockCheckoutCreate).not.toHaveBeenCalled()
  })

  it('creates Stripe checkout session with direct charge on connected account when owner is onboarded', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}), { params: Promise.resolve({ id: 'co_123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/test_co')
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        metadata: expect.objectContaining({
          changeOrderId: 'co_123',
          ownerStripeAccountId: 'acct_owner123',
        }),
      }),
      { stripeAccount: 'acct_owner123' }
    )
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
