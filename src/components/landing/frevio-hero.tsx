'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, CreditCard, ShieldCheck,
  Clock, Sparkles, Layers, Eye, CheckCircle2,
  DollarSign, Zap, Lock, RefreshCw, Send
} from 'lucide-react'

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [clientName, setClientName] = useState('Acme Corp')
  const [projectName, setProjectName] = useState('Brand Identity & Web App')
  const [approvedDeliverable, setApprovedDeliverable] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setGenerated(true)
  }

  return (
    <section className="relative px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-32 bg-[#090B0E] text-[#F3F4F6] overflow-hidden">
      
      {/* Subtle Stripe-inspired precision hairline grid in background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* ── 01. Pain-Driven Category Tag ── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-slate-300 mb-6 sm:mb-8 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-white font-medium">Never Chase a Client Invoice Again</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Zero Client Login Friction</span>
        </div>

        {/* ── 02. High-Converting Pain-Driven Headline ── */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[74px] font-normal tracking-[-0.035em] text-white leading-[1.05] max-w-5xl mx-auto text-balance">
          Stop chasing clients for feedback, files, and final payments.
        </h1>

        {/* ── 03. High-Converting ROI Subheading ── */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed text-balance">
          The dedicated client portal that keeps projects moving and cash flowing. Lock upfront deposits with Stripe, get deliverable sign-offs in 1 click, and end 11 PM WhatsApp check-ins forever.
        </p>

        {/* ── 04. Interactive "Try Before Signup" Portal Generator Hook ── */}
        <div className="mt-8 sm:mt-10 w-full max-w-xl mx-auto">
          <form
            onSubmit={handleGenerate}
            className="flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-[#111317] border border-white/10 shadow-2xl focus-within:border-white/30 transition-all"
          >
            <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 text-left">
              <span className="text-xs font-mono text-slate-500 shrink-0">Client:</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value)
                  setGenerated(true)
                }}
                placeholder="Enter client name (e.g. Nike, Acme)"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none font-medium"
              />
            </div>

            <Link
              href={`${signupHref}&client=${encodeURIComponent(clientName)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 h-11 px-6 text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <span>Build Portal Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </form>

          <p className="mt-3 text-xs font-mono text-slate-400">
            Type your client name above to test live preview below · No credit card required
          </p>
        </div>

        {/* ── 05. Core ROI Conversion Metrics Bar ── */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xl sm:text-2xl font-light font-mono text-white">4x Faster</div>
            <div className="text-xs text-slate-400 mt-1">Client milestone approvals without endless email threads</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xl sm:text-2xl font-light font-mono text-emerald-400">100% Paid</div>
            <div className="text-xs text-slate-400 mt-1">Upfront kickoff deposit gate before any work starts</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xl sm:text-2xl font-light font-mono text-indigo-400">0 Logins</div>
            <div className="text-xs text-slate-400 mt-1">No forgotten passwords or friction for your clients</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="text-xl sm:text-2xl font-light font-mono text-white">0% Fees</div>
            <div className="text-xs text-slate-400 mt-1">Direct Stripe Connect payouts straight to your bank</div>
          </div>
        </div>

        {/* ── 06. The Live Generated Portal Showcase Stage ── */}
        <div className="mt-12 sm:mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0E1015] shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden text-left ring-1 ring-white/5">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0A0C0F] px-5 py-3.5 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                frevio.cloud/p/{clientName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'client'}-portal
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Client Portal for {clientName || 'Client'}
              </span>
              <span className="text-slate-400 hidden sm:inline">Stripe Settled</span>
            </div>
          </div>

          {/* Dual-Pane Layout: Left = Project Feed, Right = Stripe Settlement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* ── LEFT: Client Deliverable & Updates Feed ── */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              
              {/* Dynamic Project Meta based on input */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span className="text-indigo-400 font-medium">Sprint 3 of 4</span>
                  <span>Target Launch: Oct 28</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">
                  {clientName || 'Client'} Digital Platform & Identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                  Prepared for {clientName || 'Client'} stakeholders · Direct magic link access
                </p>
              </div>

              {/* Status Update */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider text-[11px]">Latest Progress Update</span>
                  <span className="text-slate-400 text-[11px]">Today at 9:00 AM</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">―</span>
                    <span>Completed full checkout wireframes and token architecture.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">―</span>
                    <span>Recorded 3-minute Loom walkthrough for {clientName || 'client'} sign-off.</span>
                  </li>
                </ul>
              </div>

              {/* 1-Click Deliverable Sign-off */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Deliverable Sign-off
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Homepage UI Spec & High-Fidelity Prototype
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setApprovedDeliverable(!approvedDeliverable)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer self-start sm:self-auto ${
                      approvedDeliverable
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{approvedDeliverable ? `Approved by ${clientName || 'Client'}` : 'Approve Deliverable'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>Reviewer: {clientName || 'Client'} Lead</span>
                  <span className={approvedDeliverable ? 'text-emerald-400' : 'text-amber-400'}>
                    {approvedDeliverable ? '● Sign-off recorded on immutable audit trail' : '● Awaiting 1-click client approval'}
                  </span>
                </div>
              </div>

            </div>

            {/* ── RIGHT: Upfront Deposit & Stripe Payout Engine ── */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0D11] space-y-6 flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      Stripe Invoice Engine
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Direct Payout
                  </span>
                </div>

                {/* Upfront Kickoff Deposit Lock Notice */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-400">Deposit Invoicing</div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        Kickoff Deposit for {clientName || 'Client'}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                      SETTLED
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400">Deposit Amount</span>
                    <span className="text-2xl font-light font-mono text-white">$3,500.00</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-medium">Cleared via Stripe Direct</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Portal Gate:</span>
                      <span className="text-slate-300">Unlocked automatically</span>
                    </div>
                  </div>
                </div>

                {/* Final Milestone Invoice */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Sprint 3 Milestone Settlement</div>
                    <div className="text-xs font-medium text-white mt-0.5">Invoice #INV-2026-03</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-semibold text-white">$4,500.00</div>
                    <div className="text-[10px] text-emerald-400">✓ Ready on deliverable sign-off</div>
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Bank-grade Stripe processing
                </span>
                <Link
                  href={`${signupHref}&client=${encodeURIComponent(clientName)}`}
                  className="text-white hover:underline font-semibold"
                >
                  Claim this portal →
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
