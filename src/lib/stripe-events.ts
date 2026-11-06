import type { SupabaseClient } from '@supabase/supabase-js'

// Idempotency for Stripe webhooks, shared by the platform and Connect handlers.
//
// Each event gets one processed_stripe_events row: 'processing' while a handler
// works on it, 'done' once it succeeded. A handler that fails deletes the row so
// Stripe's retry can run again. A handler that dies mid-flight (function timeout,
// crash) leaves a 'processing' row behind; once it is older than STALE_MS the
// next delivery takes it over instead of treating the event as a duplicate.

const STALE_MS = 60_000

/**
 * - `process`: this request owns the event and must call markStripeEventDone /
 *   releaseStripeEvent when finished.
 * - `duplicate`: already handled; acknowledge with 200.
 * - `in_progress`: another request is handling it right now; answer non-2xx so
 *   Stripe retries later rather than considering it delivered.
 */
export type StripeEventClaim = 'process' | 'duplicate' | 'in_progress'

export async function claimStripeEvent(supabase: SupabaseClient, eventId: string): Promise<StripeEventClaim> {
  const { error } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: eventId, status: 'processing' })
  if (!error) return 'process'
  if (error.code !== '23505') throw new Error(`Failed to register Stripe event: ${error.message}`)

  const { data: existing } = await supabase
    .from('processed_stripe_events')
    .select('status, created_at')
    .eq('event_id', eventId)
    .maybeSingle()

  if (!existing || existing.status === 'done') return 'duplicate'
  if (Date.now() - new Date(existing.created_at).getTime() < STALE_MS) return 'in_progress'

  // Take over the abandoned attempt. Matching on the old created_at makes this a
  // compare-and-swap, so only one of several concurrent retries wins.
  const { data: taken } = await supabase
    .from('processed_stripe_events')
    .update({ created_at: new Date().toISOString() })
    .eq('event_id', eventId)
    .eq('status', 'processing')
    .eq('created_at', existing.created_at)
    .select('event_id')
  return taken && taken.length > 0 ? 'process' : 'in_progress'
}

export async function markStripeEventDone(supabase: SupabaseClient, eventId: string): Promise<void> {
  await supabase
    .from('processed_stripe_events')
    .update({ status: 'done', updated_at: new Date().toISOString() })
    .eq('event_id', eventId)
}

/** Forget a failed attempt so Stripe's retry processes the event again. */
export async function releaseStripeEvent(supabase: SupabaseClient, eventId: string): Promise<void> {
  await supabase.from('processed_stripe_events').delete().eq('event_id', eventId)
}
