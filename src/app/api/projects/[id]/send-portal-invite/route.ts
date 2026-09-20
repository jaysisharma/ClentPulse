import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendClientPortalInviteEmail } from '@/lib/emails/onboarding'
import { trackActivationEvent } from '@/lib/activation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const recipientEmail = (body.recipientEmail || '').trim().toLowerCase()
    const customMessage = body.customMessage || null

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid client email address is required' }, { status: 400 })
    }

    // 1. Fetch project and verify ownership / permissions
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, user_id, org_id, project_name, slug, color, passcode')
      .eq('id', id)
      .single()

    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let hasAccess = project.user_id === user.id
    if (!hasAccess && project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (member && ['owner', 'admin'].includes(member.role)) {
        hasAccess = true
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Fetch sender identity (studio name or freelancer full name)
    const { data: owner } = await supabase
      .from('users')
      .select('name, studio_name')
      .eq('id', user.id)
      .single()

    const senderName = owner?.studio_name || owner?.name || 'Your Project Lead'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'
    const portalUrl = `${appUrl}/p/${project.slug}`

    // 3. Send email via Resend
    const emailResult = await sendClientPortalInviteEmail({
      clientEmail: recipientEmail,
      projectName: project.project_name,
      freelancerName: senderName,
      portalUrl,
      hasPasscode: Boolean(project.passcode),
      customMessage,
    })

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || 'Failed to send invitation email' }, { status: 500 })
    }

    // 4. Record client_portal_shared activation event
    await trackActivationEvent({
      supabase,
      userId: user.id,
      eventName: 'client_portal_shared',
      projectId: project.id,
      metadata: { recipientEmail, hasPasscode: Boolean(project.passcode) },
    })

    return NextResponse.json({ success: true, portalUrl })
  } catch (err: any) {
    console.error('[POST /api/projects/[id]/send-portal-invite error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
