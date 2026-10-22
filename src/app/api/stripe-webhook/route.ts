import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
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
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('Webhook signature verification error:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Webhook event idempotency guard
  const { error: idempotencyError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: event.id, status: 'processing' })

  if (idempotencyError) {
    if (idempotencyError.code === '23505') {
      console.log(`Stripe Webhook event already processed: ${event.id}`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('Failed to register webhook event idempotency:', idempotencyError)
    return NextResponse.json({ error: 'Failed to verify event idempotency' }, { status: 500 })
  }

  try {
    // -------------------------------------------------------------
    // Platform Subscription Checkout Completion
    // -------------------------------------------------------------
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.metadata?.type === 'invoice_payment') {
        const invoiceId = session.metadata.invoice_id || session.metadata.invoiceId
        if (invoiceId) {
          await supabase
            .from('invoices')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', invoiceId)
        }
        await supabase.from('processed_stripe_events').update({ status: 'done' }).eq('event_id', event.id)
        return NextResponse.json({ received: true })
      }

      if (session.metadata?.type === 'change_order_payment') {
        const changeOrderId = session.metadata.change_order_id || session.metadata.changeOrderId
        if (changeOrderId) {
          await supabase
            .from('change_orders')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', changeOrderId)
        }
        await supabase.from('processed_stripe_events').update({ status: 'done' }).eq('event_id', event.id)
        return NextResponse.json({ received: true })
      }

      // Platform subscription checkout
      const customerId = session.customer as string
      const userId = session.client_reference_id || session.metadata?.supabase_user_id
      const rawTier = session.metadata?.plan_tier || 'pro'
      const planTier = normalizePlan(rawTier)
      const orgId = session.metadata?.org_id
      const eventCreated = event.created

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
          throw new Error(`Failed to update user plan: ${error.message}`)
        }
      }

      if (orgId) {
        const orgBillingPlan = planTier === 'agency_scale' ? 'agency_pro' : 'starter'
        await supabase
          .from('organizations')
          .update({ billing_plan: orgBillingPlan, stripe_customer_id: customerId })
          .eq('id', orgId)
      }
    }

    // -------------------------------------------------------------
    // Subscription Lifecycle: Created / Updated / Deleted
    // -------------------------------------------------------------
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const eventCreated = event.created

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, plan, stripe_event_created_at')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (existingUser?.stripe_event_created_at && eventCreated && eventCreated < existingUser.stripe_event_created_at) {
        console.warn(`Stripe event ${event.id} is stale on subscription update (${eventCreated} < ${existingUser.stripe_event_created_at})`)
        return NextResponse.json({ received: true, stale: true })
      }

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
        if (error) throw new Error(`Failed to demote user: ${error.message}`)

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
        if (error) throw new Error(`Failed to update user plan: ${error.message}`)

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
      if (error) throw new Error(`Failed to demote user plan: ${error.message}`)

      await supabase
        .from('organizations')
        .update({ billing_plan: 'free' })
        .eq('stripe_customer_id', customerId)
    }

    // -------------------------------------------------------------
    // Invoice Paid (Subscription renewal)
    // -------------------------------------------------------------
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const invoiceObj = event.data.object as unknown as Record<string, unknown>
      const subId = invoiceObj.subscription || (invoiceObj.parent as Record<string, unknown> | undefined)?.subscription_details
      
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

    // -------------------------------------------------------------
    // Invoice Payment Failed (Dunning emails)
    // -------------------------------------------------------------
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      if (invoice.billing_reason === 'subscription_create') {
        return NextResponse.json({ received: true, dunning_skipped: 'subscription_create' })
      }

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

    // REQUIREMENT (b): Update status = 'done' on success
    await supabase
      .from('processed_stripe_events')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .eq('event_id', event.id)

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    // REQUIREMENT (b): Delete the row on failure so Stripe retry succeeds
    console.error(`Webhook handler failed on event ${event.id}:`, err)
    await supabase
      .from('processed_stripe_events')
      .delete()
      .eq('event_id', event.id)

    const msg = err instanceof Error ? err.message : 'Processing failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
