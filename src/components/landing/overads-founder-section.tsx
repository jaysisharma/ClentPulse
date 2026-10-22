'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Clock, CheckCircle2, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react'
import { GitHubIcon } from '@/components/ui/brand-icons'

export function OveradsFounderSection() {
  return (
    <section id="about" className="py-24 lg:py-32 px-6 bg-[#08090a] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* ── 1. REAL EARLY ADOPTER RESULTS ── */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
            <span>Pilot Workflow Outcomes</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[0.98]">
            Real results from our early pilot studios.
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-slate-400 font-light max-w-2xl">
            We track actual workflow metrics across our first freelance and studio cohorts—no inflated revenue counters or stock testimonials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            {/* Metric 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0e14] p-6 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">4.8 hrs</div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono mt-1">Saved per client weekly</div>
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                By replacing fragmented status check-in emails with automatic pulse updates and permanent links.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0e14] p-6 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">&lt; 48 hrs</div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono mt-1">Sign-off to settlement</div>
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Average turnaround time from 1-click deliverable sign-off to direct Stripe payout.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0e14] p-6 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">100%</div>
                <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider font-mono mt-1">Zero password friction</div>
              </div>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Clients open private links without account registration or login prompts, eliminating review drop-off.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. SOLO FOUNDER NOTE & TRUST ── */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f1118] to-[#090a0e] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Founder profile */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-white shadow-inner font-mono">
                  JS
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Jaysi Sharma</h3>
                  <p className="text-xs text-indigo-400 font-mono">Founder &amp; Lead Engineer</p>
                  <p className="text-[11px] text-slate-400">Building Frevio</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href="mailto:jaysi@frevio.cloud"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-mono transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>jaysi@frevio.cloud</span>
                </a>
                <a
                  href="https://github.com/jaysisharma"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  aria-label="GitHub Profile"
                >
                  <GitHubIcon className="w-3.5 h-3.5 text-slate-300" />
                </a>
              </div>
            </div>

            {/* Right: Personal commitment letter */}
            <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-8 pt-6 lg:pt-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Founder commitment</span>
              </div>

              <blockquote className="space-y-3 text-sm text-slate-300 font-light leading-relaxed">
                <p>
                  Clients don&rsquo;t ask &ldquo;any updates on this?&rdquo; to be difficult. They ask because traditional client handoffs are fragmented across email attachments, Slack threads, and confusing invoices. You end up stopping deep work just to recount what was done.
                </p>
                <p>
                  I built Frevio so creative professionals and independent studios can give clients one clean, respectful link. Work gets reviewed live, milestones get signed off, and invoices get paid via Stripe without platform transaction fees.
                </p>
                <p className="text-slate-400 text-xs">
                  As an independent founder, I read every message and support request myself. If you ever hit friction or have a workflow request, email me directly.
                </p>
              </blockquote>

              <div className="pt-2">
                <a
                  href="mailto:jaysi@frevio.cloud?subject=Frevio%20Feedback%20%2F%20Question"
                  className="inline-flex items-center gap-1.5 text-xs text-white font-medium hover:text-indigo-300 transition-colors underline underline-offset-4"
                >
                  <span>Send Jaysi an email directly</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
