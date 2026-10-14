import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPasscodeTicket, timingSafeCompare } from '@/lib/passcode-crypto'

// Used by both freelancer (authenticated workspace member) and client (public toggle for assigned items)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { done } = await request.json()

  const supabase = await createClient()

  // 1. Fetch target item and parent project metadata
  const { data: item, error: itemError } = await supabase
    .from('checklist_items')
    .select('id, project_id, assigned_to')
    .eq('id', id)
    .single()

  if (itemError || !item) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id, passcode, slug')
    .eq('id', item.project_id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Associated project not found' }, { status: 404 })
  }

  // 2. Check caller identity
  const { data: { user } } = await supabase.auth.getUser()

  let isWorkspaceAuthorized = false

  if (user) {
    if (project.user_id === user.id) {
      isWorkspaceAuthorized = true
    } else if (project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (member) isWorkspaceAuthorized = true
    }
  }

  // If not a workspace member, treat as public client
  if (!isWorkspaceAuthorized) {
    // Clients can ONLY toggle items assigned to them
    if (item.assigned_to !== 'client') {
      return NextResponse.json(
        { error: 'Clients can only toggle items assigned to the client role' },
        { status: 403 }
      )
    }

    // If project is gated with a passcode, verify the client's session ticket
    if (project.passcode) {
      const cookieStore = await cookies()
      const ticketOrPass = cookieStore.get(`client_project_passcode_${project.slug}`)?.value
      const isTicketValid = verifyPasscodeTicket(ticketOrPass, project.id, project.slug)
      const isLegacyMatch = !isTicketValid && ticketOrPass && timingSafeCompare(ticketOrPass, project.passcode)

      if (!isTicketValid && !isLegacyMatch) {
        return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
      }
    }
  }

  const { error } = await supabase
    .from('checklist_items')
    .update({ done: !!done, done_at: done ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
