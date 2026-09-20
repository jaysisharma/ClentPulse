import { describe, it, expect } from 'vitest'
import {
  FREE_PROJECT_LIMIT,
  PRICING,
  AGENCY_PRICING,
  normalizePlan,
  isPaidPlan,
  isAgencyPlan,
  isScalePlan,
  getPlanLimits,
  canCreateProject,
  canInviteMember,
  canUseCustomDomain,
  canUseWhiteLabel,
  FREE_FEATURES,
  PRO_FEATURES,
  AGENCY_FEATURES,
  AGENCY_SCALE_FEATURES,
} from '../plans'

describe('Plan Definitions and Helpers', () => {
  it('defines correct project limits and pricing', () => {
    expect(FREE_PROJECT_LIMIT).toBe(2)
    expect(PRICING.monthly).toBe(19)
    expect(PRICING.annual).toBe(190)
    expect(AGENCY_PRICING.agency.monthly).toBe(79)
    expect(AGENCY_PRICING.agency.annual).toBe(790)
    expect(AGENCY_PRICING.scale.monthly).toBe(199)
    expect(AGENCY_PRICING.scale.annual).toBe(1990)
  })

  it('normalizes legacy and variant plan strings', () => {
    expect(normalizePlan('free')).toBe('free')
    expect(normalizePlan(null)).toBe('free')
    expect(normalizePlan(undefined)).toBe('free')
    expect(normalizePlan('')).toBe('free')
    expect(normalizePlan('pro')).toBe('pro')
    expect(normalizePlan('freelancer')).toBe('pro')
    expect(normalizePlan('agency')).toBe('agency')
    expect(normalizePlan('agency_starter')).toBe('agency')
    expect(normalizePlan('starter')).toBe('agency')
    expect(normalizePlan('agency_scale')).toBe('agency_scale')
    expect(normalizePlan('scale')).toBe('agency_scale')
    expect(normalizePlan('agency_pro')).toBe('agency_scale')
    expect(normalizePlan('enterprise')).toBe('agency_scale')
  })

  it('correctly identifies paid, agency, and scale tiers', () => {
    expect(isPaidPlan('free')).toBe(false)
    expect(isPaidPlan('pro')).toBe(true)
    expect(isPaidPlan('agency_starter')).toBe(true)
    expect(isPaidPlan('agency_scale')).toBe(true)

    expect(isAgencyPlan('free')).toBe(false)
    expect(isAgencyPlan('pro')).toBe(false)
    expect(isAgencyPlan('agency')).toBe(true)
    expect(isAgencyPlan('agency_starter')).toBe(true)
    expect(isAgencyPlan('agency_scale')).toBe(true)

    expect(isScalePlan('agency')).toBe(false)
    expect(isScalePlan('agency_scale')).toBe(true)
    expect(isScalePlan('agency_pro')).toBe(true)
  })

  it('enforces project creation limits', () => {
    // Free plan: maximum 2 active projects
    expect(canCreateProject('free', 0)).toBe(true)
    expect(canCreateProject('free', 1)).toBe(true)
    expect(canCreateProject('free', 2)).toBe(false)
    expect(canCreateProject('free', 5)).toBe(false)

    // Paid plans: unlimited
    expect(canCreateProject('pro', 0)).toBe(true)
    expect(canCreateProject('pro', 2)).toBe(true)
    expect(canCreateProject('pro', 100)).toBe(true)
    expect(canCreateProject('agency', 50)).toBe(true)
    expect(canCreateProject('agency_scale', 50)).toBe(true)
  })

  it('enforces member invitation seat limits', () => {
    // Free / Pro: 1 seat
    expect(canInviteMember('free', 0)).toBe(true)
    expect(canInviteMember('free', 1)).toBe(false)

    // Agency: 5 seats
    expect(canInviteMember('agency', 4)).toBe(true)
    expect(canInviteMember('agency', 5)).toBe(false)
    expect(canInviteMember('agency_starter', 4)).toBe(true)
    expect(canInviteMember('agency_starter', 5)).toBe(false)

    // Agency Scale: 25 seats
    expect(canInviteMember('agency_scale', 24)).toBe(true)
    expect(canInviteMember('agency_scale', 25)).toBe(false)
    expect(canInviteMember('agency_pro', 24)).toBe(true)
    expect(canInviteMember('agency_pro', 25)).toBe(false)
  })

  it('restricts custom domain and white-labeling to Agency Scale', () => {
    expect(canUseCustomDomain('free')).toBe(false)
    expect(canUseCustomDomain('pro')).toBe(false)
    expect(canUseCustomDomain('agency')).toBe(false)
    expect(canUseCustomDomain('agency_scale')).toBe(true)
    expect(canUseCustomDomain('agency_pro')).toBe(true)

    expect(canUseWhiteLabel('free')).toBe(false)
    expect(canUseWhiteLabel('pro')).toBe(false)
    expect(canUseWhiteLabel('agency')).toBe(false)
    expect(canUseWhiteLabel('agency_scale')).toBe(true)
  })

  it('provides detailed plan limits', () => {
    const freeLimits = getPlanLimits('free')
    expect(freeLimits.maxProjects).toBe(2)
    expect(freeLimits.seats).toBe(1)
    expect(freeLimits.canRemoveBranding).toBe(false)
    expect(freeLimits.canSendAutomatedEmails).toBe(false)

    const proLimits = getPlanLimits('pro')
    expect(proLimits.maxProjects).toBe(Infinity)
    expect(proLimits.seats).toBe(1)
    expect(proLimits.canRemoveBranding).toBe(true)
    expect(proLimits.canSendAutomatedEmails).toBe(true)

    const agencyLimits = getPlanLimits('agency')
    expect(agencyLimits.maxProjects).toBe(Infinity)
    expect(agencyLimits.seats).toBe(5)
    expect(agencyLimits.canUseCustomDomain).toBe(false)

    const scaleLimits = getPlanLimits('agency_scale')
    expect(scaleLimits.maxProjects).toBe(Infinity)
    expect(scaleLimits.seats).toBe(25)
    expect(scaleLimits.canUseCustomDomain).toBe(true)
    expect(scaleLimits.canUseWhiteLabel).toBe(true)
    expect(scaleLimits.hasExecutiveRadar).toBe(true)
  })

  it('includes expected features in each tier', () => {
    expect(FREE_FEATURES).toContain('Up to 2 active projects')
    expect(FREE_FEATURES).toContain('Invoicing with Stripe payments')
    expect(FREE_FEATURES).toContain('Frevio branding')

    expect(PRO_FEATURES).toContain('Unlimited active projects')
    expect(PRO_FEATURES).toContain('Automated client emails via Resend')
    expect(PRO_FEATURES).toContain('Remove "Powered by Frevio"')
    expect(PRO_FEATURES).toContain('Project duplication')

    expect(AGENCY_FEATURES).toContain('Up to 5 team members')
    expect(AGENCY_FEATURES).toContain('Agency workspace & switcher')

    expect(AGENCY_SCALE_FEATURES).toContain('Up to 25 team members')
    expect(AGENCY_SCALE_FEATURES).toContain('Custom CNAME domain routing (status.agency.com)')
    expect(AGENCY_SCALE_FEATURES).toContain('100% white-label client portal')
  })
})
