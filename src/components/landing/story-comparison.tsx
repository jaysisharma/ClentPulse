'use client'

import { useState } from 'react'
import { Check, X, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react'

export function StoryComparison() {
  const [activeSide, setActiveSide] = useState<'both' | 'chaos' | 'protocol'>('both')

  return (
    <section id="comparison" className="relative bg-[#05060A] py-24 lg:py-32 px-6 border-t border-white/[0.06] overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              01 — Architectural Contrast
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-white leading-tight mb-4">
            The traditional chaos vs.{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              The Frevio Protocol.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
            Top independent studios don't manage clients over 5 fragmented channels. They operate on a clear, professional standard.
          </p>
        </div>

        {/* Dual Comparison Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* THE CHAOS (Left Side) */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-950/[0.04] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-rose-500/10 border-l border-b border-rose-500/20 text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
              The Fragmentation
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">The Scattered Standard</h3>
                  <p className="text-xs text-rose-300/70 font-mono">How 95% of freelancers operate</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-black/40">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">40-reply email chains</strong>
                    <span className="text-xs text-slate-400 font-light">"Can you resend that Dropbox link from Tuesday?"</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-black/40">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">Manual invoice generation</strong>
                    <span className="text-xs text-slate-400 font-light">Typing PDFs, copying hours from timers, tracking unpaid balances</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-black/40">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">Ambiguous milestone approvals</strong>
                    <span className="text-xs text-slate-400 font-light">"Looks good to me" in Slack, disputed later during final billing</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-black/40">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">Awkward payment follow-ups</strong>
                    <span className="text-xs text-slate-400 font-light">22 days of "just bumping this invoice to the top of your inbox"</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-rose-500/15 text-xs text-rose-300/80 font-mono">
              Outcome: 6+ unbillable hours lost each week per project.
            </div>
          </div>

          {/* THE FREVIO PROTOCOL (Right Side) */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#0e101c] to-[#080910] p-8 sm:p-10 flex flex-col justify-between shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] relative overflow-hidden ring-1 ring-indigo-500/20">
            <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-indigo-500/20 border-l border-b border-indigo-500/30 text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
              The Frevio Standard
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-md">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">The Modern Studio Protocol</h3>
                  <p className="text-xs text-indigo-400 font-mono">1 link. 0 emails. Instant payouts.</p>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">1 permanent encrypted portal link</strong>
                    <span className="text-xs text-slate-300 font-light">Passcode-protected. All deliverables, updates, and files in one spot.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">1-Click timestamped client sign-offs</strong>
                    <span className="text-xs text-slate-300 font-light">Legal audit trail recorded instantly when clients approve on mobile.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">Direct Stripe connected settlement</strong>
                    <span className="text-xs text-slate-300 font-light">0% platform commission. Payouts land in your bank in 48 hours.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-xs">VS Code & Toolchain sync</strong>
                    <span className="text-xs text-slate-300 font-light">Real-time status, Figma assets, and Git summaries synced automatically.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-500/20 text-xs text-emerald-400 font-mono flex items-center justify-between">
              <span>Outcome: Paid in 3 days. Zero follow-up emails.</span>
              <span className="text-white font-bold">100% Retained</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
