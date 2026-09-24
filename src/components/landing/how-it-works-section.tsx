'use client'

import { useState } from 'react'
import { Copy, Check, CheckCircle2, Lock, ShieldCheck, ArrowRight, Zap, ExternalLink } from 'lucide-react'
import { StripeIcon } from '@/components/ui/brand-icons'

export function HowItWorksSection() {
  const [copied, setCopied] = useState(false)
  const [approved, setApproved] = useState(true)

  const handleCopy = () => {
    navigator.clipboard?.writeText?.('https://frevio.cloud/p/acme-rebrand')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="how-it-works" className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16 lg:space-y-20">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-600 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>See How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
            A simple experience <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-900">for both sides</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Zero client training. Zero software for them to install. Just one living link where everything lives from kickoff to final payout.
          </p>
        </div>

        {/* 3 Steps Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
          
          {/* ────────────────────────────────────────────── */}
          {/* STEP 1: You send a link */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white font-mono text-xs font-semibold">
                  1
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 01</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 tracking-tight">
                You send a link
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Create a project and share a passcode-protected link with your client.
              </p>
            </div>

            {/* Real Product Slice: Share & Passcode Window */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3.5 shadow-inner">
                
                {/* Browser-style address pill */}
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-rose-400/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] font-mono text-slate-400 ml-2 truncate">portal.frevio.cloud</span>
                </div>

                {/* URL Bar with Copy Button */}
                <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                    <span className="font-mono text-slate-800 text-[11px] truncate">
                      frevio.cloud/p/acme
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 transition-all flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Passcode & Status */}
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                    <Lock className="w-3 h-3 text-indigo-500" />
                    <span>Passcode: <strong className="text-slate-700 font-mono">4892</strong></span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    PIN Protected
                  </span>
                </div>

                {/* Recipient status */}
                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Client access</span>
                  <span className="text-slate-600 font-medium">No account required</span>
                </div>

              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────── */}
          {/* STEP 2: Client views project */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white font-mono text-xs font-semibold">
                  2
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 02</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 tracking-tight">
                Client views project
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                They can see progress, deliverables, give feedback and approve work.
              </p>
            </div>

            {/* Real Product Slice: Client Portal Milestone & Sign-off */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3.5 shadow-inner">
                
                {/* Milestone Title + Sign-off Pill */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Deliverable #02
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Brand Guidelines v2.4
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-200/70 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Approved</span>
                  </span>
                </div>

                {/* Authentic Client Feedback Quote */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        S
                      </div>
                      <div className="text-[11px] font-medium text-slate-800">
                        Sarah · <span className="text-slate-400 font-normal">Client PM</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug pl-1">
                    &ldquo;This looks great! Approved to move forward. 👍&rdquo;
                  </p>
                </div>

                {/* Live Progress Bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Sprint Progress</span>
                    <span className="font-semibold text-slate-700">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[75%] rounded-full transition-all duration-500" />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────── */}
          {/* STEP 3: Get paid faster */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white font-mono text-xs font-semibold">
                  3
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 03</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 tracking-tight">
                Get paid faster
              </h3>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                Create an invoice and your client can pay securely via Stripe.
              </p>
            </div>

            {/* Real Product Slice: Stripe Invoice Card */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3.5 shadow-inner">
                
                {/* Invoice ID & Due Tag */}
                <div className="flex items-center justify-between text-xs">
                  <div className="font-mono text-[11px] text-slate-600 font-medium">
                    #INV-0012
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                    Milestone 2
                  </span>
                </div>

                {/* Amount Due Card */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Due</div>
                    <div className="text-lg font-bold text-slate-950 tracking-tight">$3,200.00</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-semibold">
                      Due on sign-off
                    </span>
                  </div>
                </div>

                {/* 1-Click Pay with Stripe Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5349e0] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all active:scale-[0.99]"
                >
                  <StripeIcon className="w-3.5 h-3.5" />
                  <span>Pay with Stripe</span>
                </button>

                {/* Payout reassurance */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Instant deposit to your bank account</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
