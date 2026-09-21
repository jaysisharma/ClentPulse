'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Lock,
  MessageSquare,
  Mail,
  Hash,
  Radio,
  FileCheck,
  Receipt
} from 'lucide-react'

interface Props {
  signupHref: string
}

export function ProblemSolutionSection({ signupHref }: Props) {
  return (
    <section id="the-story" className="relative py-20 sm:py-28 px-5 sm:px-8 bg-[#090A0F] border-t border-white/[0.08] text-white overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-14">

        {/* Story Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 font-semibold">
            <span className="size-1.5 rounded-full bg-indigo-400" />
            <span>The Reality</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-[1.08]">
            Clients don&apos;t ping to annoy you. <br />
            <span className="font-normal text-slate-400">They ping because they can&apos;t see.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            Without a single link to check, your personal inbox becomes their project tracker. One permanent link changes the dynamic completely.
          </p>
        </div>

        {/* Night vs Day Visual Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">

          {/* ── Left: The 11:42 PM Phone Screen (Before) ── */}
          <div className="rounded-3xl bg-[#0e1017] text-slate-100 p-6 sm:p-7 flex flex-col justify-between border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="space-y-6">

              {/* iPhone-style Lockscreen Header */}
              <div className="text-center space-y-1 pt-1 pb-2">
                <div className="inline-flex items-center justify-center size-5 mx-auto rounded-full bg-white/10 text-slate-400">
                  <Lock className="size-2.5" />
                </div>
                <div className="text-4xl sm:text-5xl font-extralight tracking-tight text-white font-sans">
                  11:42
                </div>
                <p className="text-xs text-slate-400 font-normal">
                  Tuesday, September 21
                </p>
              </div>

              {/* Notifications */}
              <div className="space-y-2.5">
                
                {/* WhatsApp Notification */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="size-4 rounded-md bg-[#25D366] flex items-center justify-center text-white">
                        <MessageSquare className="size-2.5 fill-white" />
                      </div>
                      <span className="font-medium text-slate-200 text-[11px] tracking-wide">WhatsApp</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">now</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">David (Acme)</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      &ldquo;Hey, sorry to text so late — any update on staging? Have to show the team at 9 AM tomorrow.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Email Notification */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="size-4 rounded-md bg-[#007AFF] flex items-center justify-center text-white">
                        <Mail className="size-2.5" />
                      </div>
                      <span className="font-medium text-slate-200 text-[11px] tracking-wide">Mail</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Finance @ Acme Corp</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      &ldquo;Re: Invoice #2 PDF — finance couldn&apos;t find the file in the thread. Could you re-send?&rdquo;
                    </p>
                  </div>
                </div>

                {/* Slack Notification */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="size-4 rounded-md bg-[#611f69] flex items-center justify-center text-white">
                        <Hash className="size-2.5" />
                      </div>
                      <span className="font-medium text-slate-200 text-[11px] tracking-wide">Slack</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">3h ago</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">David in #redesign</p>
                    <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                      &ldquo;Which Figma link is the final signed version? Drive or Slack?&rdquo;
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Footnote */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>3 apps. 2 lost files.</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 font-medium">
                1 interrupted evening
              </span>
            </div>
          </div>

          {/* ── Right: The Frevio Client View (After) ── */}
          <div className="rounded-3xl bg-[#0e1017] text-slate-100 p-6 sm:p-7 flex flex-col justify-between border border-emerald-500/20 shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/10">
            <div className="space-y-6">

              {/* Portal Header matching Left Screen */}
              <div className="text-center space-y-1 pt-1 pb-2">
                <div className="inline-flex items-center justify-center size-5 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs">
                  <Lock className="size-2.5" />
                </div>
                <div className="text-xl sm:text-2xl font-light tracking-tight text-white font-mono flex items-center justify-center gap-2">
                  <span>frevio.cloud/p/acme</span>
                </div>
                <p className="text-xs text-slate-400 font-normal">
                  Acme Brand Redesign · Passcode PIN: 4812
                </p>
              </div>

              {/* Visual Status Cards (Clean, UI-first, zero text bloat) */}
              <div className="space-y-2.5">

                {/* 1. Staging & Milestone Progress */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Radio className="size-3.5 text-indigo-400" />
                      <span>Milestone 3: Checkout Flow</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">75%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Staging preview live
                    </span>
                    <span className="font-mono text-slate-500">ETA: Thu 2 PM</span>
                  </div>
                </div>

                {/* 2. Paid Invoice */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                      <Receipt className="size-3.5 text-emerald-400" />
                      <span>Milestone 2 Invoice</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">$3,200.00 USD · Sep 18</p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full shrink-0">
                    Paid via Stripe ✓
                  </span>
                </div>

                {/* 3. Deliverable Sign-Off */}
                <div className="rounded-2xl bg-[#161822] border border-white/[0.06] p-3.5 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                      <FileCheck className="size-3.5 text-purple-400" />
                      <span>Brand Guidelines v2.4</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Signed off by David via mobile</p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full shrink-0">
                    Approved ✓
                  </span>
                </div>

              </div>

            </div>

            {/* Bottom Footnote */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>1 link. 0 accounts needed.</span>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <span>Create client link</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
