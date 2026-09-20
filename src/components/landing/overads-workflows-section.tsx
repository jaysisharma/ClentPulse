'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'

interface WorkflowTab {
  id: string
  title: string
  whenTitle: string
  whenSub: string
  do1Title: string
  do1Sub: string
  do2Title: string
  do2Sub: string
  watchNote: string
  checkNote: string
  suggestNote: string
}

const WORKFLOWS: WorkflowTab[] = [
  {
    id: 'guard',
    title: 'Guard my milestones',
    whenTitle: 'Hours reach 16.5 billable',
    whenSub: 'Milestone 2 threshold crossed',
    do1Title: 'Propose milestone deliverable review',
    do1Sub: 'Waits for your yes',
    do2Title: 'Prepare Stripe invoice & notify client',
    do2Sub: 'Your encrypted portal',
    watchNote: 'Frevio noticed: Acme Rebrand reached 16.5 billable hours. Milestone 2 threshold reached.',
    checkNote: 'All Figma specifications and Git commits finalized for Sprint 4. Not a draft.',
    suggestNote: 'Publish review & issue Milestone 2 invoice for $3,200.00. That secures payment before weekend.',
  },
  {
    id: 'monday',
    title: 'Write my Monday update',
    whenTitle: 'Every Monday at 9:00 AM',
    whenSub: 'Scheduled weekly cadence',
    do1Title: 'Synthesize Git & Figma changes',
    do1Sub: 'AI drafted summary',
    do2Title: 'Publish brief to client portal',
    do2Sub: 'Waits for your yes',
    watchNote: 'Frevio noticed: 14 commits merged and 3 Figma prototypes updated since Friday.',
    checkNote: 'Changes analyzed in your studio brand voice. Key highlights and blockers isolated.',
    suggestNote: 'Send 3-point briefing to Claire at Acme. Shows clear momentum without writing an email.',
  },
  {
    id: 'invoice',
    title: 'Convert hours to invoice',
    whenTitle: 'Milestone marked approved by client',
    whenSub: 'Timestamped sign-off',
    do1Title: 'Calculate logged time & deductions',
    do1Sub: 'Zero manual math',
    do2Title: 'Generate Stripe payment link',
    do2Sub: 'Waits for your yes',
    watchNote: 'Frevio noticed: Client approved Milestone 2: Design Architecture at 12:43 PM.',
    checkNote: 'Exact contract rate ($150/hr × 21.3 hrs + $3,200 fixed fee). Deposit already deducted.',
    suggestNote: 'Dispatch Stripe invoice INV-2026-084. Direct bank settlement in 48 hours.',
  },
  {
    id: 'sync',
    title: 'Sync Figma & GitHub',
    whenTitle: 'New commit tagged `v2.0-release`',
    whenSub: 'Repository event',
    do1Title: 'Attach preview specs & live links',
    do1Sub: 'Extracts release assets',
    do2Title: 'Update live portal timeline',
    do2Sub: 'Waits for your yes',
    watchNote: 'Frevio noticed: Production build deployed to staging environment.',
    checkNote: 'Staging URL verified active. 4 design deliverables linked with zero broken files.',
    suggestNote: 'Post deliverable link directly to client timeline. Ready for stakeholder sign-off.',
  },
]

export function OveradsWorkflowsSection({ signupHref }: { signupHref: string }) {
  const [activeTabId, setActiveTabId] = useState('guard')
  const [approved, setApproved] = useState<boolean | null>(null)

  const active = WORKFLOWS.find((w) => w.id === activeTabId) || WORKFLOWS[0]

  return (
    <section id="workflows" className="relative w-full py-20 md:py-28 bg-[#f8f9fb] border-t border-slate-200/80">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center md:mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            <span>Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-slate-950 leading-[0.98]">
            Tell it once. It does it every week.
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-sm leading-relaxed text-slate-600 md:text-base font-light">
            Client automation in plain English. A dashboard shows you the problem and leaves the work to you. Frevio does the work, then hands it to you to approve. Pick one and watch.
          </p>
        </div>

        {/* Tab Buttons List */}
        <div>
          <div
            role="tablist"
            aria-label="Example workflows"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center"
          >
            {WORKFLOWS.map((w) => {
              const isSelected = w.id === activeTabId
              return (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveTabId(w.id)
                    setApproved(null)
                  }}
                  className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-center text-[13px] font-medium leading-tight transition-all cursor-pointer sm:shrink-0 sm:px-5 sm:text-sm ${
                    isSelected
                      ? 'bg-slate-950 text-white font-semibold shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {w.title}
                </button>
              )
            })}
          </div>

          {/* Workflow Canvas Box (Light Mode Glass Card) */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            {/* Header Title inside card */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 pt-6 md:px-9 md:pt-8 border-b border-slate-200/80 pb-4 bg-white">
              <p className="text-lg font-light tracking-tight text-slate-900 md:text-xl font-mono">
                {active.title}
              </p>
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Automation
              </span>
            </div>

            {/* Dot-grid Connecting Node Flow Track */}
            <div className="border-b border-slate-200/80 bg-slate-50/70 [background-image:radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:18px_18px]">
              <div className="flex items-center justify-between gap-4 px-6 pt-4 md:px-9">
                <p className="text-[11px] uppercase tracking-wider font-mono text-slate-500 font-semibold">How it is built</p>
                <p className="text-[11.5px] text-slate-500 font-mono">Every step is yours to edit</p>
              </div>

              {/* Node diagram */}
              <div className="px-6 pb-6 pt-4 md:px-9">
                <ol className="flex flex-col items-stretch md:flex-row gap-2 md:gap-0">
                  {/* Node 1: WHEN */}
                  <li className="flex-none">
                    <div className="relative w-full shrink-0 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 md:w-[200px] bg-white shadow-2xs">
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white md:left-auto md:top-1/2 md:translate-x-0 md:-translate-y-1/2 -bottom-1.5 md:-right-1.5 md:bottom-auto bg-indigo-600"
                      />
                      <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-bold">When</p>
                      <p className="mt-1 text-[13px] font-medium leading-snug text-slate-900">{active.whenTitle}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{active.whenSub}</p>
                    </div>
                  </li>

                  {/* Connecting Line 1 */}
                  <li className="flex min-w-0 flex-col items-center md:flex-1 md:flex-row">
                    <span
                      aria-hidden="true"
                      className="h-5 w-px shrink-0 md:h-px md:w-auto md:min-w-5 md:flex-1 bg-slate-300"
                    />
                    <div className="relative w-full shrink-0 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 md:w-[210px] bg-white shadow-2xs">
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white md:top-1/2 md:translate-x-0 md:-translate-y-1/2 -top-1.5 md:-left-1.5 bg-indigo-600"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white md:left-auto md:top-1/2 md:translate-x-0 md:-translate-y-1/2 -bottom-1.5 md:-right-1.5 md:bottom-auto bg-indigo-600"
                      />
                      <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-bold">Do</p>
                      <p className="mt-1 text-[13px] font-medium leading-snug text-slate-900">{active.do1Title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{active.do1Sub}</p>
                    </div>
                  </li>

                  {/* Connecting Line 2 */}
                  <li className="flex min-w-0 flex-col items-center md:flex-1 md:flex-row">
                    <span
                      aria-hidden="true"
                      className="h-5 w-px shrink-0 md:h-px md:w-auto md:min-w-5 md:flex-1 bg-slate-300"
                    />
                    <div className="relative w-full shrink-0 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 md:w-[210px] bg-white shadow-2xs">
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full ring-2 ring-white md:top-1/2 md:translate-x-0 md:-translate-y-1/2 -top-1.5 md:-left-1.5 bg-indigo-600"
                      />
                      <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 font-bold">Do</p>
                      <p className="mt-1 text-[13px] font-medium leading-snug text-slate-900">{active.do2Title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{active.do2Sub}</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* "One Run" 3-Column Execution Stage */}
            <div className="px-6 pt-7 md:px-9 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-widest font-mono text-slate-500 font-semibold">One Run Execution</p>
              <span className="text-[11px] font-mono text-slate-500">Step 1 to 3</span>
            </div>

            {/* Step header indicator */}
            <div className="relative mt-4 hidden grid-cols-3 md:grid border-b border-slate-200/80">
              <div className="flex items-start gap-3 px-9 pb-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                  1
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-slate-900">It watches</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    Your code, your Figma files and your hours.
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3 px-9 pb-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                  2
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-slate-900">It does the work</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    Reads what changed and drafts what needs doing.
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-3 px-9 pb-4">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                  3
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-slate-900">You approve</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                    Nothing goes out without your yes.
                  </span>
                </span>
              </div>
            </div>

            {/* Step Cards Grid */}
            <div className="grid gap-x-0 gap-y-6 px-6 pb-6 pt-4 md:grid-cols-3 md:px-0 md:pb-9 md:pt-0">
              {/* Column 1: It watches */}
              <div className="space-y-3 md:min-h-[220px] md:px-9 md:pt-6 md:border-r md:border-slate-200/80">
                <p className="flex items-center gap-2.5 md:hidden">
                  <span className="grid size-5 place-items-center rounded-full text-[10px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                    1
                  </span>
                  <span className="text-[13px] font-medium text-slate-900">It watches</span>
                </p>
                <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200 shadow-2xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-medium text-indigo-600">Frevio noticed</span>
                    <span className="text-[10.5px] tabular-nums font-mono text-slate-400">Mon 9:00</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-snug text-slate-800">{active.watchNote}</p>
                </div>
              </div>

              {/* Column 2: It does the work */}
              <div className="space-y-3 md:min-h-[220px] md:px-9 md:pt-6 md:border-r md:border-slate-200/80">
                <p className="flex items-center gap-2.5 md:hidden">
                  <span className="grid size-5 place-items-center rounded-full text-[10px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                    2
                  </span>
                  <span className="text-[13px] font-medium text-slate-900">It does the work</span>
                </p>
                <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200 shadow-2xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-medium text-slate-500">It verified</span>
                    <span className="text-[10.5px] tabular-nums font-mono text-slate-400">Mon 9:00</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-slate-800">{active.checkNote}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200 shadow-2xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] font-medium text-indigo-600">It suggests</span>
                    <span className="text-[10.5px] tabular-nums font-mono text-slate-400">Mon 9:01</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-slate-800">{active.suggestNote}</p>
                </div>
              </div>

              {/* Column 3: You approve */}
              <div className="space-y-3 md:min-h-[220px] md:px-9 md:pt-6">
                <p className="flex items-center gap-2.5 md:hidden">
                  <span className="grid size-5 place-items-center rounded-full text-[10px] font-semibold tabular-nums bg-slate-100 text-slate-800">
                    3
                  </span>
                  <span className="text-[13px] font-medium text-slate-900">You approve</span>
                </p>
                <div className="rounded-2xl bg-white p-5 shadow-lg border border-indigo-100 ring-1 ring-indigo-500/10 text-slate-950">
                  <p className="text-[14px] font-semibold leading-snug text-slate-900">
                    {approved === true
                      ? 'Approved! Dispatching to client portal...'
                      : approved === false
                      ? 'Skipped for now.'
                      : 'Go ahead with this?'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {approved === true
                      ? 'Client notified and Stripe invoice created.'
                      : 'Nothing updates without your manual confirmation.'}
                  </p>
                  <div className="mt-4 flex min-h-8 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setApproved(true)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        approved === true
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-white hover:bg-slate-800 shadow-xs'
                      }`}
                    >
                      {approved === true ? 'Approved ✓' : 'Yes, do it'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproved(false)}
                      className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Not now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Editorial Value Propositions */}
        <dl className="mt-12 grid gap-x-10 gap-y-6 md:mt-16 md:grid-cols-3">
          <div className="border-t border-slate-200 pt-5">
            <dt className="font-heading text-base font-semibold text-slate-950">Starts by itself</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 font-light">
              On a schedule, when something happens, or the moment milestone hours cross your line.
            </dd>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <dt className="font-heading text-base font-semibold text-slate-950">Knows your whole desk</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 font-light">
              It reads your code commits, your Figma files and your hours. Add a Google Drive folder and it syncs that too.
            </dd>
          </div>
          <div className="border-t border-slate-200 pt-5">
            <dt className="font-heading text-base font-semibold text-slate-950">Yours in a minute</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 font-light">
              Switch on a ready-made template, or describe your own workflow and edit every step.
            </dd>
          </div>
        </dl>

        {/* Section CTAs */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 md:mt-14">
          <Link
            href={signupHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 font-semibold text-white hover:bg-slate-800 h-11 px-7 text-sm transition-all shadow-md cursor-pointer"
          >
            Start free
            <ArrowUpRight className="size-4" />
          </Link>
          <a
            href="#comparison"
            className="inline-flex items-center gap-1.5 text-sm text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950 transition-colors font-medium"
          >
            See how it compares
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
