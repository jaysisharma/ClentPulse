'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Check, MessageSquare, Mail,
  CreditCard, Eye, Layers, Sparkles
} from 'lucide-react'

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [approvedQuick, setApprovedQuick] = useState(false)
  const [approvedDeliverable, setApprovedDeliverable] = useState(false)

  return (
    <section className="px-4 pt-12 pb-20 sm:px-6 md:pt-16 md:pb-28 bg-[#08090A] text-[#F3F4F6]">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        
        {/* ── 01. Overads Signature Top Pill ── */}
        <Link
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/80 hover:text-white transition-colors"
        >
          <span>Built only for client management, from $19 a month</span>
          <span aria-hidden="true" className="grid size-4 place-items-center rounded-[5px] bg-white text-black">
            <ArrowRight className="size-2.5 text-black" />
          </span>
        </Link>

        {/* ── 02. Overads Signature Headline ── */}
        <h1 className="text-balance font-heading text-[2.5rem] sm:text-6xl md:text-7xl font-light leading-[1.04] tracking-[-0.03em] text-white">
          Your client work runs itself.{' '}
          <span className="block text-white/60">You just approve.</span>
        </h1>

        {/* ── 03. Overads Subtitle with Inline Comparison Tags ── */}
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-base md:text-lg text-slate-400 max-w-2xl text-balance">
          <span>The simpler alternative to</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-sm font-medium text-white">
            <MessageSquare className="size-3.5 text-indigo-400" />
            Slack chaos
          </span>
          <span>and</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-sm font-medium text-white">
            <Mail className="size-3.5 text-amber-400" />
            chasing unpaid invoices
          </span>
        </p>

        {/* ── 04. Overads CTA Block ── */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href={signupHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-white/90 shadow-sm cursor-pointer"
          >
            <span>Start 14-day free trial</span>
            <ArrowRight className="size-4" />
          </Link>
          <p className="max-w-sm text-balance text-xs leading-relaxed text-slate-400">
            Free for 14 days, then $19 a month. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* ── 05. Overads Signature Micro-Approval Card ── */}
        <div className="mx-auto mt-2 max-w-sm w-full rounded-xl border border-white/10 bg-[#0E1013] p-4 text-left shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">Sprint 3 milestone update</p>
              <p className="text-[11px] text-slate-400">Drafted for client. Waiting for your yes.</p>
            </div>
            <button
              type="button"
              onClick={() => setApprovedQuick(!approvedQuick)}
              className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                approvedQuick
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {approvedQuick ? 'Approved' : 'Approve'}
            </button>
          </div>

          <div className="my-3 h-px bg-white/[0.08]" />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">Deposit settled via Stripe</p>
              <p className="text-[11px] text-slate-400">$4,500.00 cleared directly</p>
            </div>
            <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="size-3" />
            </div>
          </div>
        </div>

        {/* ── 06. Overads Tile Showcase Container ── */}
        <div className="mt-8 sm:mt-12 w-full max-w-3xl rounded-[20px] sm:rounded-[24px] border border-white/10 bg-[#0C0D12] p-5 sm:p-8 text-left shadow-2xl">
          
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              <span className="ml-2 text-xs font-mono text-slate-500 hidden sm:inline">
                frevio.cloud/p/acme-brand
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Live Client Portal</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Eye className="w-3 h-3" />
                <span>Zero login friction</span>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Project Portal
              </div>
              <div className="text-lg sm:text-xl font-normal text-white mt-1">
                Acme Brand & Web Platform
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Client: Acme Corp · Sarah Lin (VP Product)
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-emerald-400">● Active Sprint 3 of 4</span>
              <div className="text-slate-400 text-[11px] mt-1">Target launch: Oct 28</div>
            </div>
          </div>

          {/* Section: Status Update */}
          <div className="py-6 border-b border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider text-[11px]">Latest Weekly Update</span>
              <span className="text-slate-400 text-[11px]">Oct 11, 2026</span>
            </div>
            
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-0.5">―</span>
                <span>Finalized responsive checkout UX wireframes and token architecture.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-0.5">―</span>
                <span>Integrated Stripe payment settlements for upfront kickoff deposits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 mt-0.5">―</span>
                <span>Recorded 4-minute Loom walkthrough explaining the state management logic.</span>
              </li>
            </ul>
          </div>

          {/* Section: Deliverable Approval */}
          <div className="py-6 border-b border-white/[0.08] space-y-3">
            <div className="text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              Deliverables & Sign-offs
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-sm font-medium text-white">
                  Sprint 3 Design Specification & Prototype
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Reviewer: Sarah Lin · Figma link attached
                </div>
              </div>

              <button
                type="button"
                onClick={() => setApprovedDeliverable(!approvedDeliverable)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-mono font-medium transition-colors cursor-pointer self-start sm:self-auto ${
                  approvedDeliverable
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approvedDeliverable ? 'Approved by Client' : 'Approve Deliverable'}</span>
              </button>
            </div>
          </div>

          {/* Section: Invoices & Settlement */}
          <div className="pt-6 space-y-3">
            <div className="text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              Payment Status
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm font-mono py-1">
              <div>
                <span className="text-white">Invoice #INV-2026-03</span>
                <span className="text-slate-400 text-xs ml-2">Sprint 3 milestone</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-semibold">$4,500.00</span>
                <span className="text-slate-400 text-xs ml-2">Paid via Stripe</span>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Client portal link: frevio.cloud/p/acme-brand</span>
            <span>Powered by Frevio</span>
          </div>

        </div>

        {/* ── 07. Overads Signature "Works with" Integration Row ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-mono text-slate-400">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Works seamlessly with:</span>
          <span className="text-slate-400">Stripe</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Figma</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Loom</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Slack</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Google Drive</span>
        </div>

      </div>
    </section>
  )
}
