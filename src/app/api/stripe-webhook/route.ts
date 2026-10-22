import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { normalizePlan } from '@/lib/plans'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    if (process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_CONNECT_WEBHOOK_SECRET)
      } catch (err2: unknown) {
        const msg = err2 instanceof Error ? err2.message : 'Webhook signature verification failed'
        console.error('Connect webhook signature verification error:', msg)
        return NextResponse.json({ error: msg }, { status: 400 })
      }
    } else {
      const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
      console.error('Webhook signature verification error:', msg)
      return NextResponse.json({ error: msg }, { status: 400 })
    }
  }

  // Stripe verifies the request via the signature check above; this handler has no
  // user session, so it must use the service-role admin client to bypass RLS and
  // write plan/invoice state for arbitrary customers.
  const supabase = createAdminClient()

  // Webhook event idempotency guard
  const { error: idempotencyError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: event.id })

  if (idempotencyError) {
    // Unique violation error code (23505) in postgres means this event was already processed
    if (idempotencyError.code === '23505') {
      console.log(`Stripe Webhook event already processed: ${event.id}`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('Failed to register webhook event idempotency:', idempotencyError)
    return NextResponse.json({ error: 'Failed to verify event idempotency' }, { status: 500 })
  }

  // 1. Checkout Session Completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.metadata?.type === 'change_order_payment') {
      const changeOrderId = session.metadata.changeOrderId || session.metadata.change_order_id

      if (changeOrderId) {
        const { error: coError } = await supabase
          .from('change_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            approved_at: new Date().toISOString(),
          })
          .eq('id', changeOrderId)

        if (coError) {
          console.error('Failed to update change_order status:', coError)
          return NextResponse.json({ error: coError.message }, { status: 500 })
        }
      }

      return NextResponse.json({ received: true })
    } else if (session.metadata?.type === 'invoice_payment') {
      const invoiceId = session.metadata.invoiceId || session.metadata.invoice_id
      const projectId = session.metadata.projectId || session.metadata.project_id
      const isDeposit = session.metadata.isDeposit === 'true' || session.metadata.is_deposit === 'true'

      if (invoiceId) {
        const { error } = await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', invoiceId)
        if (error) {
          console.error('Failed to update invoice status:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      if (isDeposit && projectId) {
        const { error: projError } = await supabase
          .from('projects')
          .update({ deposit_paid: true, status: 'active' })
          .eq('id', projectId)
        if (projError) {
          console.error('Failed to update project deposit_paid status:', projError)
        }
      }
    } else {
      // Platform subscription checkout
      const customerId = session.customer as string
      const userId = session.client_reference_id || session.metadata?.supabase_user_id
      const rawTier = session.metadata?.plan_tier || 'pro'
      const planTier = normalizePlan(rawTier)
      const orgId = session.metadata?.org_id
      const eventCreated = event.created

      // Event ordering guard: verify this event is newer than the last processed event
      let existingUser: { id: string; stripe_event_created_at?: number | null } | null = null
      if (userId) {
        const { data } = await supabase
          .from('users')
          .select('id, stripe_event_created_at')
          .eq('id', userId)
          .maybeSingle()
        existingUser = data
      } else if (customerId) {
        const { data } = await supabase
          .from('users')
          .select('id, stripe_event_created_at')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()
        existingUser = data
      }

      if (existingUser?.stripe_event_created_at && eventCreated && eventCreated < existingUser.stripe_event_created_at) {
        console.warn(`Stripe event ${event.id} is stale on checkout completion (${eventCreated} < ${existingUser.stripe_event_created_at})`)
        return NextResponse.json({ received: true, stale: true })
      }

      let userUpdated = false
      if (userId) {
        const { data, error } = await supabase
          .from('users')
          .update({
            plan: planTier,
            promo_pro: false,
            stripe_customer_id: customerId,
            ...(eventCreated ? { stripe_event_created_at: eventCreated } : {}),
          })
          .eq('id', userId)
          .select()
        if (!error && (data ?? []).length > 0) {
          userUpdated = true
        }
      }

      if (!userUpdated && customerId) {
        const { error } = await supabase
          .from('users')
          .update({
            plan: planTier,
            promo_pro: false,
            ...(eventCreated ? { stripe_event_created_at: eventCreated } : {}),
          })
          .eq('stripe_customer_id', customerId)
        if (error) {
          console.error('Failed to update user plan on checkout:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }

      // If this subscription is attached to an organization, update org billing_plan
      if (orgId) {
        const orgBillingPlan = planTier === 'agency_scale' ? 'agency_pro' : 'starter'
        await supabase
          .from('organizations')
          .update({ billing_plan: orgBillingPlan, stripe_customer_id: customerId })
          .eq('id', orgId)
      }
    }
  }

  // 2. Payment Intent Succeeded (Direct or Destination Charges)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const invoiceId = paymentIntent.metadata?.invoiceId || paymentIntent.metadata?.invoice_id
    const changeOrderId = paymentIntent.metadata?.changeOrderId || paymentIntent.metadata?.change_order_id
    const projectId = paymentIntent.metadata?.projectId || paymentIntent.metadata?.project_id
    const isDeposit = paymentIntent.metadata?.isDeposit === 'true' || paymentIntent.metadata?.is_deposit === 'true'

    if (invoiceId) {
      await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', invoiceId)
    }

    if (isDeposit && projectId) {
      await supabase
        .from('projects')
        .update({ deposit_paid: true, status: 'active' })
        .eq('id', projectId)
    }

    if (changeOrderId) {
      await supabase
        .from('change_orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        })
        .eq('id', changeOrderId)
    }
  }

  // 3. Charge Refunded
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const invoiceId = charge.metadata?.invoiceId || charge.metadata?.invoice_id
    const changeOrderId = charge.metadata?.changeOrderId || charge.metadata?.change_order_id

    if (invoiceId) {
      await supabase
        .from('invoices')
        .update({ status: 'refunded' })
        .eq('id', invoiceId)
    }

    if (changeOrderId) {
      await supabase
        .from('change_orders')
        .update({ status: 'refunded' })
        .eq('id', changeOrderId)
    }
  }

  // 4. Connect Account Updated
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

    console.log(`Connect account updated: ${account.id} (charges: ${chargesEnabled}, payouts: ${payoutsEnabled})`)
  }

  // 4b. Connect Application Deauthorized (Studio disconnected Frevio in Stripe dashboard)
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

      console.log(`Connect account deauthorized: ${accountId}`)
    }
  }

  // 4c. Dispute Created
  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute
    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
    if (chargeId) {
      console.warn(`Dispute opened on charge: ${chargeId}, amount: ${dispute.amount}`)
      // Flag invoice or change order as disputed if matched
      const { data: matchedInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('stripe_charge_id', chargeId)

      if (matchedInvoices && matchedInvoices.length > 0) {
        for (const inv of matchedInvoices) {
          await supabase.from('invoices').update({ status: 'disputed' }).eq('id', inv.id)
        }
      }
    }
  }

  // 5. Subscription Created / Updated / Deleted
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const eventCreated = event.created

    // Ordering guard
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, plan, stripe_event_created_at')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (existingUser?.stripe_event_created_at && eventCreated && eventCreated < existingUser.stripe_event_created_at) {
      console.warn(`Stripe event ${event.id} is stale on subscription update (${eventCreated} < ${existingUser.stripe_event_created_at})`)
      return NextResponse.json({ received: true, stale: true })
    }

    // Entitlement verification: check price against known Frevio plan prices if configured
    const knownPrices = [
      process.env.STRIPE_PRO_PRICE_ID,
      process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      process.env.STRIPE_AGENCY_PRICE_ID,
      process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
      process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID,
      process.env.STRIPE_AGENCY_STARTER_PRICE_ID,
      process.env.STRIPE_AGENCY_STARTER_ANNUAL_PRICE_ID,
      process.env.STRIPE_SCALE_PRICE_ID,
      process.env.STRIPE_SCALE_MONTHLY_PRICE_ID,
      process.env.STRIPE_SCALE_ANNUAL_PRICE_ID,
      process.env.STRIPE_AGENCY_SCALE_PRICE_ID,
      process.env.STRIPE_AGENCY_SCALE_ANNUAL_PRICE_ID,
    ].filter(Boolean) as string[]

    const subPriceId = subscription.items?.data?.[0]?.price?.id
    if (knownPrices.length > 0 && subPriceId && !knownPrices.includes(subPriceId)) {
      console.warn(`subscription: price ${subPriceId} does not match any recognized plan price`)
      return NextResponse.json({ received: true, ignored: 'unrecognized_price' })
    }

    const entitled = ['active', 'trialing', 'past_due']
    const isEntitled = entitled.includes(subscription.status)

    if (!isEntitled) {
      const { error } = await supabase
        .from('users')
        .update({
          plan: 'free',
          ...(eventCreated ? { stripe_event_created_at: eventCreated } : {}),
        })
        .eq('stripe_customer_id', customerId)
      if (error) {
        console.error('Failed to demote user plan on subscription update:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      await supabase
        .from('organizations')
        .update({ billing_plan: 'free' })
        .eq('stripe_customer_id', customerId)
    } else {
      const rawTier = subscription.metadata?.plan_tier
      const orgId = subscription.metadata?.org_id
      
      let resolvedPlan: string = 'pro'
      if (rawTier) {
        resolvedPlan = normalizePlan(rawTier)
      } else if (existingUser?.plan && existingUser.plan !== 'free') {
        resolvedPlan = existingUser.plan
      }

      const { error } = await supabase
        .from('users')
        .update({
          plan: resolvedPlan,
          promo_pro: false,
          ...(eventCreated ? { stripe_event_created_at: eventCreated } : {}),
        })
        .eq('stripe_customer_id', customerId)
      if (error) {
        console.error('Failed to update user plan on subscription update:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (orgId && (resolvedPlan === 'agency' || resolvedPlan === 'agency_scale')) {
        const orgBillingPlan = resolvedPlan === 'agency_scale' ? 'agency_pro' : 'starter'
        await supabase
          .from('organizations')
          .update({ billing_plan: orgBillingPlan })
          .eq('id', orgId)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const eventCreated = event.created

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, stripe_event_created_at')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (existingUser?.stripe_event_created_at && eventCreated && eventCreated < existingUser.stripe_event_created_at) {
      console.warn(`Stripe event ${event.id} is stale on subscription delete (${eventCreated} < ${existingUser.stripe_event_created_at})`)
      return NextResponse.json({ received: true, stale: true })
    }

    const { error } = await supabase
      .from('users')
      .update({
        plan: 'free',
        ...(eventCreated ? { stripe_event_created_at: eventCreated } : {}),
      })
      .eq('stripe_customer_id', customerId)
    if (error) {
      console.error('Failed to update user plan on subscription delete:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from('organizations')
      .update({ billing_plan: 'free' })
      .eq('stripe_customer_id', customerId)
  }

  // 6. Invoice Paid (Subscription renewal or direct invoice)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    const invoiceObj = event.data.object as unknown as Record<string, unknown>
    const subId = invoiceObj.subscription || (invoiceObj.parent as Record<string, unknown> | undefined)?.subscription_details
    
    // Check if this invoice is for a subscription renewal
    if (subId && customerId) {
      const { data: user } = await supabase
        .from('users')
        .select('id, plan')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (user && user.plan === 'free') {
        await supabase
          .from('users')
          .update({ plan: 'pro' })
          .eq('id', user.id)
      }
    }
  }

  // 7. Invoice Payment Failed (Dunning emails)
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    // Skip dunning email for initial signup payment attempt (handled in Checkout UI)
    if (invoice.billing_reason === 'subscription_create') {
      return NextResponse.json({ received: true, dunning_skipped: 'subscription_create' })
    }

    // Dedup dunning emails across retries
    const attemptCount = typeof invoice.attempt_count === 'number' ? invoice.attempt_count : 1
    const isFirstAttempt = attemptCount === 1
    const isFinalAttempt = invoice.next_payment_attempt === null
    if (!isFirstAttempt && !isFinalAttempt) {
      return NextResponse.json({ received: true, dunning_skipped: 'intermediate_retry' })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (!userData?.email) {
      console.warn(`payment_failed: no user mapped to stripe_customer_id ${customerId}`)
    }

    if (userData?.email) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      }).catch(() => null)

      const portalUrl = portalSession?.url ?? `${process.env.NEXT_PUBLIC_APP_URL}/settings`
      const name = esc(userData.name ?? 'there')

      const { error: emailError } = await resend.emails.send({
        from: 'Frevio <billing@frevio.cloud>',
        to: [userData.email],
        subject: 'Action required: update your payment method',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Inter',sans-serif;margin:0;padding:0;background:#f8fafc">
<div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:32px">
  <h1 style="color:#0f172a;font-size:20px;margin:0 0 8px">Payment failed</h1>
  <p style="color:#475569;font-size:15px">Hi ${name},</p>
  <p style="color:#475569;font-size:15px">We weren't able to process your Frevio subscription payment. Please update your payment method to keep your access.</p>
  <div style="margin:28px 0;text-align:center">
    <a href="${portalUrl}" style="background:#6366F1;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">
      Update payment method →
    </a>
  </div>
  <p style="color:#94a3b8;font-size:13px">If you have questions, reply to this email.</p>
</div>
</body>
</html>`,
      })

      if (emailError) {
        console.error('Failed to send payment failed email:', emailError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
