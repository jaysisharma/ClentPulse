import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ACTIVE_WORKSPACE_COOKIE } from '@/lib/workspace'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite, error } = await supabase
    .from('organization_invites')
    .select('id, email, role, status, expires_at, org:organizations(id, name, slug, logo_url, accent_color)')
    .eq('token', token)
    .single()

  if (error || !invite) {
    return NextResponse.json({ error: 'Invite not found or invalid' }, { status: 404 })
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: `This invite has already been ${invite.status}` }, { status: 410 })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      organization: invite.org,
    },
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: please log in or sign up first' }, { status: 401 })
  }

  const { data: invite, error: inviteErr } = await supabase
    .from('organization_invites')
    .select('id, org_id, email, role, status, expires_at')
    .eq('token', token)
    .single()

  if (inviteErr || !invite) {
    return NextResponse.json({ error: 'Invite not found or invalid' }, { status: 404 })
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: `Invite is already ${invite.status}` }, { status: 400 })
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('org_id', invite.org_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    // Already member, simply mark invite accepted
    await supabase.from('organization_invites').update({ status: 'accepted' }).eq('id', invite.id)
    const response = NextResponse.json({ success: true, orgId: invite.org_id })
    response.cookies.set(ACTIVE_WORKSPACE_COOKIE, invite.org_id, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  // Insert membership
  const { error: joinErr } = await supabase
    .from('organization_members')
    .insert({
      org_id: invite.org_id,
      user_id: user.id,
      role: invite.role,
    })

  if (joinErr) {
    return NextResponse.json({ error: joinErr.message }, { status: 500 })
  }

  // Mark invite as accepted
  await supabase
    .from('organization_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  const response = NextResponse.json({ success: true, orgId: invite.org_id })
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, invite.org_id, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}
