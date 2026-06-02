import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock state ────────────────────────────────────────────────────────────────

const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
const mockCustomerCreate = vi.fn().mockResolvedValue({ id: 'cus_new' })

vi.mock('stripe', () => {
  const MockStripe = function MockStripe() {
    return {
      checkout: { sessions: { create: mockCheckoutCreate } },
      customers: { create: mockCustomerCreate },
    }
  }
  return { default: MockStripe }
})

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))
const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
  update: mockUpdate,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/create-checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/create-checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_PRO_PRICE_ID = 'price_monthly'
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID = 'price_annual'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u@example.com' } } })
    mockSingle.mockResolvedValue({ data: { stripe_customer_id: 'cus_existing', email: 'u@example.com' } })
    mockCheckoutCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ billing: 'monthly' }))
    expect(res.status).toBe(401)
  })

  it('uses the monthly price ID for monthly billing', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest({ billing: 'monthly' }))
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_monthly', quantity: 1 }],
      })
    )
  })

  it('uses the annual price ID for annual billing', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest({ billing: 'annual' }))
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_annual', quantity: 1 }],
      })
    )
  })

  it('defaults to monthly when billing param is missing or invalid', async () => {
    const { POST } = await import('./route')
    await POST(makeRequest({}))
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: 'price_monthly', quantity: 1 }],
      })
    )
  })

  it('returns 500 when the price ID env var is missing', async () => {
    delete process.env.STRIPE_PRO_ANNUAL_PRICE_ID
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ billing: 'annual' }))
    expect(res.status).toBe(500)
  })

  it('creates a Stripe customer when none exists yet', async () => {
    mockSingle.mockResolvedValue({ data: { stripe_customer_id: null, email: 'u@example.com' } })
    const { POST } = await import('./route')
    await POST(makeRequest({ billing: 'monthly' }))
    expect(mockCustomerCreate).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({ stripe_customer_id: 'cus_new' })
  })

  it('returns the Stripe checkout URL on success', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ billing: 'monthly' }))
    const json = await res.json()
    expect(json).toEqual({ url: 'https://checkout.stripe.com/test' })
  })
})
