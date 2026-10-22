import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_connect_onboarded')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_account_id) {
    return NextResponse.json({
      connected: false,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    })
  }

  try {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    const chargesEnabled = Boolean(account.charges_enabled)
    const payoutsEnabled = Boolean(account.payouts_enabled)
    const detailsSubmitted = Boolean(account.details_submitted)

    // Sync state to database if changed
    if (
      chargesEnabled !== profile.stripe_charges_enabled ||
      payoutsEnabled !== profile.stripe_payouts_enabled ||
      detailsSubmitted !== profile.stripe_connect_onboarded
    ) {
      await supabase
        .from('users')
        .update({
          stripe_charges_enabled: chargesEnabled,
          stripe_payouts_enabled: payoutsEnabled,
          stripe_connect_onboarded: detailsSubmitted,
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      connected: true,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      details_submitted: detailsSubmitted,
      accountId: account.id,
    })
  } catch (err: any) {
    console.error('Failed to retrieve Connect account status:', err)
    return NextResponse.json({
      connected: true,
      charges_enabled: Boolean(profile.stripe_charges_enabled),
      payouts_enabled: Boolean(profile.stripe_payouts_enabled),
      details_submitted: Boolean(profile.stripe_connect_onboarded),
      accountId: profile.stripe_account_id,
      error: err.message,
    })
  }
}
