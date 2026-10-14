import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { notifyFreelancerOfApproval } from '@/lib/notifications'
import { verifyPasscodeTicket, timingSafeCompare } from '@/lib/passcode-crypto'

const ALLOWED_STATUSES = ['approved', 'declined', 'changes_requested']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, feedback } = await request.json()

  // Validate the response — never write an arbitrary status.
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status. Must be "approved", "declined", or "changes_requested".' }, { status: 400 })
  }
  if (feedback != null && (typeof feedback !== 'string' || feedback.length > 2000)) {
    return NextResponse.json({ error: 'Feedback must be text under 2000 characters.' }, { status: 400 })
  }

  // Handle demo mode preview smoothly
  if (id.startsWith('demo-')) {
    return NextResponse.json({ success: true, isDemo: true })
  }

  const supabase = await createClient()

  // 1. Fetch target approval and project security settings
  const { data: approval, error: approvalError } = await supabase
    .from('approvals')
    .select('id, project_id, status')
    .eq('id', id)
    .single()

  if (approvalError || !approval) {
    return NextResponse.json({ error: 'Approval item not found' }, { status: 404 })
  }

  if (approval.status !== 'pending') {
    return NextResponse.json({ error: 'Approval has already been decided' }, { status: 400 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id, passcode, slug')
    .eq('id', approval.project_id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // 2. Passcode verification if project is protected
  if (project.passcode) {
    const { data: { user } } = await supabase.auth.getUser()
    let isAuthorized = false

    if (user) {
      if (project.user_id === user.id) isAuthorized = true
      else if (project.org_id) {
        const { data: member } = await supabase
          .from('organization_members')
          .select('role')
          .eq('org_id', project.org_id)
          .eq('user_id', user.id)
          .maybeSingle()
        if (member) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      const cookieStore = await cookies()
      const ticketOrPass = cookieStore.get(`client_project_passcode_${project.slug}`)?.value
      const isTicketValid = verifyPasscodeTicket(ticketOrPass, project.id, project.slug)
      const isLegacyMatch = !isTicketValid && ticketOrPass && timingSafeCompare(ticketOrPass, project.passcode)

      if (!isTicketValid && !isLegacyMatch) {
        return NextResponse.json({ error: 'Passcode verification required to submit approvals' }, { status: 401 })
      }
    }
  }

  // Only respond to a still-pending approval
  const { error } = await supabase.from('approvals').update({
    status, feedback: feedback || null, responded_at: new Date().toISOString(),
  }).eq('id', id).eq('status', 'pending')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify freelancer via email in the background
  notifyFreelancerOfApproval({
    approvalId: id,
    status,
    feedback: feedback || null,
  }).catch(err => console.error('Failed to notify freelancer of approval response:', err))

  return NextResponse.json({ success: true })
}
