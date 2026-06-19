import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock state (declared before vi.mock hoisting) ─────────────────────────────

const mockConstructEvent = vi.fn()
const mockPortalCreate = vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/portal/test' })
const mockResendSend = vi.fn().mockResolvedValue({ error: null })

// ── Module mocks (hoisted by Vitest) ─────────────────────────────────────────

vi.mock('stripe', () => {
  const MockStripe = function MockStripe() {
    return {
      webhooks: { constructEvent: mockConstructEvent },
      billingPortal: { sessions: { create: mockPortalCreate } },
    }
  }
  return { default: MockStripe }
})

vi.mock('resend', () => ({
  Resend: function Resend() {
    return { emails: { send: mockResendSend } }
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: () => 'test-signature' }),
}))

const mockSupabaseUpdateEq = vi.fn().mockResolvedValue({ error: null })
const mockSupabaseUpdate = vi.fn(() => ({ eq: mockSupabaseUpdateEq }))
const mockSupabaseMaybeSingle = vi.fn().mockResolvedValue({
  data: { email: 'test@example.com', name: 'Test User' },
})
const mockSupabaseEq = vi.fn().mockReturnThis()
const mockSupabaseSelect = vi.fn().mockReturnThis()
const mockSupabaseFrom = vi.fn(() => ({
  select: mockSupabaseSelect,
  eq: mockSupabaseEq,
  maybeSingle: mockSupabaseMaybeSingle,
  update: mockSupabaseUpdate,
}))
const mockSupabase = { from: mockSupabaseFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue(mockSupabase),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(): Request {
  return new Request('http://localhost/api/stripe-webhook', {
    method: 'POST',
    body: 'raw-body',
    headers: { 'stripe-signature': 'test-signature' },
  })
}

function makeEvent(type: string, data: object) {
  return { type, data: { object: data } }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/stripe-webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResendSend.mockResolvedValue({ error: null })
    mockPortalCreate.mockResolvedValue({ url: 'https://billing.stripe.com/portal/test' })
    mockSupabaseMaybeSingle.mockResolvedValue({ data: { email: 'test@example.com', name: 'Test User' } })
    mockSupabaseUpdateEq.mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      eq: mockSupabaseEq,
      maybeSingle: mockSupabaseMaybeSingle,
      update: mockSupabaseUpdate,
    })
    mockSupabaseUpdate.mockReturnValue({ eq: mockSupabaseUpdateEq })
  })

  it('returns 400 on invalid webhook signature', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid signature') })
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })

  it('grants Pro on checkout.session.completed for subscription', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('checkout.session.completed', { customer: 'cus_123', metadata: {} })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'pro' })
  })

  it('marks invoice paid on checkout.session.completed for invoice_payment', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('checkout.session.completed', {
        customer: 'cus_123',
        metadata: { type: 'invoice_payment', invoice_id: 'inv_abc' },
      })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paid', paid_at: expect.any(String) })
    )
  })

  it('revokes Pro on customer.subscription.deleted', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.deleted', { customer: 'cus_123' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'free' })
  })

  it('keeps Pro on subscription.updated with active status', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', { customer: 'cus_123', status: 'active' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'pro' })
  })

  it('keeps Pro on subscription.updated with trialing status', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', { customer: 'cus_123', status: 'trialing' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'pro' })
  })

  it('keeps Pro during past_due grace window (does not strip access mid-retry)', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', { customer: 'cus_123', status: 'past_due' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'pro' })
  })

  it('revokes Pro on subscription.updated with a terminal status (canceled)', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('customer.subscription.updated', { customer: 'cus_123', status: 'canceled' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ plan: 'free' })
  })

  it('sends recovery email on invoice.payment_failed', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('invoice.payment_failed', { customer: 'cus_123' })
    )
    const { POST } = await import('./route')
    await POST(makeRequest())
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['test@example.com'],
        subject: expect.stringContaining('payment method'),
      })
    )
  })

  it('skips the email (no crash) when no user maps to the customer on payment_failed', async () => {
    mockSupabaseMaybeSingle.mockResolvedValueOnce({ data: null })
    mockConstructEvent.mockReturnValue(
      makeEvent('invoice.payment_failed', { customer: 'cus_orphan' })
    )
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('still returns 200 if Resend fails on invoice.payment_failed', async () => {
    mockResendSend.mockResolvedValueOnce({ error: new Error('Resend down') })
    mockConstructEvent.mockReturnValue(
      makeEvent('invoice.payment_failed', { customer: 'cus_123' })
    )
    const { POST } = await import('./route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ received: true })
  })
})
