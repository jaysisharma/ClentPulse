import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify owner/admin role
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: invites, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('org_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ invites: invites ?? [] })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify caller is owner or admin
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden: requires owner or admin role' }, { status: 403 })
  }

  const { email, role } = await request.json()
  const normalizedEmail = (email || '').trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
  }

  const inviteRole = role === 'admin' ? 'admin' : 'member'

  // Get Organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, billing_plan')
    .eq('id', id)
    .single()

  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  // Enforce team seat limits (5 for Agency, 25 for Agency Scale)
  const { canInviteMember, getPlanLimits } = await import('@/lib/plans')
  const [{ count: memberCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('org_id', id),
    supabase.from('organization_invites').select('id', { count: 'exact', head: true }).eq('org_id', id).eq('status', 'pending').neq('email', normalizedEmail),
  ])

  const totalOccupiedSeats = (memberCount ?? 0) + (pendingCount ?? 0)
  if (!canInviteMember(org.billing_plan, totalOccupiedSeats)) {
    const limits = getPlanLimits(org.billing_plan)
    return NextResponse.json({
      error: `Team seat limit reached (${limits.seats} seats). Upgrade your organization plan to invite more team members.`,
    }, { status: 403 })
  }

  // Check if already a member
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingUser) {
    const { data: alreadyMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('org_id', id)
      .eq('user_id', existingUser.id)
      .maybeSingle()

    if (alreadyMember) {
      return NextResponse.json({ error: 'This user is already a member of this organization' }, { status: 400 })
    }
  }

  // Revoke any previous pending invite for this email in this org
  await supabase
    .from('organization_invites')
    .update({ status: 'revoked' })
    .eq('org_id', id)
    .eq('email', normalizedEmail)
    .eq('status', 'pending')

  // Generate secure token
  const token = crypto.randomBytes(24).toString('hex')

  const { data: invite, error: inviteErr } = await supabase
    .from('organization_invites')
    .insert({
      org_id: id,
      email: normalizedEmail,
      role: inviteRole,
      token,
      invited_by: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 500 })
  }

  // Get inviter's name
  const { data: inviter } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const inviterName = inviter?.name || inviter?.email || 'A team member'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'
  const inviteUrl = `${appUrl}/invite/${token}`

  // Dispatch invitation email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: 'Frevio <updates@frevio.cloud>',
        to: [normalizedEmail],
        subject: `You've been invited to join ${org.name} on Frevio`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:0;background:#f8fafc;color:#0f172a">
<div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(0,0,0,0.06);border:1px solid #e2e8f0;padding:36px 32px">
  <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366F1;margin-bottom:16px">Team Invitation</div>
  <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px">Join ${org.name} on Frevio</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px">
    <strong>${inviterName}</strong> has invited you to join the <strong>${org.name}</strong> workspace as a <strong>${inviteRole === 'admin' ? 'Project Manager / Admin' : 'Team Member'}</strong>.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${inviteUrl}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#ffffff;border-radius:9999px;font-size:13px;font-weight:600;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
      Accept Invitation ↗
    </a>
  </div>
  <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;border-top:1px solid #f1f5f9;padding-top:16px">
    Or paste this link into your browser: <br/>
    <span style="font-family:monospace;color:#64748b">${inviteUrl}</span>
  </p>
</div>
</body>
</html>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send invite email:', emailErr)
    }
  }

  return NextResponse.json({ invite, inviteUrl }, { status: 201 })
}
