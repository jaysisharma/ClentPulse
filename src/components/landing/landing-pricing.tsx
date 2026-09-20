'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Sparkles, Building2, ShieldCheck, Zap } from 'lucide-react'
import {
  PRICING,
  AGENCY_PRICING,
  ANNUAL_DISCOUNT_PCT,
} from '@/lib/plans'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ACCENT = '#6C4CFD'

export function LandingPricing() {
  const [annual, setAnnual] = useState(false)

  const proMonthly = PRICING.monthly
  const proAnnualMonthlyEquiv = Math.round((PRICING.annual / 12) * 100) / 100

  const agencyMonthly = AGENCY_PRICING.agency.monthly
  const agencyAnnualMonthlyEquiv = Math.round((AGENCY_PRICING.agency.annual / 12) * 100) / 100

  const scaleMonthly = AGENCY_PRICING.scale.monthly
  const scaleAnnualMonthlyEquiv = Math.round((AGENCY_PRICING.scale.annual / 12) * 100) / 100

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pricing-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {/* Interval toggle (Monthly vs Annual) */}
      <div className="mb-14 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-white/[0.04] p-1 border border-white/10 shadow-xs">
          {(['monthly', 'annual'] as const).map(key => {
            const active = (key === 'annual') === annual
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAnnual(key === 'annual')}
                className={`rounded-full px-5 py-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  active 
                    ? 'bg-white text-slate-950 shadow-md font-bold' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {key}
                {key === 'annual' && (
                  <span className="ml-1.5 text-[10px] font-bold text-emerald-400">
                    −{ANNUAL_DISCOUNT_PCT}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4-Tier Side-by-Side Progressive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        
        {/* Tier 1: Free */}
        <div className="pricing-card rounded-2xl border border-white/10 bg-[#0d0e13]/90 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Free</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                Solo Start
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tracking-tight text-white font-mono">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Run your first client projects end to end with zero cost.
              </p>
            </div>

            <a
              href="/auth/login?mode=signup"
              className="w-full block py-2.5 px-4 rounded-xl text-center text-xs font-semibold uppercase tracking-wider border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors mb-6"
            >
              Get started free
            </a>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1">Included:</div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>2 active</strong> projects</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Client status portal & updates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Kickoff checklist & messaging</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Stripe invoice payments</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Basic time & expense tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Proposals & contracts</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 text-[11px] text-slate-500">
            Frevio branding on status pages
          </div>
        </div>

        {/* Tier 2: Pro (Highlighted) */}
        <div className="pricing-card relative rounded-2xl bg-gradient-to-b from-[#131422] to-[#0c0d14] border border-indigo-500/40 ring-1 ring-indigo-500/20 p-6 flex flex-col justify-between shadow-xl shadow-indigo-500/5 hover:border-indigo-400 transition-all duration-200">
          <div className="absolute -top-2.5 right-6">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-sm">
              Popular
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Pro</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                Solo Studio
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tracking-tight text-white font-mono">
                  ${annual ? proAnnualMonthlyEquiv : proMonthly}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-[11px] text-indigo-200/80 mt-2 leading-relaxed">
                {annual ? `Billed $${PRICING.annual}/year. ` : ''}A polished, white-glove brand experience for independent pros.
              </p>
            </div>

            <a
              href="/auth/login?mode=signup"
              className="w-full block py-2.5 px-4 rounded-xl text-center text-xs font-semibold uppercase tracking-wider bg-white hover:bg-slate-100 text-slate-950 transition-all shadow-md mb-6"
            >
              Start 14-day free trial
            </a>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/70 pb-1">Everything in Free, plus:</div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited active</strong> projects</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Automated client emails via Resend</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Custom logo & accent color branding</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Remove &ldquo;Powered by Frevio&rdquo;</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Project duplication</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Profit & expense analytics</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 text-[11px] text-indigo-300/80">
            Priority technical support
          </div>
        </div>

        {/* Tier 3: Agency */}
        <div className="pricing-card rounded-2xl border border-white/10 bg-[#0d0e13]/90 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Agency</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                5 Seats
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tracking-tight text-white font-mono">
                  ${annual ? agencyAnnualMonthlyEquiv : agencyMonthly}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {annual ? `Billed $${AGENCY_PRICING.agency.annual}/year. ` : ''}Built for small agencies running multiple client pods.
              </p>
            </div>

            <a
              href="/auth/login?mode=signup"
              className="w-full block py-2.5 px-4 rounded-xl text-center text-xs font-semibold uppercase tracking-wider border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors mb-6"
            >
              Start 14-day agency trial
            </a>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1">Everything in Pro, plus:</div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span><strong>Up to 5 team members</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Agency workspace & switcher</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Team roles (Owner, PM, Member)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Staffed project team pods</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Update staging & PM review workflow</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Internal notes & agency audit log</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 text-[11px] text-slate-500">
            Agency operations dashboard
          </div>
        </div>

        {/* Tier 4: Agency Scale */}
        <div className="pricing-card rounded-2xl bg-gradient-to-b from-[#151722] to-[#0c0d14] border border-white/15 p-6 flex flex-col justify-between hover:border-indigo-400/40 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Agency Scale</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white">
                25 Seats
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tracking-tight text-white font-mono">
                  ${annual ? scaleAnnualMonthlyEquiv : scaleMonthly}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {annual ? `Billed $${AGENCY_PRICING.scale.annual}/year. ` : ''}For mature production studios requiring CNAME routing & radar.
              </p>
            </div>

            <a
              href="/auth/login?mode=signup"
              className="w-full block py-2.5 px-4 rounded-xl text-center text-xs font-semibold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md mb-6"
            >
              Activate Scale
            </a>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">Everything in Agency, plus:</div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span><strong>Up to 25 team members</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span><strong>Custom CNAME domain</strong> (status.agency.com)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>100% white-label client portal</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Custom agency favicon & portal URL</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Executive Radar & blockers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Blocked cash & cashflow pipeline</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 text-[11px] text-slate-400">
            Priority 24/7 dedicated agency support
          </div>
        </div>

      </div>

      {/* Security note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-slate-500" />
        <span>Encrypted Stripe checkout. Instant activation across your projects and workspace.</span>
      </div>
    </div>
  )
}
