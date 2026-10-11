'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [approved, setApproved] = useState(false)

  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 bg-[#08090A] text-[#F3F4F6]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Quiet Mono Category Header */}
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-400 mb-6">
          Client Workspace & Portal
        </div>

        {/* Monumental, Restrained Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-[-0.03em] text-white leading-[1.08] max-w-4xl mx-auto text-balance">
          The client portal that closes the feedback loop.
        </h1>

        {/* Quiet Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed text-balance">
          One quiet link where your clients track weekly progress, review deliverables, and approve milestones with 1 click — with zero client login friction.
        </p>

        {/* Direct, Minimal Action Row */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white text-slate-950 hover:bg-slate-100 h-11 px-7 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <span>Start Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="#sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-transparent hover:bg-white/5 text-slate-400 hover:text-white border border-white/10 h-11 px-7 text-xs font-medium tracking-wide transition-all"
          >
            <span>View sample portal</span>
          </Link>
        </div>

        {/* Micro Guarantee */}
        <div className="mt-4 text-xs font-mono text-slate-400">
          Free 14-day trial · No credit card required · 2-minute setup
        </div>

        {/* ── Document Snapshot: Quiet, Real Client Portal Feed ── */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto text-left rounded-xl border border-white/10 bg-[#0C0D12] p-6 sm:p-9 shadow-2xl">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Project Portal
              </div>
              <div className="text-lg sm:text-xl font-normal text-white mt-1">
                Acme Brand & Web Platform
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Client: Acme Corp · Prepared by Studio
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-emerald-400">● Active sprint</span>
              <div className="text-slate-400 text-[11px] mt-1">Target launch: Oct 28</div>
            </div>
          </div>

          {/* Section: Latest Update */}
          <div className="py-6 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider text-[11px]">Latest Status Update</span>
              <span className="text-slate-400 text-[11px]">Oct 11, 2026</span>
            </div>
            
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-1">―</span>
                <span>Finalized responsive checkout UX wireframes and token architecture.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-1">―</span>
                <span>Integrated Stripe payment settlements for upfront kickoff deposits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-1">―</span>
                <span>Recorded 4-minute Loom walkthrough explaining the state management logic.</span>
              </li>
            </ul>
          </div>

          {/* Section: Deliverable Sign-off */}
          <div className="py-6 border-b border-white/10 space-y-3">
            <div className="text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              Deliverables & Sign-offs
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-sm font-medium text-white">
                  Sprint 3 Design Specification & Prototype
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Reviewer: Sarah Lin · Figma link attached
                </div>
              </div>

              <button
                type="button"
                onClick={() => setApproved(!approved)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer self-start sm:self-auto ${
                  approved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approved ? 'Approved by Client' : 'Approve Deliverable'}</span>
              </button>
            </div>
          </div>

          {/* Section: Invoices & Payment */}
          <div className="pt-6 space-y-3">
            <div className="text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              Payment Status
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-mono py-1">
              <div>
                <span className="text-white">Invoice #INV-2026-03</span>
                <span className="text-slate-400 text-xs ml-2">Sprint 3 milestone</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-semibold">$4,500.00</span>
                <span className="text-slate-400 text-xs ml-2">Paid via Stripe</span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Client portal link: frevio.cloud/p/acme-brand</span>
            <span>Powered by Frevio</span>
          </div>

        </div>

      </div>
    </section>
  )
}
