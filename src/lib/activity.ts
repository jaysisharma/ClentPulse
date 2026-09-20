import { SupabaseClient } from '@supabase/supabase-js'

export interface LogActivityParams {
  supabase: SupabaseClient
  orgId: string
  projectId?: string | null
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, any>
}

/**
 * Records an immutable audit log event for an organization.
 * Fire-and-forget; never crashes the main operational request.
 */
export async function logAgencyActivity({
  supabase,
  orgId,
  projectId = null,
  userId = null,
  action,
  entityType,
  entityId = null,
  details = {},
}: LogActivityParams) {
  if (!orgId) return

  try {
    const { error } = await supabase.from('activity_logs').insert({
      org_id: orgId,
      project_id: projectId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    })
    if (error) {
      console.error('Failed to record agency activity log:', error.message)
    }
  } catch (err) {
    console.error('Exception writing activity log:', err)
  }
}
