import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkCustomDomain } from '@/lib/domains'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check caller membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, custom_domain')
    .eq('id', id)
    .single()

  if (!org || !org.custom_domain) {
    return NextResponse.json({
      configured: false,
      verified: false,
      sslReady: false,
      message: 'No custom domain configured for this organization.',
    })
  }

  const result = await checkCustomDomain(org.custom_domain)

  return NextResponse.json({
    domain: org.custom_domain,
    ...result,
  })
}
