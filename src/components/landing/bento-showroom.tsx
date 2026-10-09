'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Check, CheckCircle2, Clock, ShieldCheck,
  CreditCard, ExternalLink, Sparkles, Layers, Copy
} from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function BentoShowroom() {
  const [bentoApproved, setBentoApproved] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
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

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://frevio.com/p/acme-brand')
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <section
      ref={sectionRef}
      id="solutions"
      className="py-20 md:py-32 bg-[#08090A] border-t border-white/[0.08] text-[#F3F4F6]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No chips) */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#5E6AD2] mb-3 font-semibold">
            02 / Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.035em] text-white leading-[1.12]">
            One shared destination. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] via-[#818CF8] to-[#38BDF8]">
              A smoother experience for every client.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#8A8F98] font-normal leading-relaxed max-w-xl mx-auto">
            Instead of spreading your projects across emails, chats, and drives, give each client one dedicated space that answers their questions before they ask.
          </p>
        </div>

        {/* ── 12-COLUMN 21ST.DEV ASYMMETRICAL BENTO GRID ── */}
        <div ref={bentoGridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Bento Card 1: Deliverable Sign-off Hub (7 cols) - Pure Vector UI */}
          <SpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#5E6AD2] uppercase tracking-wider font-semibold">
                  01 · Deliverable Approvals
                </span>
                <span className="text-xs font-mono text-[#10B981] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Audit Trail Protected
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                1-Click Client Sign-offs. No PDF printing or buried threads.
              </h3>
              <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed mb-6 max-w-xl">
                Deliverables are easy for clients to access, review, and approve with a single click. Every approval is cryptographically logged, protecting you from scope disputes.
              </p>
            </div>

            {/* 100% Pure React/CSS Vector Deliverable Showcase (Zero blurry images) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0C0E] overflow-hidden shadow-inner mb-5">
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Mobile Checkout v3.0 Spec</div>
                      <div className="text-[10px] font-mono text-[#8A8F98]">Figma Interactive Embed</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBentoApproved(!bentoApproved)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      bentoApproved
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40'
                        : 'bg-[#5E6AD2] hover:bg-[#6875E3] text-white shadow-[0_0_12px_rgba(94,106,210,0.4)]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{bentoApproved ? 'Signed off' : 'Approve Spec'}</span>
                  </button>
                </div>

                {/* Vector Canvas Preview */}
                <div className="rounded-lg bg-[#121418] border border-white/[0.06] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1.5 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span>Ready for Client Review (4 Artboards)</span>
                    </div>
                    <div className="text-[11px] text-[#8A8F98]">
                      Includes Apple Pay dialog, invoice receipt, and dark mode.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] text-right shrink-0">
                    <div className="text-[10px] text-[#8A8F98]">Stripe Milestone</div>
                    <div className="text-sm font-bold text-[#10B981] font-mono">$3,500.00</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono border-t border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <Check className="w-3.5 h-3.5" />
                  1-Click Immutable Sign-off
                </span>
                <span className="text-[#8A8F98]">Figma & Live URL Embed Support</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8A8F98] pt-2 border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5E6AD2]" />
                Version history tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5E6AD2]" />
                Client signature record
              </span>
            </div>
          </SpotlightCard>

          {/* Bento Card 2: Live Milestone Health (5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                  02 · Milestone Visibility
                </span>
                <span className="text-xs font-mono text-[#5E6AD2]">
                  Sprint 2 of 4
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
                Keep clients informed before they ask.
              </h3>
              <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed mb-6">
                Clients see overall project health, active deliverables, and real-time sprint stages without messaging you at odd hours.
              </p>
            </div>

            {/* Live Progress Widget */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0A0C0E] p-5 space-y-4 font-mono text-xs mb-4">
              <div>
                <div className="flex justify-between text-[11px] text-[#8A8F98] mb-1.5">
                  <span>Sprint Completion</span>
                  <span className="text-[#5E6AD2] font-semibold">68% On Track</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#5E6AD2] to-[#38BDF8] h-full w-[68%] rounded-full" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between items-center text-xs text-white">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Discovery & Wireframes
                  </span>
                  <span className="text-[10px] text-[#10B981] font-mono">Done</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#5E6AD2]">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#5E6AD2]" />
                    Visual System & UI
                  </span>
                  <span className="text-[10px] text-[#5E6AD2] font-mono">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#8A8F98]">
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                    Production Staging
                  </span>
                  <span className="text-[10px] text-[#8A8F98] font-mono">Scheduled</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] flex justify-between text-[11px] text-[#10B981]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  No Status Meetings Needed
                </span>
                <span className="text-[#8A8F98]">Due Oct 18</span>
              </div>
            </div>

            <div className="text-xs text-[#8A8F98] leading-relaxed">
              Updates publish in real time with automatic client digest notifications.
            </div>
          </SpotlightCard>

          {/* Bento Card 3: Scope Creep Shield (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                  03 · Scope Creep Shield
                </span>
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Convert changes into paid orders
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed mb-5">
                When clients request new features mid-sprint, log it as an official change order with clear cost & timeline impact before starting work.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0C0E] p-3.5 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#38BDF8]">Change Order #02</span>
                <span className="text-[#10B981] font-bold">+$750.00</span>
              </div>
              <div className="text-xs text-white font-sans font-medium">
                Apple Pay & Express Checkout
              </div>
              <div className="pt-1.5 border-t border-white/[0.06] flex justify-between text-[10px] text-[#8A8F98]">
                <span>Timeline: +2 days</span>
                <span className="text-[#10B981]">✓ Client Signed</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 4: Stripe Direct Settlements (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#5E6AD2] uppercase tracking-wider font-semibold">
                  04 · Direct Settlements
                </span>
                <CreditCard className="w-4 h-4 text-[#5E6AD2]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Instant deposits via Stripe
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed mb-5">
                Clients pay invoices & milestone retainers in 1 click using credit cards, Apple Pay, or bank transfers. Funds route straight to your Stripe account.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0C0E] p-3.5 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8A8F98]">Invoice #INV-2026-01</span>
                <span className="text-[#10B981] font-bold">$4,500.00</span>
              </div>
              <div className="flex justify-between text-xs text-white font-sans">
                <span>Milestone 2 Sign-off Settlement</span>
              </div>
              <div className="pt-1.5 border-t border-white/[0.06] flex justify-between text-[10px]">
                <span className="text-[#8A8F98]">0% Frevio Commission</span>
                <span className="text-[#10B981] font-mono">Paid directly</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 5: Frictionless Client Access (4 cols) */}
          <SpotlightCard className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
                  05 · Zero Client Friction
                </span>
                <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No logins or passwords for clients
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed mb-5">
                Clients access their workspace via an authenticated private link. No forgotten passwords, signup obstacles, or client onboarding headaches.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0A0C0E] p-3.5 space-y-2 font-mono text-xs">
              <div className="text-[11px] text-[#8A8F98]">Dedicated Client Link</div>
              <div className="flex items-center justify-between text-xs text-[#38BDF8] bg-[#5E6AD2]/10 px-2.5 py-1.5 rounded border border-[#5E6AD2]/20 font-mono">
                <span className="truncate">frevio.com/p/acme-brand</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="ml-2 text-[#8A8F98] hover:text-white transition-colors cursor-pointer"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="pt-1.5 border-t border-white/[0.06] flex justify-between text-[10px] text-[#10B981]">
                <span>{copiedLink ? 'Copied to clipboard!' : 'Instant Mobile & Desktop'}</span>
                <span>100% Client Adoption</span>
              </div>
            </div>
          </SpotlightCard>

        </div>

      </div>
    </section>
  )
}
