import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()

    // Fetch change order
    const { data: changeOrder, error: fetchError } = await supabase
      .from('change_orders')
      .select('id, project_id, amount, requires_payment, status')
      .eq('id', id)
      .single()

    if (fetchError || !changeOrder) {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'declined'
    const updatePayload: Record<string, any> = {
      status: newStatus,
      client_notes: notes || null,
    }

    if (action === 'approve') {
      updatePayload.approved_at = new Date().toISOString()
    }

    const { data: updated, error: updateError } = await supabase
      .from('change_orders')
      .update(updatePayload)
      .eq('id', id)
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
