'use client'

import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export function FrevioProblem() {
  return (
    <section id="problem" className="py-16 md:py-24 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header: Minimal & Direct */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-xs font-mono uppercase tracking-[0.16em] text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>The Fragmented Reality</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Client work gets messy when it’s everywhere.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Updates in WhatsApp. Feedback in 20-reply email chains. Files lost in Google Drive. Invoices disconnected from progress.
          </p>
        </div>

        {/* ── Centerpiece Visual: Chaos vs. Frevio Clarity ── */}
        <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0d14] overflow-hidden shadow-2xl">
          <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] bg-[#07080c] overflow-hidden">
            <img
              src="/client_chaos_vs_calm.png"
              alt="Visual comparison: Scattered fragmented communication vs centralized Frevio client portal link"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Visual Legend / Breakdown Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] bg-[#090a0f] border-t border-white/[0.08]">
            <div className="p-4 sm:p-5 flex items-start gap-3">
              <span className="size-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                  Scattered Communication
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Lost feedback in chat apps, duplicate emails, awkward payment chasing, and constant &ldquo;where are we on this?&rdquo; messages.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-start gap-3">
              <span className="size-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Centralized Frevio Link
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  One clean project URL protected by a 6-digit passcode. Milestones, updates, deliverables, and Stripe billing in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
