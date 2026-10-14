'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  CreditCard,
  Radio,
  FileCode,
  Sparkles,
  Download,
  Terminal,
  Clock,
  Check,
} from 'lucide-react'

interface Props {
  signupHref: string
}

export function StoryColdOpen({ signupHref }: Props) {
  const [activeTab, setActiveTab] = useState<'client' | 'studio'>('client')
  const [isApproved, setIsApproved] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-start items-center overflow-hidden bg-[#030407] pt-32 pb-24 px-4 sm:px-6 select-none"
    >
      {/* Header Eyebrow & Title */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
        {/* Cinematic Headline: 2 lines, confident solid text, no gradient text */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-[-0.04em] leading-[1.02] mb-6 max-w-4xl text-white">
          Stop chasing clients. Start closing milestones.
        </h1>

        {/* Lead Narrative Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-light text-slate-300 leading-relaxed max-w-2xl mb-10">
          A calm client workspace for designers, engineers, and studios. Real-time milestones, 1-click approvals, and direct Stripe payments.
        </p>

        {/* CTA Launch Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full max-w-md">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Create your portal free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/25 bg-white/[0.04] transition-colors"
          >
            <span>Try live simulator</span>
          </a>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 flex items-center p-1 rounded-full border border-white/10 bg-[#090A10]">
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2 rounded-full text-xs tracking-wider transition-colors cursor-pointer ${
              activeTab === 'client'
                ? 'bg-white text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Client Portal View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-5 py-2 rounded-full text-xs tracking-wider transition-colors cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Freelancer Cockpit
          </button>
        </div>

        {/* Interactive Master Viewport (Marked data-ui for real interface inspection) */}
        <div className="w-full max-w-4xl relative">
          <div
            data-ui="true"
            className="relative rounded-2xl border border-white/[0.1] bg-[#0B0C14] text-left overflow-hidden"
          >
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#07080c] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-4 py-1 text-xs text-slate-300">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>
                  {activeTab === 'client'
                    ? 'frevio.cloud/p/acme-rebrand'
                    : 'app.frevio.cloud/dashboard/acme-rebrand'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {activeTab === 'client' ? 'Client Passcode Protected' : 'Studio Master Key'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>Live Sync</span>
              </div>
            </div>

            {/* TAB CONTENT 1: CLIENT PORTAL VIEW */}
            {activeTab === 'client' ? (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Acme Global Rebrand &amp; Platform
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Sprint 4 Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-light">
                      Lead: <strong className="text-slate-200">Alex Rivera (Studio Mono)</strong> · Client Stakeholder:{' '}
                      <strong className="text-slate-200">Claire Sterling (Acme)</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                      Passcode: <span className="text-slate-200 font-bold">••••48</span>
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="flex items-center gap-2 text-slate-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Milestone Execution Progress
                    </span>
                    <span className="text-slate-200 font-bold">3 of 4 Milestones Finished (75%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.04] text-xs">
                    <div className="text-slate-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Discovery &amp; Audit</div>
                    <div className="text-slate-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Brand Architecture</div>
                    <div className="text-slate-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Design System v2</div>
                    <div className="text-white font-medium flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> Final Deliverables</div>
                  </div>
                </div>

                {/* 2 Cards Grid: Current Deliverable & Stripe Invoice */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Current Deliverable */}
                  <div className="lg:col-span-7 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <Radio className="w-3 h-3 text-emerald-400" />
                          Deliverable Awaiting Review
                        </span>
                        <span className="text-xs text-slate-500">Today, 2:15 PM</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1.5">
                        Interactive Component Library &amp; Final Guidelines
                      </h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                        Refactored hero typography, finalized mobile menu interactions, and exported SVG production icon system.
                      </p>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/[0.06] bg-black/50 mb-4">
                        <FileCode className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 truncate">Acme-Brand-Kit-2026.pdf</div>
                          <div className="text-[10px] text-slate-500">14.2 MB · Vector &amp; Specs</div>
                        </div>
                        <button type="button" className="p-1 text-slate-400 hover:text-white" aria-label="Download assets">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-xs text-slate-400">Client Decision</span>
                      <button
                        type="button"
                        onClick={() => setIsApproved(!isApproved)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white hover:bg-slate-100 text-slate-950'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approved by Client</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Click to Approve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Connected Stripe Invoice */}
                  <div className="lg:col-span-5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-400 font-semibold">
                          Milestone Invoice
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/[0.04] text-slate-300">
                          INV-2026-084
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-light mb-1">Due on Deliverable Approval</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                        $3,200.00
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Direct Stripe settlement with automatic payout routing to Studio Mono.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => setIsPaid(!isPaid)}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white hover:bg-slate-100 text-slate-950'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isPaid ? 'Payment Settled via Stripe' : 'Pay via Stripe (1-Click)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB CONTENT 2: STUDIO COCKPIT VIEW */
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Studio Operating Cockpit
                    </h3>
                    <p className="text-xs text-slate-400 font-light mt-0.5">
                      VS Code Extension active · 16.5 logged hours · Connected to Stripe Account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                      <Terminal className="w-3.5 h-3.5" />
                      IDE Pulse Connected
                    </span>
                  </div>
                </div>

                {/* Studio Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-xs text-slate-400">Logged Hours (This Week)</span>
                    <div className="text-2xl font-bold text-white mt-1">16.5 hrs</div>
                    <span className="text-xs text-emerald-400">Captured via VS Code heartbeat</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-xs text-slate-400">Total Unbilled Balance</span>
                    <div className="text-2xl font-bold text-white mt-1">$4,850.00</div>
                    <span className="text-xs text-slate-400">Ready to convert to invoice</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-xs text-slate-400">Client Portal Views</span>
                    <div className="text-2xl font-bold text-white mt-1">14 Views</div>
                    <span className="text-xs text-slate-400">Claire active 12m ago</span>
                  </div>
                </div>

                {/* One Click Draft Action */}
                <div className="rounded-xl border border-white/[0.1] bg-white/[0.02] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Weekly Briefing Ready to Dispatch
                    </div>
                    <p className="text-xs text-slate-300 font-light mt-1">
                      Frevio summarized your Git commits and Figma iterations into a 3-point client digest.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Publish to Client Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
