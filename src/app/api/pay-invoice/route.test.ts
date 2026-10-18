import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCheckoutCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test_invoice' })

vi.mock('stripe', () => {
  const MockStripe = function MockStripe() {
    return {
      checkout: { sessions: { create: mockCheckoutCreate } },
    }
  }
  return { default: MockStripe }
})

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
    mockOwnerSingle.mockResolvedValue({ data: { name: 'Studio One' } })
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
    expect(data.error).toBe('Already paid')
  })

  it('fails closed with 503 PAYMENTS_UNAVAILABLE to prevent collecting client funds into platform account without Connect', async () => {
    const { POST } = await import('./route')
    const res = await POST(makeRequest({ invoiceId: 'inv_123' }))
    expect(res.status).toBe(503)
    const data = await res.json()
    expect(data.code).toBe('PAYMENTS_UNAVAILABLE')
    expect(data.disabled).toBe(true)
    expect(mockCheckoutCreate).not.toHaveBeenCalled()
  })
})
