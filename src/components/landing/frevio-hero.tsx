'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Play, CheckCircle2, Lock, Sparkles, ExternalLink, FileText, Check } from 'lucide-react'

interface FrevioHeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: FrevioHeroProps) {
  const [approved, setApproved] = useState(false)
  const [approving, setApproving] = useState(false)
  const [viewMode, setViewMode] = useState<'interactive' | 'studio'>('interactive')

  const handleApprove = () => {
    if (approved) return
    setApproving(true)
    setTimeout(() => {
      setApproving(false)
      setApproved(true)
    }, 450)
  }

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 bg-[#08090a] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ── Left Column: Editorial Headline & Copy ── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
              <span>The Client Workspace for Freelancers and Studios</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-[-0.03em] text-white leading-[1.08] text-balance">
              Keep client work in one clear place.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed text-balance">
              Manage projects, share updates, collect feedback, get approvals, and handle invoices — all in a workspace your clients can access without creating another account.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.01] shadow-sm"
              >
                <span>Start free</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch demo</span>
              </Link>
            </div>

            {/* Supporting Notes (Accurate to Plan) */}
            <p className="pt-2 text-xs text-slate-400 font-normal leading-relaxed">
              Free for up to 2 active projects · No credit card required · Clients don&apos;t need an account
            </p>

          </div>

          {/* ── Right Column: Single Substantial, Faithful Frevio Interface ── */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#0d0e14] shadow-2xl overflow-hidden ring-1 ring-white/[0.05]">
              
              {/* Top Window Chrome with View Mode Switcher */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090a0f] px-4 py-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500/70" />
                    <span className="size-2.5 rounded-full bg-amber-500/70" />
                    <span className="size-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
                    frevio.cloud/p/acme-brand-system
                  </span>
                </div>
                
                {/* View Switcher: Interactive vs Studio Render */}
                <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setViewMode('interactive')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewMode === 'interactive'
                        ? 'bg-white text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Interactive
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('studio')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewMode === 'studio'
                        ? 'bg-white text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Studio View
                  </button>
                </div>
              </div>

              {/* Workspace Body / Studio Shot */}
              {viewMode === 'studio' ? (
                <div className="relative aspect-[16/10] w-full bg-[#08090a] overflow-hidden">
                  <img
                    src="/images/frevio-workspace-hero.jpg"
                    alt="Frevio Desktop SaaS Workspace Interface"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="p-6 sm:p-7 space-y-6">
                  
                  {/* 1. Project Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-medium">
                        Acme Corp
                      </div>
                      <h2 className="text-xl sm:text-2xl font-normal text-white mt-0.5">
                        Brand System &amp; Web Platform
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        In Progress · Sprint 3
                      </span>
                    </div>
                  </div>

                  {/* 2. Milestone Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Milestones completed</span>
                      <span className="font-mono text-slate-200 font-medium">3 of 4 (75%)</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>

                  {/* 3. Recent Client Update */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Latest progress update</span>
                      <span className="text-[11px] font-mono text-slate-400">Yesterday, 4:30 PM</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                      Staging checkout build deployed. Product catalog responsive across mobile and tablet. Ready for final review of UI specifications.
                    </p>
                  </div>

                  {/* 4. Deliverable Awaiting Review + Interactive Approval Action */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04] p-4.5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-white">
                            Final UI Specifications &amp; Design System v2.4
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Figma link &amp; interactive tokens · 14.2 MB
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border transition-colors flex-shrink-0 ${
                        approved
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                      }`}>
                        {approved ? 'Approved' : 'Awaiting Review'}
                      </span>
                    </div>

                    {/* Interactive Client Sign-off Trigger */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
                      <span className="text-[11px] text-slate-400">
                        {approved
                          ? 'Sign-off confirmed and timestamped. Freelancer notified.'
                          : 'Review assets and confirm approval:'}
                      </span>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={approving || approved}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          approved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs'
                        }`}
                      >
                        {approved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approved by Client</span>
                          </>
                        ) : approving ? (
                          <span>Recording sign-off...</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Deliverable</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom Subtle Status Footnote */}
              <div className="px-6 py-3 bg-[#090a0f] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Next Milestone: Production Launch &amp; Stripe Invoice</span>
                <span className="text-slate-500">Zero client login required</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
