'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Play, CheckCircle2, ShieldCheck, CreditCard, Sparkles, Eye, Monitor } from 'lucide-react'

interface FrevioHeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: FrevioHeroProps) {
  const [viewMode, setViewMode] = useState<'portal' | 'studio'>('portal')
  const [approvedBadge, setApprovedBadge] = useState(false)

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 bg-[#08090a] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Top Header: Minimal, Punchy, Fast to Read ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>The Client Workspace for Freelancers &amp; Studios</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-[-0.03em] text-white leading-[1.08] text-balance">
            Keep client work in one clear place.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto text-balance">
            Share milestones, collect 1-click approvals, and get paid via Stripe — in a private workspace your clients can access without creating an account.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.01] shadow-lg shadow-white/5"
            >
              <span>Start free</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch 1-min demo</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Free for up to 2 active projects
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Clients need zero account
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              No credit card required
            </span>
          </div>
        </div>

        {/* ── Main Feature: Large, Eye-Catching Product Interface Visual ── */}
        <div className="mt-10 sm:mt-12">
          <div className="relative rounded-2xl border border-white/[0.14] bg-[#0c0d12] shadow-2xl overflow-hidden ring-1 ring-white/[0.08]">
            
            {/* Window Chrome Header & View Toggle */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090a0f] px-4 py-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/70" />
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  <span className="size-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="hidden sm:flex items-center gap-2 ml-3 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500">https://</span>
                  <span>frevio.cloud/p/acme-brand-system</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">LIVE</span>
                </div>
              </div>

              {/* View Switcher: Portal View vs Studio Monitor */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('portal')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'portal'
                      ? 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Portal UI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('studio')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                    viewMode === 'studio'
                      ? 'bg-white text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Studio Setup</span>
                </button>
              </div>
            </div>

            {/* Display Visual */}
            <div className="relative w-full aspect-[16/9] md:aspect-[16/9.2] bg-[#07080c] overflow-hidden group">
              {viewMode === 'portal' ? (
                <>
                  <img
                    src="/hero_client_portal.png"
                    alt="Frevio Client Portal Interface with Milestones, Deliverable Approvals, and Stripe Payment"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                  />

                  {/* Interactive Hotspot / Overlay Callouts */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setApprovedBadge(!approvedBadge)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-xl transition-all hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{approvedBadge ? '✓ Deliverable Signed Off & Stamped' : 'Click to test 1-Click Approval'}</span>
                    </button>

                    <div className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-mono shadow-xl">
                      <span className="size-2 rounded-full bg-indigo-400" />
                      <span>72% Milestones Delivered</span>
                    </div>

                    <div className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-mono shadow-xl">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>$4,500 Paid via Stripe</span>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src="/images/frevio-workspace-hero.jpg"
                  alt="Frevio Workspace Studio Monitor Display"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>

            {/* Visual Highlights Footer Under the Main Image */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] border-t border-white/[0.08] bg-[#090a0f]">
              <div className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Live Milestones</div>
                  <div className="text-[11px] text-slate-400">Clear progress bars, no status chasing</div>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">1-Click Sign-offs</div>
                  <div className="text-[11px] text-slate-400">Audit trail prevents scope creep</div>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Stripe Checkout</div>
                  <div className="text-[11px] text-slate-400">Invoices connected directly to deliverables</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
