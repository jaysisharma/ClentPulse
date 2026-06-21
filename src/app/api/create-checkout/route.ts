import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as const })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const billing: 'monthly' | 'annual' = body.billing === 'annual' ? 'annual' : 'monthly'

  const priceId = billing === 'annual'
    ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID!
    : process.env.STRIPE_PRO_PRICE_ID!

  if (!priceId) {
    return NextResponse.json({ error: `Missing price ID for ${billing} billing` }, { status: 500 })
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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    metadata: {
      supabase_user_id: user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  })

  return NextResponse.json({ url: session.url })
}
