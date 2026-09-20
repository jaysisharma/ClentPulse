import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidProvider, getDecryptedConnection, revokeToken } from '@/lib/integrations/oauth'
import { logAgencyActivity } from '@/lib/activity'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Best-effort token revocation at provider
  try {
    const conn = await getDecryptedConnection(supabase, user.id, provider)
    if (conn) {
      await revokeToken(provider, conn.accessToken)
    }
  } catch {
    // Don't block disconnect on revocation failure
  }

  // Mark as revoked (keep row so project_resources can still show disconnected state)
  const { error } = await supabase
    .from('integration_connections')
    .update({ status: 'revoked', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log for agencies
  const { data: org } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (org?.org_id) {
    logAgencyActivity({
      supabase,
      orgId: org.org_id,
      userId: user.id,
      action: 'integration_disconnected',
      entityType: 'integration',
      entityId: provider,
      details: { provider },
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
