'use client'

import { useState } from 'react'
import { Copy, Check, CheckCircle2, CreditCard, Lock, Sparkles, ArrowRight } from 'lucide-react'

export function HowItWorksSection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText?.('https://frevio.cloud/p/acme-rebrand')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="how-it-works" className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        
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
            No bloated project management software. No client onboarding hurdle. Just a clean link that keeps everybody aligned.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          
          {/* Step 1: You send a link */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step 1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950">
                You send a link
              </h3>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                Create a project and share a passcode-protected link with your client.
              </p>
            </div>

            {/* Step 1 Visual Mockup */}
            <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Client Link</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Protected
                </span>
              </div>

              <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-slate-200/80 text-xs">
                <span className="font-mono text-slate-700 truncate mr-2">
                  frevio.cloud/p/acme
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span>Passcode: • • • •</span>
                <span className="text-slate-400">1 click login</span>
              </div>
            </div>
          </div>

          {/* Step 2: Client views project */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step 2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950">
                Client views project
              </h3>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                They can see progress, deliverables, give feedback and approve work.
              </p>
            </div>

            {/* Step 2 Visual Mockup */}
            <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Design System v2</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved</span>
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 text-[9px] text-white flex items-center justify-center font-bold">
                    S
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Sarah (Client)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  &ldquo;This looks great! Ready to move forward with the build phase.&rdquo;
                </p>
              </div>

              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[80%] rounded-full" />
              </div>
            </div>
          </div>

          {/* Step 3: Get paid faster */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step 3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950">
                Get paid faster
              </h3>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                Create an invoice and your client can pay securely via Stripe.
              </p>
            </div>

            {/* Step 3 Visual Mockup */}
            <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">#INV-0012</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Due in 3 days
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Amount Due</div>
                  <div className="text-base font-bold text-slate-900">$3,200.00</div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 text-right">
                  Stripe Checkout
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5349e0] text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay with Stripe</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
