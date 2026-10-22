import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Rate limit: 10 requests per minute per IP (Upstash distributed with in-memory fallback)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = await rateLimit(`pay-invoice:${ip}`, 10, 60_000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
    )
  }

  const body = await request.json().catch(() => ({}))
  const { invoiceId } = body
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, items, status, user_id, currency, tax_rate, is_deposit, project_id')
    .eq('id', invoiceId)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status === 'paid') return NextResponse.json({ error: 'Invoice has already been paid' }, { status: 400 })

  const { data: owner } = await supabase
    .from('users')
    .select('id, name, stripe_account_id, stripe_charges_enabled')
    .eq('id', invoice.user_id)
    .single()

  if (!owner) {
    return NextResponse.json({ error: 'Invoice owner not found' }, { status: 404 })
  }

  // Ensure owner is onboarded with Stripe Connect direct charges enabled
  if (!owner.stripe_account_id || !owner.stripe_charges_enabled) {
    return NextResponse.json({
      error: 'The creator or agency has not activated Stripe Direct Payouts yet. Please pay via direct bank transfer or contact them directly.',
      code: 'STRIPE_CONNECT_INCOMPLETE',
    }, { status: 400 })
  }

  // Calculate totals strictly on the server
  const subtotal = (invoice.items ?? []).reduce(
    (s: number, i: { amount: number }) => s + (Number(i.amount) || 0),
    0
  )
  const taxRate = Number(invoice.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount
  const totalCents = Math.round(total * 100)

  if (totalCents < 50) {
    return NextResponse.json({ error: 'Invoice total must be at least $0.50 to process online' }, { status: 400 })
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://clientpulse-one.vercel.app').replace(/\/+$/, '')
  const currency = (invoice.currency || 'usd').toLowerCase()

  try {
    // DIRECT CHARGE: Created directly on the connected account via stripeAccount header.
    // The connected account is Merchant of Record, pays standard Stripe fees directly,
    // and absorbs disputes with 0 liability and 0 transaction fee to Frevio.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: invoice.client_email || undefined,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Invoice #${invoice.invoice_number}`,
              description: `Payment for ${owner.name || 'Creative Services'} (Invoice ${invoice.invoice_number})`,
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        projectId: invoice.project_id || '',
        userId: invoice.user_id,
        ownerStripeAccountId: owner.stripe_account_id,
        expectedAmountCents: String(totalCents),
        expectedCurrency: currency,
        isDeposit: invoice.is_deposit ? 'true' : 'false',
        type: 'invoice_payment',
      },
      success_url: `${appUrl}/portal/invoices/${invoice.id}?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/invoices/${invoice.id}?canceled=true`,
    }, {
      stripeAccount: owner.stripe_account_id,
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err: unknown) {
    console.error('Error creating invoice Stripe checkout session:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create payment session'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
