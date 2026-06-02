import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as const })
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
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Stripe verifies the request via the signature check above; this handler has no
  // user session, so it must use the service-role admin client to bypass RLS and
  // write plan/invoice state for arbitrary customers. The anon client silently
  // matches 0 rows here (RLS requires auth.uid() = id, which is null for webhooks).
  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.metadata?.type === 'invoice_payment') {
      const invoiceId = session.metadata.invoice_id
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', invoiceId)
      }
    } else {
      const customerId = session.customer as string
      await supabase
        .from('users')
        .update({ plan: 'pro' })
        .eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await supabase
      .from('users')
      .update({ plan: 'free' })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    // Entitlement statuses: a paying customer keeps Pro while active, in trial, or
    // in the card-retry grace window (past_due). Only customer.subscription.deleted
    // (or a terminal status) revokes — flipping to free on a transient past_due would
    // strip Pro mid-cycle from someone whose renewal is simply being retried.
    const entitled = ['active', 'trialing', 'past_due']
    const plan = entitled.includes(subscription.status) ? 'pro' : 'free'

    await supabase
      .from('users')
      .update({ plan })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

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
        from: 'ClientPulse <billing@clientpulse.app>',
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
  <p style="color:#475569;font-size:15px">We weren't able to process your ClientPulse Pro subscription payment. Please update your payment method to keep your Pro access.</p>
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
