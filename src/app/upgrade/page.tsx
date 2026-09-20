'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Check, Sparkles, Loader2, ShieldCheck, Building2, User } from 'lucide-react'
import {
  FREE_FEATURES,
  PRO_FEATURES,
  PRICING,
  AGENCY_PRICING,
  AGENCY_FEATURES,
  AGENCY_SCALE_FEATURES,
} from '@/lib/plans'
import { ACTIVE_WORKSPACE_COOKIE, parseActiveWorkspaceId } from '@/lib/workspace'

export default function UpgradePage() {
  const router = useRouter()
  const [tierCategory, setTierCategory] = useState<'freelancer' | 'agency'>('freelancer')
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')

  useEffect(() => {
    let orgId = 'personal'
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${ACTIVE_WORKSPACE_COOKIE}=`))
      if (match) {
        orgId = parseActiveWorkspaceId(decodeURIComponent(match.split('=')[1]))
      }
    }
    if (orgId !== 'personal') {
      setActiveOrgId(orgId)
      setTierCategory('agency')
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) { router.push('/auth/login'); return }
      supabase.from('users').select('id, plan, promo_pro, created_at').eq('id', user.id).single().then(async ({ data: profile }: { data: any }) => {
        const { checkAndSyncPromoPlan } = await import('@/lib/plans')
        const syncedPlan = await checkAndSyncPromoPlan(profile, supabase)
        setCurrentPlan(syncedPlan)
      })
    })
  }, [router])

  async function handleUpgrade(planTier: 'pro' | 'agency' | 'agency_scale') {
    setLoading(planTier)
    setError('')

    let targetOrgId = activeOrgId

    if ((planTier === 'agency' || planTier === 'agency_scale') && !targetOrgId) {
      try {
        const orgRes = await fetch('/api/organizations')
        if (orgRes.ok) {
          const orgData = await orgRes.json()
          const firstOrg = orgData.memberships?.[0]?.organization
          if (firstOrg) {
            targetOrgId = firstOrg.id
            setActiveOrgId(firstOrg.id)
            if (typeof document !== 'undefined') {
              const { setActiveWorkspaceCookie } = await import('@/lib/workspace')
              setActiveWorkspaceCookie(firstOrg.id)
            }
          } else {
            // Auto create initial agency workspace for user
            const createRes = await fetch('/api/organizations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Agency Workspace' }),
            })
            if (createRes.ok) {
              const newOrgData = await createRes.json()
              const createdId = newOrgData.organization?.id
              if (createdId) {
                targetOrgId = createdId
                setActiveOrgId(createdId)
                if (typeof document !== 'undefined') {
                  const { setActiveWorkspaceCookie } = await import('@/lib/workspace')
                  setActiveWorkspaceCookie(createdId)
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Auto organization setup warning:', err)
      }
    }

    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        billing,
        planTier,
        orgId: (planTier === 'agency' || planTier === 'agency_scale') ? targetOrgId : null,
      }),
    })
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(null)
      return
    }
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  const proMonthly = PRICING.monthly
  const proAnnualMonthlyEquiv = Math.round((PRICING.annual / 12) * 100) / 100
  const agencyMonthly = AGENCY_PRICING.agency.monthly
  const agencyAnnualMonthlyEquiv = Math.round((AGENCY_PRICING.agency.annual / 12) * 100) / 100
  const scaleMonthly = AGENCY_PRICING.scale.monthly
  const scaleAnnualMonthlyEquiv = Math.round((AGENCY_PRICING.scale.annual / 12) * 100) / 100

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-4xl mx-auto animate-fade-in relative z-10 pb-16 pt-2">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Membership & Subscriptions
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Scale Your Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-2 max-w-lg mx-auto">
              Simple, transparent pricing built for client service. Choose the plan that fits your workload.
            </p>
          </div>

          {/* Tier Category Switcher (Freelancer vs Agency) */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTierCategory('freelancer')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  tierCategory === 'freelancer'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Freelancer Suite</span>
              </button>

              <button
                type="button"
                onClick={() => setTierCategory('agency')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  tierCategory === 'agency'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Agency & Studio</span>
              </button>
            </div>
          </div>

          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                billing === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBilling(b => (b === 'monthly' ? 'annual' : 'monthly'))}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none border cursor-pointer ${
                billing === 'annual'
                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                  : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full shadow-xs transition-transform duration-200 ${
                  billing === 'annual'
                    ? 'translate-x-6 bg-white dark:bg-slate-900'
                    : 'translate-x-0 bg-white dark:bg-slate-200'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                billing === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}
            >
              Annual
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Save 2 months
              </span>
            </button>
          </div>

          {/* Category: Freelancer Tier Cards */}
          {tierCategory === 'freelancer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
              {/* Free */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-7 flex flex-col justify-between backdrop-blur-md shadow-xs dark:shadow-none">
                <div>
                  <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Free
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-light tracking-tight text-slate-900 dark:text-white font-mono">$0</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-light">/ forever</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      For testing Frevio with your first clients.
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {FREE_FEATURES.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-full py-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                  {currentPlan === 'free' ? 'Current Plan' : 'Free Forever'}
                </div>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-b from-slate-900 to-black dark:from-[#14151e] dark:to-[#0c0d12] rounded-2xl border border-indigo-500/40 ring-1 ring-indigo-500/20 p-7 text-white flex flex-col justify-between relative shadow-xl shadow-indigo-500/5">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    Solo Specialist
                  </span>
                </div>

                <div>
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
                      Pro
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      {billing === 'monthly' ? (
                        <>
                          <span className="text-4xl font-light tracking-tight text-white font-mono">${proMonthly}</span>
                          <span className="text-xs text-slate-400 font-light">/ month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-light tracking-tight text-white font-mono">${PRICING.annual}</span>
                          <span className="text-xs text-slate-400 font-light">
                            / year · ${proAnnualMonthlyEquiv}/mo
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-indigo-200/80 mt-1">
                      For independent freelancers and solo studios wanting a polished, branded client experience.
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {PRO_FEATURES.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade('pro')}
                  disabled={Boolean(loading) || currentPlan === 'pro'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading === 'pro' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  {currentPlan === 'pro' ? 'Current Plan' : 'Start 14-Day Pro Trial'}
                </button>
              </div>
            </div>
          )}

          {/* Category: Agency Tier Cards */}
          {tierCategory === 'agency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
              {/* Agency */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-7 flex flex-col justify-between backdrop-blur-md shadow-xs dark:shadow-none">
                <div>
                  <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                      Agency
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-light tracking-tight text-slate-900 dark:text-white font-mono">
                        ${billing === 'monthly' ? agencyMonthly : agencyAnnualMonthlyEquiv}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-light">
                        / month {billing === 'annual' && `(billed $${AGENCY_PRICING.agency.annual}/yr)`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      Includes 5 team members + shared pods
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {AGENCY_FEATURES.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade('agency')}
                  disabled={Boolean(loading) || currentPlan === 'agency'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading === 'agency' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" />
                  )}
                  {currentPlan === 'agency' ? 'Current Plan' : 'Start 14-Day Agency Trial ($79/mo)'}
                </button>
              </div>

              {/* Agency Scale */}
              <div className="bg-gradient-to-b from-slate-900 to-black dark:from-[#14151e] dark:to-[#0c0d12] rounded-2xl border border-indigo-500/40 ring-1 ring-indigo-500/20 p-7 text-white flex flex-col justify-between relative shadow-xl shadow-indigo-500/5">
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    Full Operations
                  </span>
                </div>

                <div>
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
                      Agency Scale
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-light tracking-tight text-white font-mono">
                        ${billing === 'monthly' ? scaleMonthly : scaleAnnualMonthlyEquiv}
                      </span>
                      <span className="text-xs text-slate-400 font-light">
                        / month {billing === 'annual' && `(billed $${AGENCY_PRICING.scale.annual}/yr)`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 font-mono">
                      Includes 25 team members + custom CNAME & Radar
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {AGENCY_SCALE_FEATURES.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade('agency_scale')}
                  disabled={Boolean(loading) || currentPlan === 'agency_scale'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading === 'agency_scale' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  {currentPlan === 'agency_scale' ? 'Current Plan' : 'Start 14-Day Scale Trial ($199/mo)'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 text-center mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-500 font-light">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>14-day free trial on all paid plans. Encrypted Stripe checkout. Cancel anytime with 1-click.</span>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
