// Single source of truth for plan tiers, prices, limits, and feature lists.
//
// Every marketing surface (landing pricing section, /upgrade, settings billing)
// AND every enforcement point (free-project limit, seat limits, server-side plan gates) reads
// from here, so the tiers can never drift apart.

import { SupabaseClient } from '@supabase/supabase-js'

export const FREE_PROJECT_LIMIT = 2

export type PlanTier = 'free' | 'pro' | 'agency' | 'agency_scale'

export const PRICING = {
  monthly: 19,
  annual: 190,
} as const

// Launch promo: the first N freelancer signups get Pro free
export const LAUNCH_PROMO_CAP = 50

// Derived display values
export const ANNUAL_MONTHLY_EQUIV = Math.round((PRICING.annual / 12) * 100) / 100 // 15.83
export const ANNUAL_DISCOUNT_PCT = Math.round((1 - PRICING.annual / (PRICING.monthly * 12)) * 100) // 17%

export const AGENCY_PRICING = {
  agency: {
    monthly: 79,
    annual: 790,
    seats: 5,
  },
  scale: {
    monthly: 199,
    annual: 1990,
    seats: 25,
  },
  // Backward compatibility alias for legacy code
  starter: {
    monthly: 79,
    annual: 790,
    seats: 5,
  },
} as const

export const FREE_FEATURES = [
  'Up to 2 active projects',
  'Client portal & status pages',
  'Project updates & milestones',
  'Client kickoff checklist',
  'Client messaging',
  'Basic deliverable approvals',
  'Proposals & contracts',
  'Invoicing with Stripe payments',
  'Time & basic expense tracking',
  'Portfolio & testimonials',
  'Frevio branding',
]

export const PRO_FEATURES = [
  'Unlimited active projects',
  'Automated client emails via Resend',
  'Custom logo & accent color branding',
  'Remove "Powered by Frevio"',
  'Project duplication',
  'Advanced deliverable approvals',
  'Advanced client communication',
  'Expense & profit analytics',
  'Advanced invoicing',
  'Priority support',
]

export const AGENCY_FEATURES = [
  'Up to 5 team members',
  'Unlimited active projects',
  'Agency workspace & switcher',
  'Team roles & permissions (Owner, PM, Member)',
  'Project team assignments',
  'Staffed team pods',
  'Internal team notes & discussion',
  'Update staging & PM review workflow',
  'Agency activity & audit log',
  'Agency operations dashboard',
]

// Backward-compatible alias
export const AGENCY_STARTER_FEATURES = AGENCY_FEATURES

export const AGENCY_SCALE_FEATURES = [
  'Up to 25 team members',
  'Unlimited active projects',
  'Custom CNAME domain routing (status.agency.com)',
  '100% white-label client portal',
  'Custom favicon & agency portal URL',
  'Executive Radar & operational oversight',
  'Blocked cash & cashflow pipeline',
  'At-risk client account alerts',
  'Team workload & capacity analytics',
  'Priority 24/7 onboarding & agency support',
]

// One-liners for compact surfaces (e.g. the settings billing card)
export const PLAN_BLURB: Record<PlanTier, string> = {
  free: 'Up to 2 active projects, client portal, and invoicing.',
  pro: 'Unlimited projects, automated emails, and custom branding.',
  agency: 'Up to 5 team members, shared agency workspace, and team pods.',
  agency_scale: 'Up to 25 team members, custom CNAME domain, 100% white-label, and Executive Radar.',
} as const

/**
 * Normalizes legacy plan strings (e.g. 'freelancer', 'agency_starter', 'starter', 'agency_pro')
 * to standard PlanTier: 'free' | 'pro' | 'agency' | 'agency_scale'.
 */
export function normalizePlan(plan: string | null | undefined): PlanTier {
  if (!plan) return 'free'
  const p = plan.trim().toLowerCase()
  if (p === 'pro' || p === 'freelancer') return 'pro'
  if (p === 'agency' || p === 'agency_starter' || p === 'starter') return 'agency'
  if (p === 'agency_scale' || p === 'scale' || p === 'agency_pro' || p === 'enterprise') return 'agency_scale'
  return 'free'
}

/**
 * Returns true if the plan is any paid tier (Pro, Agency, or Agency Scale).
 */
export function isPaidPlan(plan: string | null | undefined): boolean {
  const normalized = normalizePlan(plan)
  return normalized !== 'free'
}

/**
 * Returns true if the plan is an Agency tier (Agency or Agency Scale).
 */
export function isAgencyPlan(plan: string | null | undefined): boolean {
  const normalized = normalizePlan(plan)
  return normalized === 'agency' || normalized === 'agency_scale'
}

/**
 * Returns true if the plan is Agency Scale.
 */
export function isScalePlan(plan: string | null | undefined): boolean {
  return normalizePlan(plan) === 'agency_scale'
}

/**
 * Returns feature limits for a given plan tier.
 */
export function getPlanLimits(plan: string | null | undefined) {
  const tier = normalizePlan(plan)
  switch (tier) {
    case 'agency_scale':
      return {
        maxProjects: Infinity,
        seats: 25,
        canRemoveBranding: true,
        canUseCustomDomain: true,
        canUseWhiteLabel: true,
        canDuplicateProjects: true,
        canSendAutomatedEmails: true,
        hasExecutiveRadar: true,
        hasTeamPods: true,
      }
    case 'agency':
      return {
        maxProjects: Infinity,
        seats: 5,
        canRemoveBranding: true,
        canUseCustomDomain: false,
        canUseWhiteLabel: false,
        canDuplicateProjects: true,
        canSendAutomatedEmails: true,
        hasExecutiveRadar: false,
        hasTeamPods: true,
      }
    case 'pro':
      return {
        maxProjects: Infinity,
        seats: 1,
        canRemoveBranding: true,
        canUseCustomDomain: false,
        canUseWhiteLabel: false,
        canDuplicateProjects: true,
        canSendAutomatedEmails: true,
        hasExecutiveRadar: false,
        hasTeamPods: false,
      }
    case 'free':
    default:
      return {
        maxProjects: FREE_PROJECT_LIMIT,
        seats: 1,
        canRemoveBranding: false,
        canUseCustomDomain: false,
        canUseWhiteLabel: false,
        canDuplicateProjects: false,
        canSendAutomatedEmails: false,
        hasExecutiveRadar: false,
        hasTeamPods: false,
      }
  }
}

/**
 * Check if the user can create another project based on their plan and current project count.
 */
export function canCreateProject(plan: string | null | undefined, currentCount: number): boolean {
  if (isPaidPlan(plan)) return true
  return currentCount < FREE_PROJECT_LIMIT
}

/**
 * Check if an organization can invite another member based on its plan and current total members.
 */
export function canInviteMember(orgPlan: string | null | undefined, currentMemberCount: number): boolean {
  const limits = getPlanLimits(orgPlan)
  return currentMemberCount < limits.seats
}

/**
 * Check if an organization is entitled to configure a custom CNAME domain.
 */
export function canUseCustomDomain(orgPlan: string | null | undefined): boolean {
  return isScalePlan(orgPlan)
}

/**
 * Check if an organization is entitled to 100% white-label branding & custom favicon.
 */
export function canUseWhiteLabel(orgPlan: string | null | undefined): boolean {
  return isScalePlan(orgPlan)
}

/**
 * Check dynamic promo expiration for users who received temporary promo Pro.
 */
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
