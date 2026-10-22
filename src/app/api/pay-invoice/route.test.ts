import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test_invoice', id: 'cs_test_123' })

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: mockCheckoutCreate } },
  },
}))

const mockInvoiceSingle = vi.fn()
const mockOwnerSingle = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'invoices') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockInvoiceSingle,
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
    from: mockFrom,
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/pay-invoice', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/pay-invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    mockOwnerSingle.mockResolvedValue({
      data: {
        id: 'usr_1',
        name: 'Studio One',
        stripe_account_id: 'acct_test123',
        stripe_charges_enabled: true,
      },
    })
    mockInvoiceSingle.mockResolvedValue({
      data: {
        id: 'inv_123',
        invoice_number: 'INV-001',
        client_name: 'Big Corp',
        client_email: 'finance@bigcorp.com',
        items: [{ amount: 1000, description: 'Brand Identity' }],
        status: 'sent',
        user_id: 'usr_1',
        currency: 'EUR',
        tax_rate: 20,
        is_deposit: true,
        project_id: 'proj_abc',
      },
    })
  })

  it('returns 400 when missing invoiceId', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing invoiceId')
  })

  it('returns 404 when invoice is not found', async () => {
    mockInvoiceSingle.mockResolvedValue({ data: null })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ invoiceId: 'inv_none' }))
    expect(res.status).toBe(404)
  })

  it('returns 400 when invoice is already paid', async () => {
    mockInvoiceSingle.mockResolvedValue({
      data: {
        id: 'inv_paid',
        status: 'paid',
        items: [{ amount: 500 }],
      },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ invoiceId: 'inv_paid' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('already been paid')
  })

  it('returns 400 STRIPE_CONNECT_INCOMPLETE when creator has not onboarded Stripe Connect', async () => {
    mockOwnerSingle.mockResolvedValue({
      data: {
        id: 'usr_1',
        name: 'Studio One',
        stripe_account_id: null,
        stripe_charges_enabled: false,
      },
    })
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ invoiceId: 'inv_123' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.code).toBe('STRIPE_CONNECT_INCOMPLETE')
    expect(mockCheckoutCreate).not.toHaveBeenCalled()
  })

  it('creates Stripe checkout session with destination charge and 0 fee when owner is onboarded', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ invoiceId: 'inv_123' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.url).toBe('https://checkout.stripe.com/test_invoice')
    expect(mockCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        payment_intent_data: expect.objectContaining({
          application_fee_amount: 0,
          transfer_data: {
            destination: 'acct_test123',
          },
        }),
      })
    )
  })
})
