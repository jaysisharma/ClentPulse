'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

interface WorkflowScenario {
  id: string
  tabLabel: string
  tool: string
  toolBadge: string
  triggerTitle: string
  triggerTime: string
  codeSnippet: {
    line1: string
    line2: string
    line3: string
  }
  meta: string
  actionBadge: string
  actionTitle: string
  recipient: string
  greeting: string
  bullets: string[]
  question: string
  buttonText: string
  successNote: string
}

const SCENARIOS: WorkflowScenario[] = [
  {
    id: 'monday',
    tabLabel: 'Monday Client Brief',
    tool: 'GitHub + Figma',
    toolBadge: 'Branch: main',
    triggerTitle: '14 Commits Merged & 3 Specs Updated',
    triggerTime: 'Every Monday · 9:00 AM',
    codeSnippet: {
      line1: 'commit 7a8f92c (HEAD -> main)',
      line2: 'feat(checkout): stripe payments & responsive audit',
      line3: '+142 lines · 4 files changed · 3 figma frames synced'
    },
    meta: 'Detected merged commits on main & updated prototype links since Friday',
    actionBadge: 'Monday Broadcast Draft',
    actionTitle: 'Week 4 Progress Briefing',
    recipient: 'To: Claire (Acme Corp) · frevio.cloud/p/acme',
    greeting: 'Hey Claire, here is what we wrapped up since Friday:',
    bullets: [
      'Stripe checkout flow deployed to acme-preview.vercel.app',
      'Mobile navigation responsive audit completed across iPhone & Android',
      'Next: Final QA pass before Thursday stakeholder review'
    ],
    question: 'Send Monday brief to Claire?',
    buttonText: 'Publish to Client Portal',
    successNote: 'Published to Acme client portal. Claire notified via email.'
  },
  {
    id: 'guard',
    tabLabel: 'Milestone Scope Guard',
    tool: 'VS Code Timer',
    toolBadge: 'Limit: 16.5 hrs',
    triggerTitle: 'Milestone 2 Threshold Crossed',
    triggerTime: 'Today · 2:15 PM',
    codeSnippet: {
      line1: 'pulse: Acme Rebrand / Phase 2',
      line2: 'logged: 16.5 billable hours (threshold reached)',
      line3: 'status: 100% of sprint deliverables finalized'
    },
    meta: 'Monitors logged editor hours against contract milestone limits',
    actionBadge: 'Milestone Lock & Invoicing',
    actionTitle: 'Milestone 2 Scope Lock & Invoice #104',
    recipient: 'To: Acme Corp Billing · frevio.cloud/p/acme',
    greeting: 'Sprint 4 deliverables complete. Ready to lock scope & issue invoice:',
    bullets: [
      'All Sprint 4 Figma specifications verified and signed',
      'Invoice #104 pre-filled for $3,200.00 USD (deposit credited)',
      'Scope locked to prevent unpaid out-of-contract additions'
    ],
    question: 'Lock Milestone 2 & dispatch invoice?',
    buttonText: 'Approve & Issue Invoice',
    successNote: 'Milestone 2 locked for review. Stripe invoice dispatched.'
  },
  {
    id: 'invoice',
    tabLabel: 'Instant Invoicing',
    tool: 'Client Portal',
    toolBadge: 'Audit: #VER-891',
    triggerTitle: 'Deliverable Approved on Mobile',
    triggerTime: 'Today · 12:43 PM',
    codeSnippet: {
      line1: 'approval: Design System v2.4 (Final)',
      line2: 'signoff: David (Client CEO) via mobile browser',
      line3: 'timestamp: 2026-09-21 12:43:09 UTC · Verified'
    },
    meta: 'Client signed deliverable inside their passcode portal',
    actionBadge: 'Stripe Payment Ready',
    actionTitle: 'Invoice INV-2026-084 ($3,200)',
    recipient: 'To: David (Acme CEO) · frevio.cloud/p/acme',
    greeting: 'Deliverable sign-off recorded. Stripe invoice generated:',
    bullets: [
      'Calculated 21.3 hrs @ $150/hr + fixed fee ($3,200 total)',
      'Pre-linked to Apple Pay, Google Pay & Card checkout in 1 tap',
      'Receipt PDF auto-generated with zero manual math'
    ],
    question: 'Dispatch Stripe payment link to David?',
    buttonText: 'Send Stripe Payment Link',
    successNote: 'Stripe invoice active. 1-click payment link live in portal.'
  },
  {
    id: 'sync',
    tabLabel: 'Deploy & Specs Sync',
    tool: 'Vercel + GitHub',
    toolBadge: 'Tag: v2.0-staging',
    triggerTitle: 'Production Staging Build Live',
    triggerTime: 'Today · 4:15 PM',
    codeSnippet: {
      line1: 'deploy: https://acme-preview.vercel.app (200 OK)',
      line2: 'assets: 4 Figma prototype specs extracted',
      line3: 'verification: zero broken links · staging active'
    },
    meta: 'Webhook fired on successful Vercel staging deployment',
    actionBadge: 'Timeline Update Ready',
    actionTitle: 'Staging Preview & Deliverable Sync',
    recipient: 'To: Acme Stakeholders · frevio.cloud/p/acme',
    greeting: 'New production preview verified. Ready for stakeholder review:',
    bullets: [
      'Live staging preview link attached directly to portal timeline',
      '4 finalized Figma spec files attached with 1-click preview',
      'Pre-configured for client feedback without email ping-pong'
    ],
    question: 'Sync staging build to client portal?',
    buttonText: 'Sync to Client Portal',
    successNote: 'Portal timeline updated. Staging preview online for review.'
  }
]

export function OveradsWorkflowsSection({ signupHref }: { signupHref: string }) {
  const [activeTabId, setActiveTabId] = useState('monday')
  const [approvedTabIds, setApprovedTabIds] = useState<Record<string, boolean>>({})

  const active = SCENARIOS.find((s) => s.id === activeTabId) || SCENARIOS[0]
  const isApproved = Boolean(approvedTabIds[active.id])

  const handleToggleApprove = () => {
    setApprovedTabIds((prev) => ({
      ...prev,
      [active.id]: !prev[active.id]
    }))
  }

  return (
    <section
      id="workflows"
      className="scroll-mt-24 sm:scroll-mt-28 relative w-full py-20 md:py-28 bg-[#090A0F] border-t border-white/[0.08] text-white overflow-hidden"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 space-y-10 sm:space-y-12">

        {/* Section Header */}
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 font-semibold">
            <span className="size-1.5 rounded-full bg-indigo-400" />
            <span>Workflows</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[-0.02em] text-white leading-[1.05]">
            Tell it once. <br className="hidden sm:inline" />
            <span className="font-normal text-slate-400">It runs every week.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            Frevio monitors your desk, drafts updates in your studio voice, and waits for your 1-click yes.
          </p>
        </div>

        {/* ── High-Contrast Scenario Switcher Tabs ── */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#12141e] rounded-full border border-white/[0.08] shadow-lg">
            {SCENARIOS.map((s) => {
              const isSelected = s.id === activeTabId
              const isDone = approvedTabIds[s.id]

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveTabId(s.id)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-md ring-2 ring-white/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{s.tabLabel}</span>
                  {isDone ? (
                    <span className="size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                  ) : isSelected ? (
                    <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── TACTILE DUAL ARTIFACT CARD: Left Event ➔ Right Studio Action ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* ══════════════════════════════════════════════════════════
              LEFT: Real Trigger Event (Terminal / Commit / Spec Card)
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0e1017] text-slate-100 p-6 sm:p-7 border border-white/[0.08] shadow-2xl flex flex-col justify-between relative overflow-hidden">
            
            <div className="space-y-5">
              
              {/* Tool Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                    {active.tool}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {active.triggerTime}
                </span>
              </div>

              {/* Event Title */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Event Triggered
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {active.triggerTitle}
                </h3>
              </div>

              {/* Terminal Code Snippet (Tactile artifact) */}
              <div className="rounded-2xl bg-[#05060a] border border-white/[0.06] p-4 font-mono text-xs space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/[0.06] text-[10px] text-slate-500">
                  <span className="size-2 rounded-full bg-red-500/80" />
                  <span className="size-2 rounded-full bg-yellow-500/80" />
                  <span className="size-2 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-slate-400">{active.toolBadge}</span>
                </div>

                <p className="text-indigo-400 text-[11px] truncate">
                  $ {active.codeSnippet.line1}
                </p>
                <p className="text-emerald-400 text-[11px] truncate">
                  &gt; {active.codeSnippet.line2}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  &gt; {active.codeSnippet.line3}
                </p>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {active.meta}
              </p>

            </div>

            {/* Bottom Pipeline Status */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Automatic trigger</span>
              <span className="text-indigo-400 flex items-center gap-1">
                <Sparkles className="size-3" />
                Drafts in 0.4s
              </span>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT: The Frevio Studio Action Card (The Approval Gate)
             ══════════════════════════════════════════════════════════ */}
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 relative overflow-hidden border-2 ${
            isApproved
              ? 'bg-[#0e1017] text-slate-100 border-emerald-500/80 ring-2 ring-emerald-500/20'
              : 'bg-[#12141e] text-white border-indigo-500/40 ring-2 ring-indigo-500/20'
          }`}>

            {/* Glowing Accent Bar at top of hero card */}
            <div
              aria-hidden="true"
              className={`absolute top-0 inset-x-0 h-1.5 transition-colors ${
                isApproved ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
            />

            <div className="space-y-5">
              
              {/* Top Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {active.actionBadge}
                  </span>
                </div>

                <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  isApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  <span className={`size-1.5 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isApproved ? 'Live in Client Portal' : 'Awaiting Your 1-Click Yes'}
                </span>
              </div>

              {/* Title and Recipient */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400">
                  {active.recipient}
                </span>
                <h3 className="text-lg sm:text-xl font-bold leading-snug text-white">
                  {active.actionTitle}
                </h3>
              </div>

              {/* The Drafted Deliverable View */}
              <div className="rounded-2xl p-4 sm:p-5 space-y-3 text-xs leading-relaxed border bg-[#0e1017] border-white/[0.08] text-slate-300">
                <p className="font-medium text-white">
                  &ldquo;{active.greeting}&rdquo;
                </p>

                <ul className="space-y-2 pt-1">
                  {active.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="text-[13px] text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom 1-Click Action Bar */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {isApproved ? 'Delivered to Client' : active.question}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {isApproved ? 'Status: Active' : 'Human in the loop'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleApprove}
                className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg hover:scale-[1.01] ${
                  isApproved
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-white hover:bg-indigo-600 hover:text-white text-slate-950 shadow-white/10'
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Approved &amp; Published ✓</span>
                  </>
                ) : (
                  <>
                    <span>{active.buttonText}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>{isApproved ? active.successNote : 'Nothing sends automatically without your yes'}</span>
                {isApproved && (
                  <button
                    type="button"
                    onClick={handleToggleApprove}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* 3 Footnote Pillars */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-1 shadow-2xs">
            <h4 className="text-xs font-semibold text-white">Starts by itself</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Triggers on schedules, GitHub commits, or logged milestone hours.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-1 shadow-2xs">
            <h4 className="text-xs font-semibold text-white">Drafted in your voice</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Synthesizes real work into concise, polished client updates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-1 shadow-2xs">
            <h4 className="text-xs font-semibold text-white">You hold the keys</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              100% human-in-the-loop. Nothing dispatches without your 1-click yes.
            </p>
          </div>
        </div>

        {/* Section CTAs */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href={signupHref}
            className="inline-flex items-center gap-2 rounded-full bg-white font-semibold text-slate-950 hover:bg-slate-200 h-11 px-7 text-sm transition-all shadow-md cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="size-4" />
          </Link>
          <a
            href="#screens"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors font-medium"
          >
            <span>See the 3 screens</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>

      </div>
    </section>
  )
}
