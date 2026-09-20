import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { data: org, error: orgError },
    { data: members, error: membersError },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).single(),
    supabase.from('organization_members').select('id, org_id, user_id, role, joined_at, user:users(id, name, email, logo_url)').eq('org_id', id),
  ])

  if (orgError || !org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  return NextResponse.json({
    organization: org,
    members: members ?? [],
    callerRole: membership.role,
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if caller is owner or admin
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden: requires owner or admin role' }, { status: 403 })
  }

  const body = await request.json()
  const updates: Record<string, any> = {}

  if (body.name !== undefined) {
    if (!body.name.trim()) return NextResponse.json({ error: 'Organization name cannot be empty' }, { status: 400 })
    updates.name = body.name.trim()
  }
  if (body.logo_url !== undefined) updates.logo_url = body.logo_url?.trim() || null
  if (body.favicon_url !== undefined) updates.favicon_url = body.favicon_url?.trim() || null
  if (body.accent_color !== undefined) updates.accent_color = body.accent_color
  if (body.white_label !== undefined || body.custom_domain !== undefined) {
    const { data: currentOrg } = await supabase
      .from('organizations')
      .select('billing_plan')
      .eq('id', id)
      .maybeSingle()

    if (currentOrg?.billing_plan && ['free', 'starter', 'agency'].includes(currentOrg.billing_plan)) {
      if (body.white_label || body.custom_domain) {
        return NextResponse.json({
          error: 'Custom domain and white-labeling require the Agency Scale plan. Upgrade to enable custom domains and full white-labeling.',
        }, { status: 403 })
      }
    }
  }

  if (body.white_label !== undefined) updates.white_label = Boolean(body.white_label)

  if (body.custom_domain !== undefined) {
    if (!body.custom_domain || body.custom_domain.trim() === '') {
      updates.custom_domain = null
    } else {
      let domain = body.custom_domain.trim().toLowerCase()
      domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')

      const reservedHosts = ['frevio.app', 'localhost', '127.0.0.1', 'vercel.app']
      if (reservedHosts.some(h => domain === h || domain.endsWith(`.${h}`))) {
        return NextResponse.json({ error: 'Cannot use reserved system domain' }, { status: 400 })
      }

      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/
      if (!domainRegex.test(domain)) {
        return NextResponse.json({ error: 'Invalid domain format. Example: status.youragency.com' }, { status: 400 })
      }

      // Check if domain is taken by another organization
      const { data: existingDomain } = await supabase
        .from('organizations')
        .select('id')
        .eq('custom_domain', domain)
        .neq('id', id)
        .maybeSingle()

      if (existingDomain) {
        return NextResponse.json({ error: 'This custom domain is already claimed by another organization' }, { status: 409 })
      }

      updates.custom_domain = domain
    }
  }

  const { data: updatedOrg, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ organization: updatedOrg })
}
