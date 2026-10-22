import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { normalizePlan } from '@/lib/plans'
import { checkRateLimit } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as const })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 10 checkout creations per minute per user
  const rateLimit = checkRateLimit(`checkout_${user.id}`, 10, 60)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many checkout requests. Please wait ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const billing: 'monthly' | 'annual' = body.billing === 'annual' ? 'annual' : 'monthly'
  const rawTier: string = body.planTier || body.plan || 'pro'
  const normalizedTier = normalizePlan(rawTier)
  const orgId: string | null = body.orgId || null

  // Authorization check on orgId
  if (orgId) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage billing for this organization' },
        { status: 403 }
      )
    }
  }

  let priceId: string | undefined

  if (normalizedTier === 'agency_scale') {
    priceId = billing === 'annual'
      ? (process.env.STRIPE_SCALE_ANNUAL_PRICE_ID || process.env.STRIPE_AGENCY_SCALE_ANNUAL_PRICE_ID)
      : (process.env.STRIPE_SCALE_PRICE_ID || process.env.STRIPE_SCALE_MONTHLY_PRICE_ID || process.env.STRIPE_AGENCY_SCALE_PRICE_ID)
  } else if (normalizedTier === 'agency') {
    priceId = billing === 'annual'
      ? (process.env.STRIPE_STUDIO_ANNUAL_PRICE_ID || process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID || process.env.STRIPE_AGENCY_STARTER_ANNUAL_PRICE_ID)
      : (process.env.STRIPE_STUDIO_PRICE_ID || process.env.STRIPE_STUDIO_MONTHLY_PRICE_ID || process.env.STRIPE_AGENCY_PRICE_ID || process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID || process.env.STRIPE_AGENCY_STARTER_PRICE_ID)
  } else if (normalizedTier === 'pro') {
    priceId = billing === 'annual'
      ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
      : (process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_MONTHLY_PRICE_ID)
  } else {
    return NextResponse.json({ error: `Invalid or unbillable plan tier: ${rawTier}` }, { status: 400 })
  }

  // Fail-closed: Never silently replace a missing tier's price with another plan's price
  if (!priceId) {
    return NextResponse.json({
      error: `Missing configured Stripe price ID for ${normalizedTier} (${billing}). Please configure the price ID in environment variables.`,
    }, { status: 500 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 400 })
  }

  let customerId = profile.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    const { error: updateError } = await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    if (updateError) {
      console.error('Failed to store Stripe customer ID:', updateError)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const successUrl = (normalizedTier === 'agency' || normalizedTier === 'agency_scale' || orgId)
    ? `${appUrl}/dashboard?agency=true&upgraded=1`
    : `${appUrl}/dashboard?freelancer=true&upgraded=1`

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    mode: 'subscription',
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        supabase_user_id: user.id,
        plan_tier: normalizedTier,
        raw_tier: rawTier,
        ...(orgId ? { org_id: orgId } : {}),
      },
    },
    metadata: {
      supabase_user_id: user.id,
      plan_tier: normalizedTier,
      raw_tier: rawTier,
      ...(orgId ? { org_id: orgId } : {}),
    },
    success_url: successUrl,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  })

  return NextResponse.json({ url: session.url })
}
