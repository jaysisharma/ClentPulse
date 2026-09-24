'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function PricingSection({ signupHref }: Props) {
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
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

      // 2. 4 Cards Stagger
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 40, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      tagline: 'For individuals getting started',
      features: [
        '2 active projects',
        'Passcode-protected client portal',
        'Basic invoicing & receipt exports',
        'Standard milestone updates',
        'Community email support',
      ],
      ctaText: 'Get started',
      ctaHref: signupHref,
      popular: false,
    },
    {
      name: 'Pro',
      price: '$15',
      period: '/mo',
      tagline: 'For professional freelancers',
      features: [
        'Unlimited projects & clients',
        'Custom branding & studio logo',
        'Automated milestone broadcasts',
        'Advanced Stripe checkout invoices',
        'Client approvals & digital sign-off',
        'Priority file uploads (up to 500MB)',
      ],
      ctaText: 'Start free',
      ctaHref: signupHref,
      popular: true,
    },
    {
      name: 'Agency',
      price: '$39',
      period: '/mo',
      tagline: 'For small teams and studios',
      features: [
        'Up to 5 team members',
        'Client relationship management',
        'Advanced workflow automations',
        'Custom domain (cname)',
        'Priority email & chat support',
        'Multi-currency Stripe billing',
      ],
      ctaText: 'Start free',
      ctaHref: signupHref,
      popular: false,
    },
    {
      name: 'Agency Scale',
      price: '$99',
      period: '/mo',
      tagline: 'For larger agencies',
      features: [
        'Unlimited team members',
        'Everything in Agency',
        'Advanced revenue reporting',
        'Full REST API & webhook webhooks',
        'Dedicated account manager',
        'Tailored onboarding & SLA',
      ],
      ctaText: 'Contact sales',
      ctaHref: 'mailto:sales@frevio.app',
      popular: false,
    },
  ]

  return (
    <section
      ref={containerRef}
      id="pricing"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-600 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
            Simple, transparent <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-900">pricing</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Start free and upgrade as you grow. No hidden platform charges or surprise fees.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                plan.popular
                  ? 'bg-white border-2 border-slate-900 shadow-xl lg:-translate-y-2 ring-1 ring-slate-950/10 hover:shadow-2xl'
                  : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>Most popular</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{plan.name}</h3>
                  <p className="text-xs text-slate-500 font-light mt-1 min-h-[32px] leading-relaxed">
                    {plan.tagline}
                  </p>
                  
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">{plan.price}</span>
                    <span className="text-xs font-mono text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <ul className="space-y-2.5 text-xs text-slate-600 font-light">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-slate-950 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800'
                  }`}
                >
                  {plan.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
