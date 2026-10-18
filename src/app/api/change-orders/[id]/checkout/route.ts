import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: changeOrder, error: coError } = await supabase
      .from('change_orders')
      .select('id, project_id, user_id, title, description, amount, currency, status')
      .eq('id', id)
      .single()

    if (coError || !changeOrder) {
      return NextResponse.json({ error: 'Change order not found' }, { status: 404 })
    }

    if (changeOrder.status === 'paid') {
      return NextResponse.json({ error: 'Change order already paid' }, { status: 400 })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, slug, client_email, project_name')
      .eq('id', changeOrder.project_id)
      .single()

    const { data: owner } = await supabase
      .from('users')
      .select('name')
      .eq('id', changeOrder.user_id)
      .single()

    const amount = Number(changeOrder.amount) || 0
    const totalCents = Math.round(amount * 100)

    if (totalCents < 50) {
      return NextResponse.json({ error: 'Amount too small to process via Stripe' }, { status: 400 })
    }

    // SAFETY GUARD (Phase 2):
    // Direct online card payments for change orders are temporarily disabled because
    // Frevio does not yet route funds via verified Stripe Connect destination charges.
    // Creating a platform checkout session would hold client funds in the platform's
    // Stripe account without an automated payout mechanism.
    return NextResponse.json({
      error: 'Direct online card processing for change orders is temporarily disabled pending studio direct payout (Stripe Connect) integration. You can approve or decline this scope change directly without online card payment.',
      code: 'PAYMENTS_UNAVAILABLE',
      disabled: true,
    }, { status: 503 })
  } catch (err: any) {
    console.error('[Change Order Checkout] Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process request' }, { status: 500 })
  }
}
