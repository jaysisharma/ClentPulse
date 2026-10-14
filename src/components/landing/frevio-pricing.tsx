'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowUpRight } from 'lucide-react'
import {
  PRICING,
  AGENCY_PRICING,
  ANNUAL_DISCOUNT_PCT,
  FREE_FEATURES,
  PRO_FEATURES,
  AGENCY_FEATURES,
  AGENCY_SCALE_FEATURES,
} from '@/lib/plans'

interface FrevioPricingProps {
  signupHref: string
}

export function FrevioPricing({ signupHref }: FrevioPricingProps) {
  const [annual, setAnnual] = useState(false)

  const proPrice = annual ? Math.round(PRICING.annual / 12) : PRICING.monthly
  const agencyPrice = annual ? Math.round(AGENCY_PRICING.agency.annual / 12) : AGENCY_PRICING.agency.monthly
  const scalePrice = annual ? Math.round(AGENCY_PRICING.scale.annual / 12) : AGENCY_PRICING.scale.monthly

  const tiers = [
    {
      name: 'Free',
      target: 'Independent freelancers starting out',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 2 active projects',
        'Client portal & status pages',
        'Project updates & milestones',
        'Deliverable sign-offs & approvals',
        'Invoicing with Stripe Checkout',
        'Time & expense tracking',
      ],
      cta: 'Start free',
      href: signupHref,
      popular: false,
    },
    {
      name: 'Pro',
      target: 'Full-time freelancers & solo studios',
      price: `$${proPrice}`,
      period: annual ? '/mo (billed annually)' : '/month',
      features: [
        'Unlimited active projects',
        'Custom logo & accent branding',
        'Remove "Powered by Frevio"',
        'Automated emails via Resend',
        'Project duplication & templates',
        'Advanced analytics & profit tracking',
      ],
      cta: 'Start Pro',
      href: signupHref,
      popular: true,
    },
    {
      name: 'Agency',
      target: 'Growing creative teams & studios',
      price: `$${agencyPrice}`,
      period: annual ? '/mo (billed annually)' : '/month',
      features: [
        'Up to 5 team members',
        'Unlimited active projects',
        'Agency workspace switcher',
        'Team roles (Owner, PM, Member)',
        'Project pods & assignments',
        'PM review & staging workflow',
      ],
      cta: 'Start Agency',
      href: signupHref,
      popular: false,
    },
    {
      name: 'Agency Scale',
      target: 'Established agencies with high volume',
      price: `$${scalePrice}`,
      period: annual ? '/mo (billed annually)' : '/month',
      features: [
        'Up to 25 team members',
        'Custom CNAME domain routing',
        '100% white-label client portal',
        'Executive Radar & operations dashboard',
        'At-risk client account alerts',
        'Priority 24/7 onboarding support',
      ],
      cta: 'Start Scale',
      href: signupHref,
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a0b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Simple pricing as your work grows.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Start completely free for up to 2 active projects. Upgrade only when you take on more clients or need team collaboration.
          </p>
        </div>

        {/* Monthly / Annual Billing Toggle */}
        <div className="mb-12 flex items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-white/[0.04] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                !annual
                  ? 'bg-white text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                annual
                  ? 'bg-white text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                save {ANNUAL_DISCOUNT_PCT}%
              </span>
            </button>
          </div>
        </div>

        {/* 4-Tier Calm & Comparable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                tier.popular
                  ? 'border-indigo-500/40 bg-indigo-500/[0.03] ring-1 ring-indigo-500/20'
                  : 'border-white/[0.08] bg-[#0c0d12]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-medium text-white">{tier.name}</h3>
                  {tier.popular && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-light min-h-[32px]">
                  {tier.target}
                </p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-normal text-white font-sans">
                      {tier.price}
                    </span>
                    <span className="text-xs text-slate-400 font-light">
                      {tier.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-300 font-light mb-8">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <Link
                href={tier.href}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5 ${
                  tier.popular
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xs'
                    : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <span>All plans include secure client passcode links and Stripe checkout.</span>
          <span>Switch or cancel anytime with zero lock-in.</span>
        </div>

      </div>
    </section>
  )
}
