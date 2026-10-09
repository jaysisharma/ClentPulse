'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Sparkles, ExternalLink,
  ShieldCheck, CreditCard, ArrowRight, ArrowUpRight,
  Check
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function SolutionSection({ signupHref }: Props) {
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
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
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

  return (
    <section
      ref={sectionRef}
      id="solutions"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-purple-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>The Frevio Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12]">
            One workspace. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              A modern Bento system built for client clarity.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Instead of spreading your projects across email, chat threads, and cloud drives, give each client one dedicated destination that answers their questions before they ask.
          </p>
        </div>

        {/* ── ASYMMETRICAL BENTO GRID SYSTEM (12 COLS) ── */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ── Bento Card 1: The Deliverable & Sign-Off Hub (Wide Hero Bento: 7 cols) ── */}
          <div className="lg:col-span-7 rounded-2xl border border-indigo-500/30 bg-[#17191D] p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/60 transition-all hover:translate-y-[-2px] shadow-lg shadow-indigo-500/10 group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                  01 · Deliverable Approvals
                </span>
                <span className="text-[11px] font-mono text-[#34D399] px-2.5 py-0.5 rounded-full bg-[#34D399]/10 border border-[#34D399]/20">
                  Paper Trail Protected
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-[#F5F5F3] mb-2">
                1-Click Sign-offs. No PDF printing or buried threads.
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6 max-w-xl">
                Deliverables are easy for clients to access, review, and approve with a single click. Every approval is cryptographically logged with an audit trail, so scope creep never derails your timeline.
              </p>
            </div>

            {/* Embedded Visual: Deliverable Approval Graphic */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] overflow-hidden shadow-inner mb-5">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/deliverable_approval.png"
                  alt="Client deliverable review interface with illuminated Approved by Client stamp and Stripe milestone payment"
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
              <div className="p-3 bg-[#101113] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-t border-[#2A2D33]">
                <span className="flex items-center gap-1.5 text-[#34D399]">
                  <Check className="w-3.5 h-3.5" />
                  1-Click Immutable Sign-off
                </span>
                <span className="text-[#A1A5AD]">Figma & Live URL Embed Support</span>
              </div>
            </div>

            {/* Micro Feature Bullets */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A1A5AD] pt-2 border-t border-[#2A2D33]/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Version history tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Client signature record
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Zero attachment size limits
              </span>
            </div>
          </div>

          {/* ── Bento Card 2: Live Milestone Health (Tall Bento: 5 cols) ── */}
          <div className="lg:col-span-5 rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  02 · Milestone Visibility
                </span>
                <span className="text-[11px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  Sprint 2 of 4
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-[#F5F5F3] mb-2">
                Keep clients informed before they ask.
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Clients see overall project health, active deliverables, and real-time sprint stages without messaging you at odd hours.
              </p>
            </div>

            {/* Live Progress Widget */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-5 space-y-4 font-mono text-xs mb-4">
              <div>
                <div className="flex justify-between text-[11px] text-[#A1A5AD] mb-1.5">
                  <span>Sprint Completion</span>
                  <span className="text-indigo-400 font-semibold">68% On Track</span>
                </div>
                <div className="w-full bg-[#2A2D33] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[68%] rounded-full" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2A2D33]/60">
                <div className="flex justify-between items-center text-xs text-[#F5F5F3]">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    Discovery & Wireframes
                  </span>
                  <span className="text-[10px] text-[#34D399] font-mono">Done</span>
                </div>
                <div className="flex justify-between items-center text-xs text-indigo-400">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
                    Visual System & UI
                  </span>
                  <span className="text-[10px] bg-indigo-500/15 px-1.5 py-0.5 rounded text-indigo-400">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#A1A5AD]">
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-[#2A2D33]" />
                    Production Staging
                  </span>
                  <span className="text-[10px] text-[#A1A5AD] font-mono">Scheduled</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#2A2D33] flex justify-between text-[11px] text-[#34D399]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  No Status Calls Needed
                </span>
                <span className="text-[#A1A5AD]">Due Oct 18</span>
              </div>
            </div>

            <div className="text-xs text-[#A1A5AD] leading-relaxed">
              Updates publish in real time with automatic client digest notifications.
            </div>
          </div>

          {/* ── Bento Card 3: Scope Creep Shield (Bottom Left: 4 cols) ── */}
          <div className="lg:col-span-4 rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  03 · Scope Creep Shield
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Convert changes into paid orders
              </h3>
              <p className="text-xs text-[#A1A5AD] leading-relaxed mb-5">
                When clients request new features mid-sprint, log it as a documented change order with clear cost & timeline impact before starting work.
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3.5 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-purple-400">Change Order #02</span>
                <span className="text-[#34D399] font-bold">+$750.00</span>
              </div>
              <div className="text-xs text-[#F5F5F3] font-sans">
                Apple Pay & Express Checkout
              </div>
              <div className="pt-1.5 border-t border-[#2A2D33] flex justify-between text-[10px] text-[#A1A5AD]">
                <span>Timeline: +2 days</span>
                <span className="text-[#34D399] bg-[#34D399]/10 px-1.5 py-0.5 rounded">✓ Client Signed</span>
              </div>
            </div>
          </div>

          {/* ── Bento Card 4: Stripe Direct Settlements (Bottom Center: 4 cols) ── */}
          <div className="lg:col-span-4 rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                  04 · Direct Settlements
                </span>
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Instant milestone deposits via Stripe
              </h3>
              <p className="text-xs text-[#A1A5AD] leading-relaxed mb-5">
                Clients pay invoices & milestone retainers in 1 click using credit cards, Apple Pay, or bank transfers. Funds route straight to your Stripe account.
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3.5 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#A1A5AD]">Invoice #INV-2026-01</span>
                <span className="text-[#34D399] font-bold">$4,500.00</span>
              </div>
              <div className="flex justify-between text-xs text-[#F5F5F3] font-sans">
                <span>Milestone 2 Sign-off Settlement</span>
              </div>
              <div className="pt-1.5 border-t border-[#2A2D33] flex justify-between text-[10px]">
                <span className="text-[#A1A5AD]">0% Frevio Commission</span>
                <span className="text-[#34D399] font-mono">Paid directly</span>
              </div>
            </div>
          </div>

          {/* ── Bento Card 5: Frictionless Client Access (Bottom Right: 4 cols) ── */}
          <div className="lg:col-span-4 rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  05 · Zero Client Friction
                </span>
                <ExternalLink className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                No logins or accounts required for clients
              </h3>
              <p className="text-xs text-[#A1A5AD] leading-relaxed mb-5">
                Clients access their workspace via an authenticated private link. No forgotten passwords, signup obstacles, or onboarding friction.
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3.5 space-y-2 font-mono text-xs">
              <div className="text-[11px] text-[#A1A5AD]">Dedicated Client Link</div>
              <div className="text-xs text-indigo-400 truncate bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                frevio.cloud/p/acme-brand
              </div>
              <div className="pt-1.5 border-t border-[#2A2D33] flex justify-between text-[10px] text-[#34D399]">
                <span>Instant Mobile & Desktop Access</span>
                <span>100% Adoption</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
