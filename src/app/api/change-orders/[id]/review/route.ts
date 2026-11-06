import { createAdminClient } from '@/lib/supabase/admin'
import { getProjectAccess } from '@/lib/project-access'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, notes } = body // 'approve' | 'decline'

    if (!['approve', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Action must be approve or decline' }, { status: 400 })
    }
    if (notes != null && (typeof notes !== 'string' || notes.length > 2000)) {
      return NextResponse.json({ error: 'Notes must be text under 2000 characters' }, { status: 400 })
    }

    // Service role: change_orders has no public write policy, so access is checked here
    const admin = createAdminClient()

    const { data: changeOrder } = await admin
      .from('change_orders')
      .select('id, project_id, status')
      .eq('id', id)
      .maybeSingle()

    if (!changeOrder || changeOrder.status === 'draft') {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 })
    }

    const access = await getProjectAccess(changeOrder.project_id)
    if (!access) {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 })
    }
    if (!access.canActAsClient) {
      return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
    }

    if (changeOrder.status !== 'pending') {
      return NextResponse.json({ error: 'This change order has already been reviewed' }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {
      status: action === 'approve' ? 'approved' : 'declined',
      client_notes: notes || null,
    }

    if (action === 'approve') {
      updatePayload.approved_at = new Date().toISOString()
    }

    const { data: updated, error: updateError } = await admin
      .from('change_orders')
      .update(updatePayload)
      .eq('id', id)
      .eq('status', 'pending')
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, changeOrder: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
