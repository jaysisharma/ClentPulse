import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as const })

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

    const currencyCode = (changeOrder.currency || 'usd').toLowerCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnSlug = project?.slug || 'portal'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: project?.client_email ?? undefined,
      line_items: [{
        price_data: {
          currency: currencyCode,
          unit_amount: totalCents,
          product_data: {
            name: `Change Order: ${changeOrder.title}`,
            description: changeOrder.description || `Approved scope change on ${project?.project_name || 'Project'} for ${owner?.name || 'Studio'}`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        type: 'change_order_payment',
        change_order_id: changeOrder.id,
        project_id: changeOrder.project_id,
      },
      success_url: `${appUrl}/p/${returnSlug}?change_order_paid=${changeOrder.id}`,
      cancel_url: `${appUrl}/p/${returnSlug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Change Order Checkout] Error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
