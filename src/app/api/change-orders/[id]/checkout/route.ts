import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit: 10 requests per minute per IP (Upstash distributed with in-memory fallback)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    const rl = await rateLimit(`change-order-checkout:${ip}`, 10, 60_000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
      )
    }

    const { id } = await params
    const supabase = createAdminClient()

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
      .select('id, name, stripe_account_id, stripe_charges_enabled')
      .eq('id', changeOrder.user_id)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    if (!owner.stripe_account_id || !owner.stripe_charges_enabled) {
      return NextResponse.json({
        error: 'The creator or agency has not activated Stripe Direct Payouts yet. Please settle offline or approve directly.',
        code: 'STRIPE_CONNECT_INCOMPLETE',
      }, { status: 400 })
    }

    const amount = Number(changeOrder.amount) || 0
    const totalCents = Math.round(amount * 100)

    if (totalCents < 50) {
      return NextResponse.json({ error: 'Amount too small to process via Stripe' }, { status: 400 })
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://clientpulse-one.vercel.app').replace(/\/+$/, '')
    const currency = (changeOrder.currency || 'usd').toLowerCase()

    // DIRECT CHARGE: Created directly on the connected account
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: project?.client_email || undefined,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Change Order: ${changeOrder.title}`,
              description: `Scope change for project "${project?.project_name || 'Project'}"`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        changeOrderId: changeOrder.id,
        projectId: changeOrder.project_id,
        userId: changeOrder.user_id,
        ownerStripeAccountId: owner.stripe_account_id,
        expectedAmountCents: String(totalCents),
        expectedCurrency: currency,
        type: 'change_order_payment',
      },
      success_url: `${appUrl}/portal/${project?.slug || 'project'}?co_paid=${changeOrder.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/${project?.slug || 'project'}?co_canceled=${changeOrder.id}`,
    }, {
      stripeAccount: owner.stripe_account_id,
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err: unknown) {
    console.error('[Change Order Checkout] Error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to process request'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
