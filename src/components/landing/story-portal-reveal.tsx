'use client'

import { useState } from 'react'
import {
  Shield,
  CheckCircle2,
  FileText,
  Download,
  Lock,
  ExternalLink,
  CreditCard,
  Radio,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react'

export function StoryPortalReveal() {
  const [isApproved, setIsApproved] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  return (
    <section id="portal" className="relative bg-[#07080b] py-12 pb-24 lg:pb-32 px-6 overflow-hidden">
      {/* Ambient specular light behind the portal */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.02) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Chapter Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              03 — The Client Space
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight">
            An encrypted portal built for clarity.
          </h2>
        </div>

        {/* Subtle Browser Window Shell */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Chrome Top Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-3.5 py-1 text-xs font-mono text-slate-300">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>frevio.cloud/p/acme-rebrand</span>
              <span className="text-slate-600 font-sans">|</span>
              <span className="text-[10px] text-emerald-400 font-sans font-medium">Encrypted Portal</span>
            </div>

            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
              Client Live View
            </div>
          </div>

          {/* Portal Body Canvas */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Project Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Acme Global Rebrand
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Sprint
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Lead Studio: <span className="text-slate-200">Jordan Creative Labs</span> · Client: <span className="text-slate-200">Acme Corporation</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs text-slate-400 font-mono">Live presence active</span>
              </div>
            </div>

            {/* Overall Milestone Track */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2.5">
                <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Milestone Progress
                </span>
                <span className="font-mono text-indigo-300 font-bold">3 of 4 Completed (75%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: '75%' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.04] text-[11px]">
                <div className="text-slate-400"><span className="text-emerald-400 mr-1.5">✓</span> Discovery & Audit</div>
                <div className="text-slate-400"><span className="text-emerald-400 mr-1.5">✓</span> Brand Architecture</div>
                <div className="text-slate-400"><span className="text-emerald-400 mr-1.5">✓</span> Design System</div>
                <div className="text-white font-medium"><span className="text-indigo-400 mr-1.5">●</span> Final Deliverables</div>
              </div>
            </div>

            {/* Two Column Grid: Latest Deliverable & Invoice */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Deliverable Review Panel */}
              <div className="lg:col-span-7 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium uppercase tracking-wider text-indigo-400">
                      <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                      Current Deliverable Update
                    </span>
                    <span className="text-[11px] text-slate-500">Today, 2:15 PM</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-1.5">
                    Component System v2.4 & Interactive Prototypes
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Updated typography hierarchy, mobile navigation layout, and export-ready SVG icon sets for developer handoff.
                  </p>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.06] bg-black/40 mb-4">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate">Acme-Brand-Guidelines-2026.pdf</div>
                      <div className="text-[10px] text-slate-500">8.4 MB · High-Res Vector</div>
                    </div>
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-white"
                      aria-label="Download design file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">Client Approval Status</span>
                  <button
                    type="button"
                    onClick={() => setIsApproved(!isApproved)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Approved by Client
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Click to Approve
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Invoice Payment Panel */}
              <div className="lg:col-span-5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Milestone Invoice
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300">
                      INV-2026-084
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-1">Due Upon Sign-off</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                    $3,200.00
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Direct Stripe settlement with automatic payout routing to Jordan Creative Labs.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setIsPaid(!isPaid)}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isPaid
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white hover:bg-slate-100 text-slate-950 shadow-sm'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isPaid ? 'Payment Settled via Stripe ✓' : 'Pay via Stripe (1-Click)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath the portal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-center">
            <div className="text-xs font-semibold text-white mb-1">Passcode Protected</div>
            <div className="text-[11px] text-slate-400 font-light">Zero login friction for your busy client stakeholders</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-center">
            <div className="text-xs font-semibold text-white mb-1">Live Presence Sync</div>
            <div className="text-[11px] text-slate-400 font-light">See when clients view files and review updates in real time</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-center">
            <div className="text-xs font-semibold text-white mb-1">Connected Stripe Rails</div>
            <div className="text-[11px] text-slate-400 font-light">Deliverable approvals trigger instant 1-click invoice payments</div>
          </div>
        </div>
      </div>
    </section>
  )
}
