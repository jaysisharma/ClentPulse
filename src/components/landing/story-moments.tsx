'use client'

import { Radio, CheckCircle2, CreditCard, Zap, ArrowRight, ShieldCheck, FileText } from 'lucide-react'

const MOMENTS = [
  {
    step: 'Beat 01',
    action: 'Update Published',
    headline: '45 seconds to broadcast status',
    detail:
      'Publish your weekly recap or milestone deliverable in under a minute. Your client receives an encrypted magic notification — zero email clutter, zero Slack noise.',
    icon: Radio,
    tag: 'Frevio Pulse',
    mock: (
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Live Update Broadcast
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Today, 4:10 PM</span>
        </div>
        <div className="text-xs font-semibold text-white">Homepage Rebuild & Mobile Nav Completed</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Hero grid refactored for ultra-wide displays. Ready for client review.
        </p>
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] text-[10px] text-slate-500">
          <FileText className="w-3 h-3 text-indigo-400" />
          <span>Figma file linked · 3 assets</span>
        </div>
      </div>
    ),
  },
  {
    step: 'Beat 02',
    action: 'Client Approves',
    headline: '1-click mobile sign-off',
    detail:
      'Stakeholders review on their phone during lunch. No account creation needed. One tap records a timestamped approval with full audit trail.',
    icon: CheckCircle2,
    tag: 'Zero Friction',
    mock: (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Deliverable Approved
          </span>
          <span className="text-[10px] text-slate-500 font-mono">12:43 PM</span>
        </div>
        <div className="text-xs font-semibold text-white">Milestone 2: Design Architecture</div>
        <p className="text-[11px] text-slate-300 italic">
          "The layout is spot on. Approved to move forward to build phase."
        </p>
        <div className="text-[10px] text-slate-500 pt-1">
          — Claire Sterling, VP Marketing
        </div>
      </div>
    ),
  },
  {
    step: 'Beat 03',
    action: 'Invoice Auto-Generated',
    headline: 'Milestone converts to payment',
    detail:
      'Approval automatically issues a connected Stripe invoice. Exact contracted amount, taxes, and deposit deductions handled automatically.',
    icon: CreditCard,
    tag: 'Automated Billing',
    mock: (
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Stripe Connect
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Awaiting Payment
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs text-slate-400 font-light">Milestone 2 Balance</span>
          <span className="text-xl font-bold font-mono text-white">$3,200.00</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-white/[0.04]">
          Card, Apple Pay, ACH Transfer supported
        </div>
      </div>
    ),
  },
  {
    step: 'Beat 04',
    action: 'Instant Settlement',
    headline: 'Funds in your bank in 48h',
    detail:
      'No chasing overdue balances. Clients pay immediately on approval. You receive real-time webhook confirmation while you continue doing what you love.',
    icon: Zap,
    tag: 'Direct Payout',
    mock: (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            <Zap className="w-3 h-3 text-emerald-400" />
            Payout Settled
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Paid in Full</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-bold font-mono text-white">$3,200.00</span>
          <span className="text-xs text-slate-400">USD</span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-white/[0.04]">
          Automated Stripe bank payout scheduled for Friday
        </div>
      </div>
    ),
  },
]

export function StoryMoments() {
  return (
    <section id="features" className="relative bg-[#090A0F] py-24 lg:py-32 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              04 — The Workflow Loop
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight mb-4">
            From project update to bank deposit in four beats.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            Replace seven fragmented tools with one cohesive operating cadence. Frevio ties deliverables, approvals, and invoices into an unbroken chain.
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOMENTS.map((moment, idx) => {
            const Icon = moment.icon
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-white/[0.06] bg-[#0c0d14] p-7 sm:p-8 flex flex-col justify-between hover:border-white/[0.14] transition-all duration-300 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-indigo-400">
                      {moment.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.05]">
                      {moment.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1.5">
                    {moment.action}
                  </h3>
                  <div className="text-xs text-slate-300 font-medium mb-3">
                    {moment.headline}
                  </div>

                  <p className="text-sm text-slate-400 font-light leading-relaxed mb-6">
                    {moment.detail}
                  </p>
                </div>

                <div>
                  {moment.mock}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
