import { createAdminClient } from '@/lib/supabase/admin'
import { getProjectAccess } from '@/lib/project-access'
import { NextResponse } from 'next/server'

// Used by both freelancer (authenticated workspace member) and client (public toggle for assigned items)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { done } = await request.json()

  // Service role: checklist_items has no public write policy, so access is checked here
  const admin = createAdminClient()

  const { data: item } = await admin
    .from('checklist_items')
    .select('id, project_id, assigned_to')
    .eq('id', id)
    .maybeSingle()

  if (!item) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
  }

  const access = await getProjectAccess(item.project_id)
  if (!access) {
    return NextResponse.json({ error: 'Associated project not found' }, { status: 404 })
  }

  if (!access.isWorkspaceMember) {
    // Clients can ONLY toggle items assigned to them
    if (item.assigned_to !== 'client') {
      return NextResponse.json(
        { error: 'Clients can only toggle items assigned to the client role' },
        { status: 403 }
      )
    }
    if (!access.canActAsClient) {
      return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
    }
  }

  const { error } = await admin
    .from('checklist_items')
    .update({ done: !!done, done_at: done ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
