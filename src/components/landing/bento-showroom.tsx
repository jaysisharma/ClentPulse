'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Check, CheckCircle2, Clock, ShieldCheck,
  CreditCard, ExternalLink
} from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function BentoShowroom() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const bentoGridRef = useRef<HTMLDivElement>(null)

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

      if (bentoGridRef.current) {
        gsap.fromTo(
          bentoGridRef.current.children,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bentoGridRef.current,
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
      className="py-20 md:py-32 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No chips) */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-purple-400 mb-3">
            02 / Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12]">
            One shared destination. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
              A smoother experience for every client.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Instead of spreading your projects across emails, chats, and drives, give each client one dedicated space that answers their questions before they ask.
          </p>
        </div>

        {/* ── 12-COLUMN 21ST.DEV ASYMMETRICAL BENTO GRID ── */}
        <div ref={bentoGridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Bento Card 1: Deliverable Sign-off Hub (7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  01 · Deliverable Approvals
                </span>
                <span className="text-xs font-mono text-[#34D399]">
                  Audit Trail Protected
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-[#F5F5F3] mb-2">
                1-Click Client Sign-offs. No PDF printing or buried threads.
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6 max-w-xl">
                Deliverables are easy for clients to access, review, and approve with a single click. Every approval is cryptographically logged, protecting you from scope disputes.
              </p>
            </div>

            {/* Embedded Approval Graphic */}
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

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A1A5AD] pt-2 border-t border-[#2A2D33]/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Version history tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Client signature record
              </span>
            </div>
          </SpotlightCard>

          {/* Bento Card 2: Live Milestone Health (5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  02 · Milestone Visibility
                </span>
                <span className="text-xs font-mono text-indigo-400">
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
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Visual System & UI
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">Active</span>
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
                  No Status Meetings Needed
                </span>
                <span className="text-[#A1A5AD]">Due Oct 18</span>
              </div>
            </div>

            <div className="text-xs text-[#A1A5AD] leading-relaxed">
              Updates publish in real time with automatic client digest notifications.
            </div>
          </SpotlightCard>

          {/* Bento Card 3: Scope Creep Shield (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  03 · Scope Creep Shield
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Convert changes into paid orders
              </h3>
              <p className="text-xs text-[#A1A5AD] leading-relaxed mb-5">
                When clients request new features mid-sprint, log it as an official change order with clear cost & timeline impact before starting work.
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
                <span className="text-[#34D399]">✓ Client Signed</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 4: Stripe Direct Settlements (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
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
          </SpotlightCard>

          {/* Bento Card 5: Frictionless Client Access (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  05 · Zero Client Friction
                </span>
                <ExternalLink className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                No logins or passwords for clients
              </h3>
              <p className="text-xs text-[#A1A5AD] leading-relaxed mb-5">
                Clients access their workspace via an authenticated private link. No forgotten passwords, signup obstacles, or client onboarding headaches.
              </p>
            </div>

            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3.5 space-y-2 font-mono text-xs">
              <div className="text-[11px] text-[#A1A5AD]">Dedicated Client Link</div>
              <div className="text-xs text-indigo-400 truncate bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 font-mono">
                frevio.com/p/acme-brand
              </div>
              <div className="pt-1.5 border-t border-[#2A2D33] flex justify-between text-[10px] text-[#34D399]">
                <span>Instant Mobile & Desktop Access</span>
                <span>100% Adoption</span>
              </div>
            </div>
          </SpotlightCard>

        </div>

      </div>
    </section>
  )
}
