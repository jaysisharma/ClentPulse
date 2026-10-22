import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockConstructEvent = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: any[]) => mockConstructEvent(...args),
    },
  },
}))

const mockSingle = vi.fn()
const mockSelect = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockUpdate = vi.fn().mockReturnThis()
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockDelete = vi.fn().mockReturnThis()
const mockMaybeSingle = vi.fn()

const mockFrom = vi.fn((table: string) => {
  if (table === 'processed_stripe_events') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }
  }
  return {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    update: mockUpdate,
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

function makeRequest(body: string, sig = 'sig_test_123'): Request {
  return new Request('http://localhost/api/stripe-connect-webhook', {
    method: 'POST',
    body,
    headers: {
      'stripe-signature': sig,
      'Content-Type': 'application/json',
    },
  })
}

describe('POST /api/stripe-connect-webhook (Direct Charges & Connect)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET = 'whsec_connect_test'
    mockMaybeSingle.mockResolvedValue({ data: null })
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  })

  it('rejects requests without stripe-signature header', async () => {
    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/stripe-connect-webhook', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Missing stripe-signature')
  })

  it('returns duplicate when event status is done', async () => {
    mockConstructEvent.mockReturnValue({ id: 'evt_done_123', type: 'account.updated' })
    mockMaybeSingle.mockResolvedValueOnce({
      data: { event_id: 'evt_done_123', status: 'done', created_at: new Date().toISOString() },
    })

    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.duplicate).toBe(true)
  })

  it('verifies event.account and marks invoice paid on checkout.session.completed', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_direct_1',
      type: 'checkout.session.completed',
      account: 'acct_creator_123',
      data: {
        object: {
          id: 'cs_1',
          amount_total: 10000,
          currency: 'usd',
          payment_intent: 'pi_direct_123',
          metadata: {
            type: 'invoice_payment',
            invoiceId: 'inv_100',
          },
        },
      },
    })

    // Invoice query
    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 'inv_100',
          invoice_number: 'INV-100',
          user_id: 'usr_creator',
          currency: 'usd',
          items: [{ amount: 100 }],
          tax_rate: 0,
          is_deposit: false,
          project_id: 'proj_1',
        },
      })
      // User query
      .mockResolvedValueOnce({
        data: {
          id: 'usr_creator',
          stripe_account_id: 'acct_creator_123',
        },
      })

    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'paid',
        stripe_charge_id: 'pi_direct_123',
      })
    )
  })

  it('rejects and deletes event row if event.account does not match invoice owner', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_direct_fraud',
      type: 'checkout.session.completed',
      account: 'acct_imposter_999', // Mismatch!
      data: {
        object: {
          amount_total: 10000,
          currency: 'usd',
          metadata: {
            type: 'invoice_payment',
            invoiceId: 'inv_100',
          },
        },
      },
    })

    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 'inv_100',
          user_id: 'usr_creator',
          currency: 'usd',
          items: [{ amount: 100 }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: 'usr_creator',
          stripe_account_id: 'acct_real_owner',
        },
      })

    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(500)
    // Verify row was deleted so retry can succeed
    expect(mockDelete).toHaveBeenCalled()
  })

  it('syncs capabilities on account.updated', async () => {
    mockConstructEvent.mockReturnValue({
      id: 'evt_acct_up',
      type: 'account.updated',
      data: {
        object: {
          id: 'acct_creator_123',
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
        },
      },
    })

    const { POST } = await import('./route')
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        stripe_charges_enabled: true,
        stripe_payouts_enabled: true,
        stripe_connect_onboarded: true,
      })
    )
  })
})
