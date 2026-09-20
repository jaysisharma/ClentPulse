'use client'

import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, Check, X,
  Clock, Lock, DollarSign, MessageCircle, FileText, Smartphone
} from 'lucide-react'

interface Props {
  signupHref: string
}

export function ProblemSolutionSection({ signupHref }: Props) {
  return (
    <section id="the-story" className="py-24 sm:py-32 px-5 sm:px-8 bg-white border-t border-slate-200/80 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-16 sm:space-y-20">
        
        {/* Editorial Story Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            <span>The Reality</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-slate-950 leading-[0.98]">
            Clients don&apos;t ping to annoy you. <br />
            <span className="font-normal">They ping because they can&apos;t see.</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            When there is no single place to check progress, WhatsApp becomes your dashboard. Here is how your week changes when you give them one passcode link instead.
          </p>
        </div>

        {/* Realistic Story Cards: Left (The Everyday Hassle) vs Right (The Frevio Way) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* ── LEFT: The Everyday Hassle ── */}
          <div className="rounded-2xl border border-slate-200 bg-[#fbfbfc] p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                    Scattered across 4 apps
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">11:42 PM</span>
              </div>

              {/* Realistic Mobile Message Cards */}
              <div className="space-y-3">
                
                {/* Message 1: The Status Question */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <MessageCircle className="size-3.5 text-slate-400" />
                      <span>WhatsApp message</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">11:42 PM</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;Hey, any updates on the design? When will staging be ready? Need to show the team tomorrow morning.&rdquo;
                  </p>
                </div>

                {/* Message 2: The Lost Invoice */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <FileText className="size-3.5 text-slate-400" />
                      <span>Email thread</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">3 days later</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;Can you re-send invoice #2? Our finance team couldn&apos;t find the PDF attachment in our email thread.&rdquo;
                  </p>
                </div>

                {/* Message 3: The Contract Sign-off */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-900">
                      <Smartphone className="size-3.5 text-slate-400" />
                      <span>Slack DM</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Friday</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;Which version of the contract are we signing? Was it the Google Doc or the PDF?&rdquo;
                  </p>
                </div>

              </div>

              {/* Takeaway bullet */}
              <div className="pt-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every project creates 20+ scattered links, lost PDF attachments, and late-night interruptions.
                </p>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
              Result: You spend hours managing communication instead of doing client work.
            </div>
          </div>

          {/* ── RIGHT: The Frevio Link ── */}
          <div className="rounded-2xl border border-indigo-200/80 bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm ring-1 ring-indigo-950/5">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-950 font-mono">
                    One Passcode Link
                  </span>
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Always Live
                </span>
              </div>

              {/* Realistic Passcode Portal View */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3.5">
                
                {/* Portal Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      <Lock className="size-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">Website Redesign Portal</h4>
                      <p className="text-[10px] text-slate-500">frevio.app/p/acme · 4-digit passcode</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-700 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                    75% done
                  </span>
                </div>

                {/* Live Progress Indicator */}
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">Current Milestone: Stripe Checkout</span>
                    <span className="text-[11px] text-slate-400">Milestone 3 of 4</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full w-[75%] bg-emerald-500 rounded-full" />
                  </div>
                </div>

                {/* 1-Click Approval */}
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="block text-xs font-medium text-slate-900">Design Deliverable v2</span>
                    <span className="block text-[10px] text-slate-500">Signed off on mobile</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Check className="size-3" /> Approved
                  </span>
                </div>

                {/* Stripe Pay In 1 Click */}
                <div className="rounded-lg bg-white p-3 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="block text-xs font-medium text-slate-900">Milestone 2 Invoice</span>
                    <span className="block text-[10px] text-slate-500 font-mono">$3,200.00 USD</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    <DollarSign className="size-3 text-emerald-600" /> Paid via Stripe
                  </span>
                </div>

              </div>

              {/* Takeaway bullet */}
              <div className="pt-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your client bookmarks one link. No passwords to remember. They see the status, approve deliverables, and pay invoices.
                </p>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">No client accounts. No 11 PM texts.</span>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-950 hover:text-indigo-600 transition-colors"
              >
                <span>Create a client link</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
