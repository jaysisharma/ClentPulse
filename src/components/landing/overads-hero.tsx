'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, ExternalLink, CheckCircle2, Clock, Check,
  CreditCard, Sparkles, FileText, ChevronRight, Play,
  FolderGit2, Layers, AlertCircle, ArrowRight
} from 'lucide-react'
import { HaikeiLayeredWaves, HaikeiDotMatrix, HaikeiBlobAura } from '@/components/ui/haikei-backgrounds'

interface HeroProps {
  signupHref: string
}

export function OveradsHero({ signupHref }: HeroProps) {
  const [approvedState, setApprovedState] = useState(false)

  return (
    <section
      id="overview"
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#101113] text-[#F5F5F3]"
    >
      {/* Haikei Ambient Background Elements */}
      <HaikeiBlobAura className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[850px]" opacity={0.14} />
      <HaikeiDotMatrix className="absolute inset-0 w-full h-full" opacity={0.07} />
      <HaikeiLayeredWaves className="absolute bottom-0 inset-x-0 w-full h-[320px]" opacity={0.06} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A7B8FF] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
          <span>The Client Workspace for Independent Professionals</span>
        </div>

        {/* Editorial Hero Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12] max-w-4xl mx-auto">
          Your work, beautifully organised. <br />
          <span className="font-normal text-[#A7B8FF]">
            Your clients, always in the loop.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[#A1A5AD] font-normal leading-relaxed max-w-2xl mx-auto text-balance">
          One simple workspace for clients to follow progress, review deliverables, and manage project updates — so you can spend less time chasing messages and more time doing your best work.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#A7B8FF] text-[#101113] hover:bg-[#b8c6ff] h-11 px-7 text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm"
          >
            <span>Start free</span>
            <ArrowUpRight className="w-4 h-4 text-[#101113]" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] hover:bg-[#1E2126] text-[#F5F5F3] border border-[#2A2D33] h-11 px-6 text-sm font-medium transition-all"
          >
            <Play className="w-3.5 h-3.5 text-[#9BCDBF] fill-current" />
            <span>Explore the demo</span>
          </Link>
        </div>

        {/* Reassurance statement */}
        <p className="mt-3.5 text-xs text-[#A1A5AD]/80">
          Set up your first client workspace in minutes. No credit card required.
        </p>

        {/* ── ART-DIRECTED FREVIO CLIENT WORKSPACE INTERFACE ── */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#2A2D33] bg-[#17191D] shadow-2xl overflow-hidden text-left ring-1 ring-white/5">
          
          {/* Workspace Browser Bar */}
          <div className="flex items-center justify-between border-b border-[#2A2D33] bg-[#101113] px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2A2D33]" />
              <span className="ml-2 text-xs font-mono text-[#A1A5AD] hidden sm:inline">
                frevio.cloud/p/acme-brand-refresh
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[11px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Client View · Live
              </span>
            </div>
          </div>

          {/* Client Portal Header */}
          <div className="p-5 sm:p-7 border-b border-[#2A2D33] bg-[#17191D]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#A1A5AD] font-mono mb-1">
                  <span>Acme Studio Co.</span>
                  <span>/</span>
                  <span className="text-[#A7B8FF]">Brand & Web Experience</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#F5F5F3]">
                  Sprint 3: Design System & Interactive Prototypes
                </h2>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center gap-4 bg-[#101113] border border-[#2A2D33] rounded-xl px-4 py-2.5">
                <div>
                  <div className="text-[11px] font-mono text-[#A1A5AD] uppercase tracking-wider">Overall Progress</div>
                  <div className="text-base font-semibold text-[#F5F5F3]">68% Complete</div>
                </div>
                <div className="w-24 bg-[#2A2D33] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#A7B8FF] h-full w-[68%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Body Layout: Main Feed & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#2A2D33] bg-[#101113]">
            
            {/* Left 8 Cols: Recent Broadcast & Deliverables */}
            <div className="lg:col-span-8 p-5 sm:p-7 space-y-6">
              
              {/* Deliverable Awaiting Sign-off */}
              <div className="rounded-xl border border-[#A7B8FF]/40 bg-[#17191D] p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#A7B8FF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Deliverable Ready for Review
                  </span>
                  <span className="text-[11px] text-[#A1A5AD] font-mono">Sprint 3 Handover</span>
                </div>

                <h3 className="text-base font-medium text-[#F5F5F3]">
                  Homepage & Checkout UI Prototypes v2.4
                </h3>
                <p className="text-xs text-[#A1A5AD] mt-1 leading-relaxed">
                  Interactive Figma flows for desktop and responsive mobile checkout, updated with revised typography tokens and payment confirmation dialogs.
                </p>

                <div className="mt-4 pt-3 border-t border-[#2A2D33] flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A5AD] hover:text-[#F5F5F3] font-mono cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Figma Prototype (v2.4)
                  </span>

                  <div className="flex items-center gap-2">
                    {approvedState ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/30 px-3 py-1.5 rounded-lg font-mono">
                        <Check className="w-3.5 h-3.5" />
                        Approved by Client
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setApprovedState(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101113] bg-[#A7B8FF] hover:bg-[#b8c6ff] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Click Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Update / Broadcast */}
              <div className="rounded-xl border border-[#2A2D33] bg-[#17191D] p-4 sm:p-5">
                <div className="flex items-center justify-between text-xs text-[#A1A5AD] font-mono mb-2">
                  <span className="text-[#9BCDBF]">Weekly Status Update</span>
                  <span>Delivered Oct 8</span>
                </div>
                <h4 className="text-sm font-medium text-[#F5F5F3]">
                  Brand design tokens finalized & design system locked
                </h4>
                <p className="text-xs text-[#A1A5AD] mt-1 leading-relaxed">
                  All 14 core components and responsive grid specifications have been finalized. Production frontend development begins Monday on Next.js 16.
                </p>
              </div>

              {/* Scope Creep Shield Card */}
              <div className="rounded-xl border border-[#2A2D33] bg-[#17191D]/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#A7B8FF]/10 text-[#A7B8FF] mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#F5F5F3]">Change Order #01: Extended Mobile Navigation</div>
                    <div className="text-[11px] text-[#A1A5AD]">+2 days timeline · $850 deposit via Stripe</div>
                  </div>
                </div>
                <span className="inline-flex items-center text-xs font-mono text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 rounded border border-[#34D399]/20">
                  Approved & Settled
                </span>
              </div>

            </div>

            {/* Right 4 Cols: Project Milestones & Administration */}
            <div className="lg:col-span-4 p-5 sm:p-7 space-y-6 bg-[#17191D]/40">
              
              {/* Milestones Sequence */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#A1A5AD] mb-3">
                  Project Milestones
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#34D399]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[#F5F5F3]">1. Discovery & Strategy</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD]">Completed</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#34D399]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[#F5F5F3]">2. Visual Identity</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD]">Completed</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#A7B8FF]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[#A7B8FF] font-medium">3. UI & Prototypes</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A7B8FF]">In Review</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A1A5AD]">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-[#2A2D33]" />
                      <span>4. Production Build</span>
                    </div>
                    <span className="text-[11px] font-mono">Next</span>
                  </div>
                </div>
              </div>

              {/* Invoice & Payment Item */}
              <div className="pt-4 border-t border-[#2A2D33]">
                <div className="text-xs font-mono uppercase tracking-wider text-[#A1A5AD] mb-3">
                  Invoices & Settlement
                </div>
                <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#F5F5F3] font-medium">Project Deposit (50%)</span>
                    <span className="text-[#34D399] font-mono font-medium">$4,500 Paid</span>
                  </div>
                  <div className="text-[11px] text-[#A1A5AD] flex items-center justify-between font-mono">
                    <span>Stripe Transaction ID: #ch_982</span>
                    <CreditCard className="w-3.5 h-3.5 text-[#34D399]" />
                  </div>
                </div>
              </div>

              {/* Reassurance badge */}
              <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-3 text-[11px] text-[#A1A5AD] font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                <span>Zero login friction · Protected by Passcode</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
