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
  ExternalLink,
  Check,
  Zap,
} from 'lucide-react'

interface Props {
  signupHref: string
}

export function StoryColdOpen({ signupHref }: Props) {
  const [activeTab, setActiveTab] = useState<'client' | 'studio'>('client')
  const [isApproved, setIsApproved] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // Mouse spotlight tracking
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-start items-center overflow-hidden bg-[#030407] pt-32 pb-24 px-4 sm:px-6 select-none"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x * 100}% ${
            mousePos.y * 100
          }%, rgba(99,102,241,0.14), transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Atmospheric Top Horizon Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.05) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Grid Pattern Overlay with Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 65% 60% at 50% 35%, #000 50%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 60% at 50% 35%, #000 50%, transparent 95%)',
        }}
        aria-hidden="true"
      />

      {/* Header Eyebrow & Title */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
        {/* Micro Category Chip */}
        <div className="mb-7 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300 font-medium">
            Next-Gen Client Operating Protocol
          </span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.045em] leading-[0.98] mb-6 max-w-4xl text-white">
          Stop chasing clients.{' '}
          <span className="bg-gradient-to-b from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Start closing milestones.
          </span>
        </h1>

        {/* Lead Narrative Subtitle */}
        <p className="text-base sm:text-lg md:text-xl font-light text-slate-400 leading-relaxed max-w-2xl mb-10">
          The all-in-one client portal for high-end designers, engineers, and studios. Real-time progress, zero-friction approvals, and automated Stripe settlements.
        </p>

        {/* CTA Launch Cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] transition-all cursor-pointer font-sans"
          >
            Create Your Portal Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-slate-300 hover:text-white border border-white/[0.1] hover:border-white/25 bg-white/[0.02] backdrop-blur-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Try Live Simulator
          </a>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 flex items-center p-1 rounded-full border border-white/[0.1] bg-[#090A10]/80 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === 'client'
                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ● CLIENT PORTAL VIEW
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ● FREELANCER COCKPIT
          </button>
        </div>

        {/* Interactive Master Viewport (The Centerpiece) */}
        <div className="w-full max-w-4xl relative">
          {/* Ambient Glow under mockup */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-50 blur-xl pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.1) 100%)',
            }}
          />

          <div className="relative rounded-2xl border border-white/[0.1] bg-[#0B0C14] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden text-left">
            {/* Top Browser Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-4 py-1 text-xs font-mono text-slate-300">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>
                  {activeTab === 'client'
                    ? 'frevio.cloud/p/acme-rebrand'
                    : 'app.frevio.cloud/dashboard/acme-rebrand'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-indigo-400 font-sans font-medium">
                  {activeTab === 'client' ? 'Client Passcode Protected' : 'Studio Master Key'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>SYNC LIVE</span>
              </div>
            </div>

            {/* TAB CONTENT 1: CLIENT PORTAL VIEW */}
            {activeTab === 'client' ? (
              <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Acme Global Rebrand & Platform
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
                    <span className="text-[11px] font-mono text-slate-400 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                      Passcode: <span className="text-slate-200 font-bold">••••48</span>
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="flex items-center gap-2 text-slate-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Milestone Execution Progress
                    </span>
                    <span className="font-mono text-indigo-300 font-bold">3 of 4 Milestones Finished (75%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-700"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.04] text-[11px]">
                    <div className="text-slate-400"><span className="text-emerald-400 mr-1.5 font-bold">✓</span> Discovery & Audit</div>
                    <div className="text-slate-400"><span className="text-emerald-400 mr-1.5 font-bold">✓</span> Brand Architecture</div>
                    <div className="text-slate-400"><span className="text-emerald-400 mr-1.5 font-bold">✓</span> Design System v2</div>
                    <div className="text-white font-medium"><span className="text-indigo-400 mr-1.5 font-bold">●</span> Final Deliverables</div>
                  </div>
                </div>

                {/* 2 Cards Grid: Current Deliverable & Stripe Invoice */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Current Deliverable */}
                  <div className="lg:col-span-7 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
                          <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                          Deliverable Awaiting Review
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">Today, 2:15 PM</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1.5">
                        Interactive Component Library & Final Guidelines
                      </h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                        Refactored hero typography, finalized mobile menu interactions, and exported SVG production icon system.
                      </p>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/[0.06] bg-black/50 mb-4">
                        <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 truncate">Acme-Brand-Kit-2026.pdf</div>
                          <div className="text-[10px] text-slate-500">14.2 MB · Vector & Specs</div>
                        </div>
                        <button type="button" className="p-1 text-slate-400 hover:text-white" aria-label="Download assets">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Client Decision</span>
                      <button
                        type="button"
                        onClick={() => setIsApproved(!isApproved)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Approved by Client ✓
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

                  {/* Connected Stripe Invoice */}
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
                      <div className="text-xs text-slate-400 font-light mb-1">Due on Deliverable Approval</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                        $3,200.00
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                        Direct Stripe settlement with automatic payout routing to Studio Mono.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => setIsPaid(!isPaid)}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
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
            ) : (
              /* TAB CONTENT 2: STUDIO COCKPIT VIEW */
              <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                      <Terminal className="w-3.5 h-3.5" />
                      IDE Pulse Connected
                    </span>
                  </div>
                </div>

                {/* Studio Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Logged Hours (This Week)</span>
                    <div className="text-2xl font-bold text-white font-mono mt-1">16.5 hrs</div>
                    <span className="text-[10px] text-emerald-400">Captured via VS Code heartbeat</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Unbilled Balance</span>
                    <div className="text-2xl font-bold text-white font-mono mt-1">$4,850.00</div>
                    <span className="text-[10px] text-indigo-400">Ready to convert to invoice</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Client Portal Views</span>
                    <div className="text-2xl font-bold text-white font-mono mt-1">14 Views</div>
                    <span className="text-[10px] text-slate-400">Claire active 12m ago</span>
                  </div>
                </div>

                {/* One Click Draft Action */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Weekly Briefing Ready to Dispatch
                    </div>
                    <p className="text-xs text-slate-300 font-light mt-1">
                      Frevio AI summarized your Git commits and Figma iterations into a 3-point client digest.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
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
