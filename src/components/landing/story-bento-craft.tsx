'use client'

import { Terminal, Shield, CreditCard, Sparkles, Radio, ArrowUpRight, Eye } from 'lucide-react'

export function StoryBentoCraft() {
  return (
    <section id="bento" className="relative bg-[#05060A] py-24 lg:py-32 px-6 border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              03 — Studio Architecture
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-white leading-tight mb-4">
            Engineered for practitioners who value craft.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed max-w-xl">
            Every feature is designed to reduce unbillable management overhead and make your client touchpoints look world-class.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Live Presence Radar (Span 2) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-[#0A0B14] p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all duration-300 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live WebSocket
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                Sub-Second Client Presence Radar
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed max-w-lg mb-6">
                Know the exact minute your client opens the portal, downloads a deliverable, or inspects invoice details. Never send an ill-timed follow-up again.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/50 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Client: Claire Sterling</span>
              <span className="text-emerald-400">Viewing Acme-Brand-Kit.pdf right now</span>
            </div>
          </div>

          {/* Card 2: Passcode Cryptography (Span 1) */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0A0B14] p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all duration-300 shadow-2xl group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-300 mb-8">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                Zero-Friction Passcode Gate
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed mb-6">
                Clients hate creating new passwords. Each portal is protected with a 6-digit access code for frictionless, secure viewing.
              </p>
            </div>

            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-8 h-10 rounded-lg border border-white/[0.1] bg-white/[0.02] flex items-center justify-center font-mono text-sm text-white font-bold"
                >
                  •
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: VS Code Heartbeat Sync (Span 1) */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0A0B14] p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all duration-300 shadow-2xl group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                IDE Heartbeat Pulses
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed mb-6">
                Install our official VS Code extension. Billable coding hours and project activity log automatically to your client records.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-white/[0.06] bg-black/50 font-mono text-[11px] text-slate-400 flex items-center justify-between">
              <span>status: active</span>
              <span className="text-emerald-400">16.5 hrs logged</span>
            </div>
          </div>

          {/* Card 4: Stripe Direct Connected Rails (Span 2) */}
          <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-[#0A0B14] p-8 sm:p-10 flex flex-col justify-between hover:border-white/[0.18] transition-all duration-300 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                0% Platform Fee
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                Direct Stripe Rails — Keep 100% of Your Earnings
              </h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed max-w-lg mb-6">
                Unlike Upwork or traditional agencies that take 10–20% of your billings, Frevio charges zero transaction cut. Payments move directly from your client to your Stripe account.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-black/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <span className="text-slate-300">Client pays $5,000.00</span>
              <span className="text-emerald-400 font-bold">You receive $5,000.00 (Minus standard Stripe processing)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
