'use client'

import { useEffect, useRef } from 'react'
import { ShieldCheck, Lock, CreditCard, Database, KeyRound, CheckCircle2 } from 'lucide-react'
import { HaikeiTopography } from '@/components/ui/haikei-backgrounds'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function TrustSection() {
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
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
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

  const pillars = [
    {
      icon: KeyRound,
      title: 'Zero client friction',
      description:
        'Clients never have to sign up, remember a password, or download software. They access their private project workspace via a secure tokenized link or optional passcode.',
      badge: 'Frictionless access',
    },
    {
      icon: CreditCard,
      title: 'Direct Stripe settlements',
      description:
        'Invoices, retainers, and change orders settle directly into your connected Stripe account with bank-grade 256-bit encryption. Frevio never sits between your money.',
      badge: 'Stripe infrastructure',
    },
    {
      icon: Database,
      title: 'Database tenant isolation',
      description:
        'Every project, invoice, and deliverable is safeguarded by PostgreSQL Row-Level Security (RLS) on Supabase, guaranteeing strict data privacy across workspaces.',
      badge: 'Database RLS',
    },
    {
      icon: ShieldCheck,
      title: 'White-label custom domains',
      description:
        'On Agency Scale, host client portals under your own custom domain (e.g. status.youragency.com) with complete brand isolation and zero "Powered by Frevio" branding.',
      badge: 'Custom CNAME',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] overflow-hidden"
    >
      {/* Haikei Topography Accents */}
      <HaikeiTopography className="absolute inset-0 w-full h-full" opacity={0.05} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#34D399] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Architecture & Trust</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Professional work deserves <br />
            <span className="font-normal text-[#A7B8FF]">
              a professional experience.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Your clients judge your professionalism by how you deliver. Frevio ensures every touchpoint feels thoughtful, reliable, and secure.
          </p>
        </div>

        {/* 4 Trust Pillars with GSAP Entrance */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-[#34D399] group-hover:border-[#34D399]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD] px-2.5 py-1 rounded bg-[#101113] border border-[#2A2D33]">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
