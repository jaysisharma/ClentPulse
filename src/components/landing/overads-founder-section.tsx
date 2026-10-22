'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, ShieldCheck, ArrowUpRight, Zap, Check, Lock } from 'lucide-react'
import { GitHubIcon } from '@/components/ui/brand-icons'

export function OveradsFounderSection() {
  return (
    <section id="about" className="py-24 lg:py-32 px-6 bg-[#08090a] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Section Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
            <span>About Frevio</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[1.02]">
            Built for developers who hate client chase.
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-slate-400 font-light">
            A focused client operating system designed to protect your deep work while keeping your clients informed and paying on time.
          </p>
        </div>

        {/* Founder Card & Personal Note */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f1118] to-[#090a0e] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Founder profile */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-white shadow-inner font-mono">
                  JS
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Jaysi Sharma</h3>
                  <p className="text-xs text-indigo-400 font-mono">Founder &amp; Lead Engineer</p>
                  <p className="text-[11px] text-slate-400">Creator of Frevio</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
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

              <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% founder-supported</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No Frevio invoice fees</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Password-free client links</span>
                </div>
              </div>
            </div>

            {/* Right: Personal commitment letter */}
            <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-8 pt-6 lg:pt-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Founder letter</span>
              </div>

              <blockquote className="space-y-3.5 text-sm text-slate-300 font-light leading-relaxed">
                <p>
                  Clients don&rsquo;t ask &ldquo;any updates on this?&rdquo; to be difficult. They ask because traditional client handoffs are fragmented across email attachments, Slack threads, and confusing PDF invoices. You end up stopping deep work just to recount what was done.
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
