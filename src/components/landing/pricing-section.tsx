'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { PRICING, ANNUAL_MONTHLY_EQUIV, ANNUAL_DISCOUNT_PCT, AGENCY_PRICING } from '@/lib/plans'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface PricingProps {
  signupHref: string
}

export function PricingSection({ signupHref }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const plans = [
    {
      name: 'Free',
      badge: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'For freelancers exploring a better client workflow.',
      limits: 'Up to 2 active projects',
      features: [
        'Up to 2 active projects',
        'Client portal & status pages',
        'Project updates & milestones',
        'Client kickoff checklist',
        'Basic deliverable approvals',
        'Proposals & contracts',
        'Invoicing with Stripe payments',
      ],
      ctaText: 'Start free',
      ctaHref: signupHref,
      isHighlighted: false,
    },
    {
      name: 'Pro',
      badge: 'Most Popular',
      price: isAnnual ? `$${ANNUAL_MONTHLY_EQUIV}` : `$${PRICING.monthly}`,
      period: isAnnual ? 'per month, billed annually ($190/yr)' : 'per month',
      description: 'For independent professionals managing multiple clients.',
      limits: 'Unlimited active projects',
      features: [
        'Unlimited active projects',
        'Automated client emails via Resend',
        'Custom logo & accent color branding',
        'Remove "Powered by Frevio"',
        'Project duplication & templates',
        'Advanced deliverable sign-offs',
        'Scope Creep Shield & change orders',
        'Expense & profit analytics',
      ],
      ctaText: 'Start with Pro',
      ctaHref: signupHref,
      isHighlighted: true,
    },
    {
      name: 'Agency',
      badge: 'Small Studios',
      price: isAnnual ? `$${Math.round(AGENCY_PRICING.agency.annual / 12)}` : `$${AGENCY_PRICING.agency.monthly}`,
      period: isAnnual ? 'per month, billed annually ($790/yr)' : 'per month',
      description: 'For creative and technical studios needing shared workflows.',
      limits: 'Up to 5 team members',
      features: [
        'Up to 5 team members',
        'Unlimited active projects',
        'Shared agency workspace & switcher',
        'Team roles (Owner, PM, Member)',
        'Project pods & staff assignments',
        'Update staging & PM review workflow',
        'Agency audit & activity logs',
      ],
      ctaText: 'Choose Agency',
      ctaHref: signupHref,
      isHighlighted: false,
    },
    {
      name: 'Agency Scale',
      badge: 'Full White-label',
      price: isAnnual ? `$${Math.round(AGENCY_PRICING.scale.annual / 12)}` : `$${AGENCY_PRICING.scale.monthly}`,
      period: isAnnual ? 'per month, billed annually ($1,990/yr)' : 'per month',
      description: 'For high-volume agency operations requiring custom domains.',
      limits: 'Up to 25 team members',
      features: [
        'Up to 25 team members',
        'Custom CNAME domain (status.youragency.com)',
        '100% white-label portal & favicon',
        'Executive Radar & portfolio oversight',
        'Blocked cashflow & accounts receivable pipeline',
        'At-risk client account alerts',
        'Priority onboarding & dedicated support',
      ],
      ctaText: 'Choose Scale',
      ctaHref: signupHref,
      isHighlighted: false,
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A7B8FF] mb-4">
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Start simple. <br />
            <span className="font-normal text-[#A7B8FF]">
              Grow when you need to.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Transparent plans designed for solo freelancers and expanding studios. No hidden processing surcharges.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-[#17191D] border border-[#2A2D33]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                !isAnnual
                  ? 'bg-[#A7B8FF] text-[#101113] font-semibold'
                  : 'text-[#A1A5AD] hover:text-[#F5F5F3]'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                isAnnual
                  ? 'bg-[#A7B8FF] text-[#101113] font-semibold'
                  : 'text-[#A1A5AD] hover:text-[#F5F5F3]'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#34D399]/20 text-[#34D399] font-bold">
                Save {ANNUAL_DISCOUNT_PCT}%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                plan.isHighlighted
                  ? 'bg-[#17191D] border-2 border-[#A7B8FF] shadow-xl shadow-[#A7B8FF]/5 ring-1 ring-[#A7B8FF]/20'
                  : 'bg-[#17191D] border border-[#2A2D33] hover:border-[#2A2D33]/80'
              }`}
            >
              {plan.isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#A7B8FF] text-[#101113] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>Recommended</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#F5F5F3]">{plan.name}</h3>
                  <span className="text-[10px] font-mono text-[#A1A5AD] px-2 py-0.5 rounded bg-[#101113] border border-[#2A2D33]">
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-[#A1A5AD] min-h-[32px] leading-relaxed mb-4">
                  {plan.description}
                </p>

                {/* Price Display */}
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
                  <div className="text-[11px] font-mono text-[#A7B8FF] mt-2">
                    {plan.limits}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6 text-xs">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-[#A1A5AD]">
                      <Check className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug text-[#F5F5F3]/90">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center transition-all inline-flex items-center justify-center gap-1.5 ${
                  plan.isHighlighted
                    ? 'bg-[#A7B8FF] text-[#101113] hover:bg-[#b8c6ff] shadow-sm'
                    : 'bg-[#101113] text-[#F5F5F3] border border-[#2A2D33] hover:bg-[#1E2126]'
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
