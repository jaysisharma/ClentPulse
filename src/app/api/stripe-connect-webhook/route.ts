import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { claimStripeEvent, markStripeEventDone, releaseStripeEvent } from '@/lib/stripe-events'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_CONNECT_WEBHOOK_SECRET is not configured.')
    return NextResponse.json({ error: 'Webhook secret unconfigured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed'
    console.error('Connect webhook signature error:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const supabase = createAdminClient()

  let claim
  try {
    claim = await claimStripeEvent(supabase, event.id)
  } catch (err) {
    console.error('[Connect Webhook] Idempotency check failed:', err)
    return NextResponse.json({ error: 'Failed to verify event idempotency' }, { status: 500 })
  }
  if (claim === 'duplicate') return NextResponse.json({ received: true, duplicate: true })
  if (claim === 'in_progress') {
    // Non-2xx so Stripe retries; if the other attempt dies, the retry takes over.
    return NextResponse.json({ error: 'Event is being processed' }, { status: 409 })
  }

  try {
    const connectedAccount = event.account

    // -------------------------------------------------------------
    // 1. Checkout Session Completed (Direct Charge on Standard Account)
    // -------------------------------------------------------------
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.type === 'invoice_payment') {
        const invoiceId = session.metadata.invoiceId || session.metadata.invoice_id
        if (!invoiceId) throw new Error('Missing invoiceId in metadata')

        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, invoice_number, user_id, currency, items, tax_rate, is_deposit, project_id, status')
          .eq('id', invoiceId)
          .single()

        if (!invoice) throw new Error(`Invoice not found: ${invoiceId}`)

        const { data: creator } = await supabase
          .from('users')
          .select('id, stripe_account_id')
          .eq('id', invoice.user_id)
          .single()

        // REQUIREMENT (a): Verify event.account == invoice owner's stripe_account_id
        if (!connectedAccount || connectedAccount !== creator?.stripe_account_id) {
          console.error(`[Connect Webhook] Security Mismatch: event.account (${connectedAccount}) != creator (${creator?.stripe_account_id})`)
          throw new Error('Security verification failed: event.account mismatch with invoice owner')
        }

        // REQUIREMENT (a): Verify amount & currency
        const subtotal = (invoice.items ?? []).reduce(
          (s: number, i: { amount: number }) => s + (Number(i.amount) || 0),
          0
        )
        const taxRate = Number(invoice.tax_rate ?? 0)
        const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
        const expectedCents = Math.round((subtotal + taxAmount) * 100)
        const expectedCurrency = (invoice.currency || 'usd').toLowerCase()

        const paidCents = session.amount_total ?? 0
        const paidCurrency = (session.currency || '').toLowerCase()

        if (paidCents < expectedCents || paidCurrency !== expectedCurrency) {
          console.error(`[Connect Webhook] Amount/Currency mismatch: expected ${expectedCents} ${expectedCurrency}, got ${paidCents} ${paidCurrency}`)
          throw new Error('Amount or currency mismatch on invoice payment')
        }

        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_charge_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          })
          .eq('id', invoice.id)

        if (invoice.is_deposit && invoice.project_id) {
          await supabase
            .from('projects')
            .update({ deposit_paid: true, status: 'active' })
            .eq('id', invoice.project_id)
        }
      } else if (session.metadata?.type === 'change_order_payment') {
        const changeOrderId = session.metadata.changeOrderId || session.metadata.change_order_id
        if (!changeOrderId) throw new Error('Missing changeOrderId in metadata')

        const { data: changeOrder } = await supabase
          .from('change_orders')
          .select('id, project_id, user_id, amount, currency')
          .eq('id', changeOrderId)
          .single()

        if (!changeOrder) throw new Error(`Change order not found: ${changeOrderId}`)

        const { data: creator } = await supabase
          .from('users')
          .select('id, stripe_account_id')
          .eq('id', changeOrder.user_id)
          .single()

        // REQUIREMENT (a): Verify event.account
        if (!connectedAccount || connectedAccount !== creator?.stripe_account_id) {
          throw new Error('Security verification failed: event.account mismatch with change order owner')
        }

        const expectedCents = Math.round((Number(changeOrder.amount) || 0) * 100)
        const expectedCurrency = (changeOrder.currency || 'usd').toLowerCase()
        const paidCents = session.amount_total ?? 0
        const paidCurrency = (session.currency || '').toLowerCase()

        if (paidCents < expectedCents || paidCurrency !== expectedCurrency) {
          throw new Error('Amount or currency mismatch on change order payment')
        }

        await supabase
          .from('change_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            approved_at: new Date().toISOString(),
          })
          .eq('id', changeOrder.id)
      }
    }

    // -------------------------------------------------------------
    // 2. Payment Intent Succeeded (Direct Charge on Standard Account)
    // -------------------------------------------------------------
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata?.invoiceId || pi.metadata?.invoice_id

      if (invoiceId) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, user_id, currency, items, tax_rate, is_deposit, project_id')
          .eq('id', invoiceId)
          .single()

        if (invoice) {
          const { data: creator } = await supabase
            .from('users')
            .select('id, stripe_account_id')
            .eq('id', invoice.user_id)
            .single()

          // REQUIREMENT (a): Verify event.account & amount
          if (connectedAccount && connectedAccount === creator?.stripe_account_id) {
            const subtotal = (invoice.items ?? []).reduce(
              (s: number, i: { amount: number }) => s + (Number(i.amount) || 0),
              0
            )
            const taxRate = Number(invoice.tax_rate ?? 0)
            const expectedCents = Math.round((subtotal + (subtotal * (taxRate / 100))) * 100)
            const expectedCurrency = (invoice.currency || 'usd').toLowerCase()

            if (pi.amount >= expectedCents && pi.currency.toLowerCase() === expectedCurrency) {
              await supabase
                .from('invoices')
                .update({
                  status: 'paid',
                  paid_at: new Date().toISOString(),
                  // Same id the checkout path stores, so refunds can find the invoice
                  stripe_charge_id: pi.id,
                })
                .eq('id', invoice.id)

              if (invoice.is_deposit && invoice.project_id) {
                await supabase
                  .from('projects')
                  .update({ deposit_paid: true, status: 'active' })
                  .eq('id', invoice.project_id)
              }
            }
          }
        }
      }
    }

    // -------------------------------------------------------------
    // 3. Charge Refunded
    // -------------------------------------------------------------
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      // charge.refunded is only true once the full amount is refunded; partial
      // refunds leave the invoice as paid.
      if (charge.refunded && connectedAccount) {
        // Invoices store the payment intent id (checkout) — older rows may hold the charge id.
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
        const ids = [paymentIntentId, charge.id].filter((v): v is string => Boolean(v))

        const { data: matches } = await supabase
          .from('invoices')
          .select('id, user_id')
          .in('stripe_charge_id', ids)

        for (const invoice of matches ?? []) {
          // Only the invoice owner's own Stripe account can refund it
          const { data: owner } = await supabase
            .from('users')
            .select('stripe_account_id')
            .eq('id', invoice.user_id)
            .single()
          if (owner?.stripe_account_id !== connectedAccount) {
            console.error(`[Connect Webhook] Refund account mismatch for invoice ${invoice.id}`)
            continue
          }
          await supabase.from('invoices').update({ status: 'refunded' }).eq('id', invoice.id)
        }
      }
    }

    // -------------------------------------------------------------
    // 4. Connect Account Updated
    // -------------------------------------------------------------
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account
      const chargesEnabled = Boolean(account.charges_enabled)
      const payoutsEnabled = Boolean(account.payouts_enabled)
      const isOnboarded = Boolean(account.details_submitted && chargesEnabled)

      await supabase
        .from('users')
        .update({
          stripe_charges_enabled: chargesEnabled,
          stripe_payouts_enabled: payoutsEnabled,
          stripe_connect_onboarded: isOnboarded,
        })
        .eq('stripe_account_id', account.id)

      await supabase
        .from('organizations')
        .update({
          stripe_charges_enabled: chargesEnabled,
          stripe_payouts_enabled: payoutsEnabled,
          stripe_connect_onboarded: isOnboarded,
        })
        .eq('stripe_account_id', account.id)

      console.log(`[Connect Webhook] Synced account ${account.id} (charges: ${chargesEnabled})`)
    }

    // -------------------------------------------------------------
    // 5. Connect Application Deauthorized
    // -------------------------------------------------------------
    if (event.type === 'account.application.deauthorized') {
      const accountId = event.account || (event.data?.object as { id?: string })?.id
      if (accountId) {
        await supabase
          .from('users')
          .update({
            stripe_charges_enabled: false,
            stripe_payouts_enabled: false,
            stripe_connect_onboarded: false,
            stripe_account_id: null,
          })
          .eq('stripe_account_id', accountId)

        await supabase
          .from('organizations')
          .update({
            stripe_charges_enabled: false,
            stripe_payouts_enabled: false,
            stripe_connect_onboarded: false,
            stripe_account_id: null,
          })
          .eq('stripe_account_id', accountId)

        console.log(`[Connect Webhook] Deauthorized account ${accountId}`)
      }
    }

    await markStripeEventDone(supabase, event.id)

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error(`[Connect Webhook] Handler failed on event ${event.id}:`, err)
    await releaseStripeEvent(supabase, event.id)

    const msg = err instanceof Error ? err.message : 'Processing failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
