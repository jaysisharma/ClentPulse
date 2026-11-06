import { describe, it, expect, vi } from 'vitest'
import { claimStripeEvent } from './stripe-events'

/** Stubs processed_stripe_events: an insert result, the existing row, and the takeover result. */
function stub({ insertError, existing, takenRows }: { insertError?: any; existing?: any; takenRows?: any[] }) {
  const update = vi.fn()
  const supabase: any = {
    from: () => ({
      insert: async () => ({ error: insertError ?? null }),
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: existing ?? null }) }) }),
      update: (payload: any) => {
        update(payload)
        const q: any = { eq: () => q, select: async () => ({ data: takenRows ?? [] }) }
        return q
      },
    }),
  }
  return { supabase, update }
}

const DUP = { code: '23505', message: 'duplicate key' }
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

describe('claimStripeEvent', () => {
  it('processes a new event', async () => {
    expect(await claimStripeEvent(stub({}).supabase, 'evt_1')).toBe('process')
  })

  it('treats a finished event as a duplicate', async () => {
    const { supabase } = stub({ insertError: DUP, existing: { status: 'done', created_at: ago(5_000) } })
    expect(await claimStripeEvent(supabase, 'evt_1')).toBe('duplicate')
  })

  it('reports an event another request started recently as in progress', async () => {
    const { supabase, update } = stub({ insertError: DUP, existing: { status: 'processing', created_at: ago(5_000) } })
    expect(await claimStripeEvent(supabase, 'evt_1')).toBe('in_progress')
    expect(update).not.toHaveBeenCalled()
  })

  it('takes over an attempt that was abandoned mid-flight', async () => {
    const { supabase, update } = stub({
      insertError: DUP,
      existing: { status: 'processing', created_at: ago(5 * 60_000) },
      takenRows: [{ event_id: 'evt_1' }],
    })
    expect(await claimStripeEvent(supabase, 'evt_1')).toBe('process')
    expect(update).toHaveBeenCalledOnce()
  })

  it('backs off when a concurrent retry won the takeover', async () => {
    const { supabase } = stub({
      insertError: DUP,
      existing: { status: 'processing', created_at: ago(5 * 60_000) },
      takenRows: [],
    })
    expect(await claimStripeEvent(supabase, 'evt_1')).toBe('in_progress')
  })

  it('throws on unexpected database errors', async () => {
    const { supabase } = stub({ insertError: { code: '500', message: 'db down' } })
    await expect(claimStripeEvent(supabase, 'evt_1')).rejects.toThrow('db down')
  })
})
