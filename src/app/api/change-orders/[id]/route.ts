import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, any> = {}

    if (body.title !== undefined) updates.title = body.title.trim()
    if (body.description !== undefined) updates.description = body.description?.trim() || null
    if (body.amount !== undefined) updates.amount = Math.max(0, Number(body.amount) || 0)
    if (body.currency !== undefined) updates.currency = body.currency.toUpperCase()
    if (body.estimatedHours !== undefined) updates.estimated_hours = body.estimatedHours ? Number(body.estimatedHours) : null
    if (body.timelineDays !== undefined) updates.timeline_days = Math.max(0, Number(body.timelineDays) || 0)
    if (body.requiresPayment !== undefined) updates.requires_payment = Boolean(body.requiresPayment)
    if (body.status !== undefined) {
      updates.status = body.status
      if (body.status === 'approved') updates.approved_at = new Date().toISOString()
      if (body.status === 'paid') updates.paid_at = new Date().toISOString()
    }

    const { data: updated, error } = await supabase
      .from('change_orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, changeOrder: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('change_orders')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
