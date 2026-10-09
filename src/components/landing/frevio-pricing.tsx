'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'

interface PricingProps {
  signupHref: string
}

const ANNUAL_DISCOUNT_PCT = 20

export function FrevioPricing({ signupHref }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      desc: 'For solo freelancers just starting with client management.',
      price: '$0',
      period: 'forever',
      limits: 'Up to 2 active client workspaces',
      features: [
        '2 active client portals',
        'Milestone & sprint tracking',
        '1-click deliverable sign-offs',
        'Direct Stripe invoice settlement',
        'Standard client notification emails',
      ],
      ctaText: 'Start for free',
      ctaHref: signupHref,
      isHighlighted: false,
    },
    {
      name: 'Pro',
      desc: 'For active independent professionals managing steady client pipelines.',
      price: isAnnual ? '$19' : '$24',
      period: isAnnual ? 'month, billed annually ($228/yr)' : 'month',
      limits: 'Unlimited active workspaces',
      features: [
        'Unlimited active client portals',
        'Custom domain branding (portal.yourstudio.com)',
        'Scope Creep Shield (Change orders)',
        'Custom branding & white-labeling',
        'Priority Stripe settlement handling',
        'Client activity & read receipt tracking',
      ],
      ctaText: 'Start with Pro',
      ctaHref: signupHref,
      isHighlighted: true,
    },
    {
      name: 'Agency',
      desc: 'For boutique creative studios and distributed product teams.',
      price: isAnnual ? '$49' : '$59',
      period: isAnnual ? 'month, billed annually ($588/yr)' : 'month',
      limits: 'Unlimited workspaces & team seats',
      features: [
        'Everything in Pro plan',
        'Up to 5 team member seats',
        'Multi-client agency overview dashboard',
        'Dedicated client support manager',
        'Custom contract & MSA legal templates',
        'Webhook integrations & Slack notifications',
      ],
      ctaText: 'Start Agency plan',
      ctaHref: signupHref,
      isHighlighted: false,
    },
    {
      name: 'Lifetime',
      desc: 'One-time investment for independent professionals who hate subscriptions.',
      price: '$249',
      period: 'one-time payment',
      limits: 'Unlimited workspaces forever',
      features: [
        'All Pro tier features included forever',
        'All future updates and improvements',
        'Custom domain support included',
        'Zero recurring monthly charges',
        'Founding member community access',
      ],
      ctaText: 'Get lifetime access',
      ctaHref: signupHref,
      isHighlighted: false,
    },
  ]

  return (
    <section
      id="pricing"
      className="py-20 md:py-32 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No chips) */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 mb-3">
            04 / Transparent Plans
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12]">
            Start free. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Upgrade when your client roster grows.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Transparent pricing for solo professionals and expanding boutique teams. No hidden payment surcharges.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-[#17191D] border border-[#2A2D33]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                !isAnnual
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-[#A1A5AD] hover:text-[#F5F5F3]'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                isAnnual
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-[#A1A5AD] hover:text-[#F5F5F3]'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] text-[#34D399]">
                (Save {ANNUAL_DISCOUNT_PCT}%)
              </span>
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <SpotlightCard
              key={idx}
              className={`p-6 sm:p-7 flex flex-col justify-between ${
                plan.isHighlighted
                  ? 'border-2 border-indigo-500 ring-1 ring-indigo-500/30 shadow-xl shadow-indigo-500/15'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#F5F5F3]">{plan.name}</h3>
                  {plan.isHighlighted && (
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      ★ Recommended
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#A1A5AD] min-h-[32px] leading-relaxed mb-4">
                  {plan.desc}
                </p>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-[#2A2D33]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-light text-[#F5F5F3] tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-[#A1A5AD]">/{plan.period.split(',')[0]}</span>
                  </div>
                  {isAnnual && plan.period.includes('(') && (
                    <div className="text-[11px] font-mono text-[#34D399] mt-0.5">
                      {plan.period.split('(')[1].replace(')', '')}
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-indigo-400 mt-2">
                    {plan.limits}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6 text-xs">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-[#A1A5AD]">
                      <Check className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug text-[#F5F5F3]/90">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5 ${
                  plan.isHighlighted
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-[#101113] text-[#F5F5F3] border border-[#2A2D33] hover:bg-[#1E2126]'
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  )
}
