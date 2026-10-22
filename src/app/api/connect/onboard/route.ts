import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rateLimit = checkRateLimit(`connect_onboard_${user.id}`, 5, 60)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    )
  }

  // 1. Fetch user's current Connect account ID if already exists
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_account_id, email, name')
    .eq('id', user.id)
    .single()

  let stripeAccountId = profile?.stripe_account_id

  // 2. If no account exists, create a Standard Stripe Connect account
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: user.email,
      business_profile: {
        name: profile?.name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Freelance Studio'),
        product_description: 'Freelance & Studio Client Services via Frevio',
        url: 'https://frevio.cloud',
      },
      metadata: {
        supabase_user_id: user.id,
      },
    })

    stripeAccountId = account.id

    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to save stripe_account_id:', updateError)
      return NextResponse.json({ error: 'Failed to initialize Connect account' }, { status: 500 })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // 3. Create Account Link for Stripe-hosted onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/settings/integrations?connect=refresh`,
    return_url: `${appUrl}/settings/integrations?connect=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
