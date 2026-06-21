// Single source of truth for plan tiers, prices, and feature lists.
//
// Every marketing surface (landing pricing section, /upgrade, settings billing)
// AND every enforcement point (free-project limit, server-side plan gates) reads
// from here, so the tiers can never drift apart again.
//
// Canonical split:
//   FREE  — run a few client projects end to end (projects, invoicing, contracts,
//           time/billable tracking, a public status page, copy-paste updates).
//   PRO   — scale + look professional + automate: unlimited projects, automated
//           client emails, custom branding, white-label status pages, project
//           duplication, priority support.
// Features NOT listed under Pro are available on Free. Don't market a feature as
// Pro unless it is actually gated in code (see the enforcement points below).

import { SupabaseClient } from '@supabase/supabase-js'

export const FREE_PROJECT_LIMIT = 3

export const PRICING = {
  monthly: 15,
  annual: 120,
} as const

// Launch promo: the first N freelancer signups get Pro free (see promo_pro in
// supabase-migration-promo.sql). The live count lives in the public.launch_promo
// table; this is just the display cap.
export const LAUNCH_PROMO_CAP = 50

// Derived display values — keep these computed so a price change is one edit.
export const ANNUAL_MONTHLY_EQUIV = Math.round((PRICING.annual / 12) * 100) / 100 // 8.25
export const ANNUAL_DISCOUNT_PCT = Math.round((1 - PRICING.annual / (PRICING.monthly * 12)) * 100) // 31

export const FREE_FEATURES = [
  'Up to 3 active projects',
  'Client status pages',
  'Invoicing & contracts',
  'Time & billable tracking',
  'Copy-paste email updates',
]

// Only list a feature here if it is enforced server-side. Current gates:
//   • Unlimited projects     → DB trigger enforce_project_limit + /project/new gate
//   • Automated client emails → /api/send-update (plan check)
//   • Custom branding        → /p/[slug] + settings (plan check)
//   • White-label status page → /p/[slug] (hides the Frevio badge for pro)
//   • Duplicate projects     → /api/duplicate-project (plan check)
export const PRO_FEATURES = [
  'Unlimited projects',
  'Automated client emails',
  'Custom branding — logo & accent',
  'White-label status pages',
  'Duplicate projects',
  'Priority support',
]

// One-liners for compact surfaces (e.g. the settings billing card).
export const PLAN_BLURB = {
  free: 'Up to 3 projects, invoicing, and a public client status page.',
  pro: 'Unlimited projects, automated emails, and custom branding.',
} as const

export async function checkAndSyncPromoPlan(
  user: { plan: string; promo_pro?: boolean; created_at?: string; id: string } | null,
  supabase: SupabaseClient
): Promise<string> {
  if (!user) return 'free'
  if (user.plan === 'pro' && user.promo_pro && user.created_at) {
    const isExpired = new Date(user.created_at).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000
    if (isExpired) {
      await supabase.from('users').update({ plan: 'free', promo_pro: false }).eq('id', user.id)
      return 'free'
    }
  }
  return user.plan
}

