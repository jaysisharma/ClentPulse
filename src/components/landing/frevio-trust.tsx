'use client'

import { ShieldCheck, Check, Sparkles, Layers, Users2 } from 'lucide-react'

export function FrevioTrust() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0c0d12] py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Editorial Credibility Statement */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
            Purpose-built for independent creators
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-light text-slate-200 leading-relaxed text-balance">
            Designed for independent developers, designers, copywriters, consultants, and boutique studios who want to look effortlessly professional — without juggling four different software subscriptions.
          </p>
        </div>

        {/* 3 Authentic Architectural Truths */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-white/[0.06] pt-8 text-left">
          
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Zero client friction
            </div>
            <div className="text-sm font-medium text-white">
              1 permanent link per project
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              Clients access their status page instantly with a 6-digit passcode. No passwords to remember or accounts to manage.
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Scope protection
            </div>
            <div className="text-sm font-medium text-white">
              Explicit milestone approvals
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              Every deliverable sign-off is logged with a timestamp, keeping client expectations and revisions transparent.
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Unified billing
            </div>
            <div className="text-sm font-medium text-white">
              Direct Stripe settlement
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              Turn tracked milestones directly into Stripe invoices. Clients pay via card or Apple Pay without leaving the portal.
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
