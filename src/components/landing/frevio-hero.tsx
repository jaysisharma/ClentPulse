'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, CreditCard, ShieldCheck,
  CheckCircle2, Clock, Layers, Sparkles, ExternalLink,
  Lock, ArrowUpRight
} from 'lucide-react'

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [depositSettled, setDepositSettled] = useState(true)
  const [deliverableApproved, setDeliverableApproved] = useState(false)

  return (
    <section className="relative px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-32 bg-[#090B0E] text-[#F3F4F6] overflow-hidden">
      
      {/* Subtle Stripe-inspired geometric hairline grid in background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* ── 01. Stripe-Style Eyebrow Pill ── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-slate-300 mb-6 sm:mb-8 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
          <span className="text-white font-medium">Stripe-Powered Client Portal</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">0% Platform Cut</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </div>

        {/* ── 02. Stripe Monumental Typography ── */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[74px] font-normal tracking-[-0.035em] text-white leading-[1.05] max-w-5xl mx-auto text-balance">
          The client workspace for getting paid and staying aligned.
        </h1>

        {/* ── 03. Crisp Value Proposition ── */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed text-balance">
          Milestone tracking, one-click deliverable sign-offs, and instant Stripe settlements — all in one quiet link with zero client logins.
        </p>

        {/* ── 04. Stripe-Style Action Buttons & Guarantees ── */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#635BFF] hover:bg-[#5851EA] text-white h-12 px-8 text-sm font-semibold transition-all hover:scale-[1.01] shadow-[0_0_24px_rgba(99,91,255,0.3)] cursor-pointer"
          >
            <span>Start free trial</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>

          <Link
            href="#sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 h-12 px-7 text-sm font-medium transition-all hover:border-white/20 cursor-pointer"
          >
            <span>Explore live portal sandbox</span>
          </Link>
        </div>

        {/* Micro-guarantee strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-slate-500">
          <span>Direct Stripe Connect</span>
          <span>·</span>
          <span>Instant bank payouts</span>
          <span>·</span>
          <span>No credit card required</span>
        </div>

        {/* ── 05. The Stripe-Style Interactive Financial & Portal Stage ── */}
        <div className="mt-14 sm:mt-18 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0E1015] shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden text-left ring-1 ring-white/5">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0A0C0F] px-5 py-3.5 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                frevio.cloud/p/acme-brand
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Client Portal
              </span>
              <span className="text-slate-500 hidden sm:inline">Stripe Direct Settled</span>
            </div>
          </div>

          {/* Dual-Pane Stage: Left = Workspace Progress, Right = Stripe Settlement Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* ── LEFT PANE: Project & Deliverable Sign-off ── */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              
              {/* Project Meta */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span className="text-indigo-400 font-medium">Sprint 3 of 4</span>
                  <span>Target Launch: Oct 28</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">
                  Acme Digital Platform & Identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                  Client: Acme Corp · Lead Reviewer: Sarah Lin (VP Product)
                </p>
              </div>

              {/* Weekly Milestone Progress */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Milestone Roadmap</span>
                  <span className="text-emerald-400 font-semibold">75% Completed</span>
                </div>

                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#635BFF] h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
                </div>

                <div className="space-y-2 text-xs font-mono pt-1 text-slate-300">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      Brand UX Architecture
                    </span>
                    <span className="text-slate-500">Oct 4</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      Design Token System v2.4
                    </span>
                    <span className="text-slate-500">Oct 12</span>
                  </div>
                  <div className="flex items-center justify-between text-indigo-400 font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Next.js Client Portal Production
                    </span>
                    <span>Active Sprint</span>
                  </div>
                </div>
              </div>

              {/* 1-Click Deliverable Sign-off Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Deliverable Sign-off
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Checkout UX & Figma Architecture Spec
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeliverableApproved(!deliverableApproved)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer self-start sm:self-auto ${
                      deliverableApproved
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{deliverableApproved ? 'Approved by Client' : 'Approve Deliverable'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>Assigned to: Sarah Lin</span>
                  <span className={deliverableApproved ? 'text-emerald-400' : 'text-slate-500'}>
                    {deliverableApproved ? '● Immutable sign-off recorded' : '● Awaiting 1-click client sign-off'}
                  </span>
                </div>
              </div>

            </div>

            {/* ── RIGHT PANE: Stripe Settlement Engine ── */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0D11] space-y-6 flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#635BFF]" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      Stripe Invoice Engine
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Direct Payout
                  </span>
                </div>

                {/* Itemized Invoice Spec */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-400">Invoice #INV-2026-03</div>
                      <div className="text-sm font-semibold text-white mt-0.5">Sprint 3 Milestone Settlement</div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      PAID
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400">Total Settled</span>
                    <span className="text-2xl font-light font-mono text-white">$4,500.00</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-slate-300">Stripe Card · Apple Pay</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span className="text-emerald-400 font-medium">$0.00 (0% Frevio Fee)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bank Settlement:</span>
                      <span className="text-slate-300">Direct to Bank · Cleared</span>
                    </div>
                  </div>
                </div>

                {/* Upfront Kickoff Deposit Status */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Upfront Kickoff Deposit</div>
                    <div className="text-xs font-medium text-white mt-0.5">Settled at contract kickoff</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-semibold text-white">$3,000.00</div>
                    <div className="text-[10px] text-emerald-400">✓ Cleared Sept 28</div>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF]" />
                  Bank-grade Stripe security
                </span>
                <span>frevio.cloud</span>
              </div>

            </div>

          </div>

        </div>

        {/* ── 06. Works with Strip ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider text-[11px] text-slate-400">Seamless Integrations:</span>
          <span className="text-slate-400">Stripe Connect</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Figma Live Embed</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Loom Video Reviews</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Slack Notifications</span>
        </div>

      </div>
    </section>
  )
}
