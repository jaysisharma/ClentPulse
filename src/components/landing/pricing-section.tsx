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
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] dark:bg-[#090A0F] border-t border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 dark:text-white leading-[1.08]">
            Simple, transparent <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-800 dark:text-slate-300">pricing</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
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
                  ? 'bg-gradient-to-b from-indigo-50/80 via-white to-indigo-50/40 dark:from-[#151928] dark:to-[#0e1017] border-2 border-indigo-600 dark:border-indigo-500/60 shadow-[0_12px_40px_-10px_rgba(99,102,241,0.2)] dark:shadow-[0_0_50px_-10px_rgba(99,102,241,0.25)] lg:-translate-y-2'
                  : 'bg-white dark:bg-[#0e1017] border border-slate-200/90 dark:border-white/10 shadow-xs dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                  <span>Most popular</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1 min-h-[32px] leading-relaxed">
                    {plan.tagline}
                  </p>
                  
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">{plan.price}</span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200/80 dark:bg-white/[0.08]" />

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-light">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
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
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 text-slate-900 dark:text-white'
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
