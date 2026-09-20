import { SupabaseClient } from '@supabase/supabase-js'

export type ActivationEventName =
  | 'signup_completed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'first_project_created'
  | 'first_update_published'
  | 'first_portal_viewed'
  | 'client_portal_shared'
  | 'first_client_action'
  | 'first_invoice_sent'
  | 'first_payment_received'

export interface TrackActivationParams {
  supabase: SupabaseClient
  userId: string
  eventName: ActivationEventName
  projectId?: string | null
  metadata?: Record<string, any>
}

/**
 * Records a lightweight activation funnel event.
 * Never throws or blocks main product execution.
 */
export async function trackActivationEvent({
  supabase,
  userId,
  eventName,
  projectId = null,
  metadata = {},
}: TrackActivationParams): Promise<boolean> {
  if (!userId || !eventName) return false

  try {
    const { error } = await supabase.from('activation_events').insert({
      user_id: userId,
      event_name: eventName,
      project_id: projectId,
      metadata,
    })

    if (error) {
      // If table doesn't exist yet before migration, log notice without crashing
      console.warn(`[Activation] Could not record event "${eventName}":`, error.message)
      return false
    }

    return true
  } catch (err: any) {
    console.error(`[Activation] Exception recording event "${eventName}":`, err?.message || err)
    return false
  }
}
