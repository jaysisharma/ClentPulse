'use client'

import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  CreditCard,
  Zap,
  RotateCcw,
  ShieldCheck,
  Check,
  FileCode,
  ArrowRight,
} from 'lucide-react'

export function StoryInteractiveSandbox() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isDrafting, setIsDrafting] = useState(false)
  const [draftedText, setDraftedText] = useState(
    'Refactored checkout webhook handlers, fixed mobile drawer navigation, and uploaded high-res SVG assets.'
  )

  const handleDraft = () => {
    setIsDrafting(true)
    setTimeout(() => {
      setDraftedText(
        'Sprint 4 Complete: Payment webhooks refactored, responsive navbar polished, and all production Figma components delivered.'
      )
      setIsDrafting(false)
      setStep(2)
    }, 600)
  }

  const handleApprove = () => {
    setStep(3)
  }

  const handleReset = () => {
    setStep(1)
    setDraftedText(
      'Refactored checkout webhook handlers, fixed mobile drawer navigation, and uploaded high-res SVG assets.'
    )
  }

  return (
    <section id="simulator" className="relative bg-[#030407] py-24 lg:py-32 px-6 border-t border-white/[0.06] overflow-hidden">
      {/* Specular Ambient Light */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-medium">
              02 — Live Interactive Simulator
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-white leading-tight mb-4">
            Test drive the 3-step loop{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              in 10 seconds.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
            Experience firsthand how Frevio accelerates deliverable submission, client sign-off, and Stripe deposit. Click the steps below:
          </p>
        </div>

        {/* Step Indicator Navigator */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 1
                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Step 01</div>
            <div className="text-xs sm:text-sm font-semibold truncate">Draft Update</div>
          </button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 2
                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Step 02</div>
            <div className="text-xs sm:text-sm font-semibold truncate">Client Sign-Off</div>
          </button>

          <button
            type="button"
            onClick={() => setStep(3)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              step === 3
                ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg'
                : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Step 03</div>
            <div className="text-xs sm:text-sm font-semibold truncate">Stripe Deposit</div>
          </button>
        </div>

        {/* Simulator Interactive Card Container */}
        <div className="relative rounded-3xl border border-white/[0.1] bg-[#0A0B14] p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
          {/* Top Bar inside simulator */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">Active Project: Acme Design System</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Simulator
            </button>
          </div>

          {/* STEP 1: DRAFT WITH AI */}
          {step === 1 && (
            <div className="py-6 space-y-6 animate-fade-in">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  Step 1: One-Click AI Summary
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Your work is already done. Turn it into a client briefing.
                </h3>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.06] bg-black/50 text-sm text-slate-200 font-light leading-relaxed">
                {isDrafting ? (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>Analyzing Git commits and Figma revisions...</span>
                  </div>
                ) : (
                  draftedText
                )}
              </div>

              <button
                type="button"
                onClick={handleDraft}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Draft with AI & Advance to Step 2
              </button>
            </div>
          )}

          {/* STEP 2: CLIENT APPROVAL */}
          {step === 2 && (
            <div className="py-6 space-y-6 animate-fade-in">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Step 2: Instant Client Sign-off
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Client opens the link on mobile and approves with 1 tap.
                </h3>
              </div>

              <div className="p-5 rounded-xl border border-white/[0.08] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Deliverable Attached</div>
                  <div className="text-sm font-semibold text-white mt-1">Acme-Design-System-Production.figma</div>
                  <p className="text-xs text-slate-400 mt-0.5">Reviewed by Claire Sterling (VP Marketing)</p>
                </div>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                  Simulate Client Approval Stamp
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: STRIPE DEPOSIT */}
          {step === 3 && (
            <div className="py-6 space-y-6 animate-fade-in">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  <Zap className="w-4 h-4" />
                  Step 3: Instant Stripe Deposit
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Sign-off triggers Stripe invoice. Funds in your account in 48h.
                </h3>
              </div>

              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Payment Settled via Stripe Connect
                  </div>
                  <div className="text-3xl font-bold text-white font-mono mt-1">$3,200.00 USD</div>
                  <p className="text-xs text-slate-300 mt-1">
                    Direct deposit to Studio Mono bank account scheduled for Friday. 0% platform fee.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  Play Simulation Again
                </button>
              </div>
            </div>
          )}

          {/* Footer Info Ticker */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Frevio Protocol v2.4</span>
            <span>Zero email back-and-forth</span>
          </div>
        </div>
      </div>
    </section>
  )
}
