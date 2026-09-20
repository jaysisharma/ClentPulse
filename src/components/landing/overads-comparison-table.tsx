'use client'

import { Check, Minus, X } from 'lucide-react'

interface RowItem {
  id: string
  title: string
  frevio: { text: string; status: 'yes' | 'partial' }
  stack: { text: string; status: 'partial' | 'no' }
  traditional: { text: string; status: 'partial' | 'no' }
}

const COMPARISON_ROWS: RowItem[] = [
  {
    id: '01',
    title: 'Content & deliverable briefs',
    frevio: { text: 'Built-in AI synthesis', status: 'yes' },
    stack: { text: 'Separate AI sub', status: 'partial' },
    traditional: { text: 'Manual typing', status: 'no' },
  },
  {
    id: '02',
    title: 'Encrypted client portal',
    frevio: { text: '1 permanent link', status: 'yes' },
    stack: { text: 'Another login / sub', status: 'partial' },
    traditional: { text: 'Scattered email links', status: 'no' },
  },
  {
    id: '03',
    title: 'Deliverable approvals',
    frevio: { text: '1-click mobile sign-off', status: 'yes' },
    stack: { text: 'Trello / Notion comment', status: 'partial' },
    traditional: { text: 'Vague Slack replies', status: 'no' },
  },
  {
    id: '04',
    title: 'Milestone invoicing',
    frevio: { text: 'Stripe Rails, built-in', status: 'yes' },
    stack: { text: 'Harvest / QuickBooks', status: 'partial' },
    traditional: { text: 'PDF export & chasing', status: 'no' },
  },
  {
    id: '05',
    title: 'Coding & focus presence',
    frevio: { text: 'VS Code pulse extension', status: 'yes' },
    stack: { text: 'Manual timer app', status: 'partial' },
    traditional: { text: 'Guessing hours', status: 'no' },
  },
  {
    id: '06',
    title: 'Client seats & portals',
    frevio: { text: 'Unlimited', status: 'yes' },
    stack: { text: 'Per-seat pricing', status: 'partial' },
    traditional: { text: 'Manual friction', status: 'partial' },
  },
  {
    id: '07',
    title: 'What it costs',
    frevio: { text: 'Free, everything included', status: 'yes' },
    stack: { text: '~$180/mo combined', status: 'partial' },
    traditional: { text: 'Lost hours & late fees', status: 'no' },
  },
]

export function OveradsComparisonTable() {
  return (
    <section id="comparison" className="w-full py-20 md:py-28 relative isolate overflow-hidden bg-[#f8f9fb] border-t border-slate-200/80">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-12 max-w-2xl space-y-4 md:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            <span>Honest comparison</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-slate-950 leading-[0.98]">
            The whole studio’s work, or four tools and chasing
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 md:text-base font-light">
            Every job a modern independent studio does, in one login, free. The same jobs split across point tools bill per seat and never quite talk to each other; traditional freelancing leaves you chasing invoices.
          </p>
        </div>

        {/* Desktop Comparison Table */}
        <div className="relative hidden overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)] md:block">
          {/* Header Row */}
          <div className="grid items-end gap-x-2 border-b border-slate-200 px-4 pb-5 pt-6 md:px-6 grid-cols-[3rem_1.6fr_repeat(3,1fr)] bg-slate-50/70">
            <div aria-hidden="true" />
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-600 font-semibold">Key capabilities</div>
            <div className="flex items-center justify-center">
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-slate-950 text-white font-bold px-4 text-xs font-mono shadow-sm">
                Frevio
              </span>
            </div>
            <div className="px-2 text-center text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">A stack of tools</div>
            <div className="px-2 text-center text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">Traditional way</div>
          </div>

          {/* Table Data Rows */}
          <div>
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.id}
                className="grid items-stretch gap-x-2 border-b border-slate-100 px-4 transition-colors last:border-b-0 hover:bg-slate-50/80 md:px-6 grid-cols-[3rem_1.6fr_repeat(3,1fr)]"
              >
                <div className="flex items-center justify-end py-5 text-right font-mono text-xs tabular-nums text-slate-400">
                  {row.id}
                </div>
                <div className="flex items-center py-5 text-sm leading-snug text-slate-900 font-medium">
                  {row.title}
                </div>

                {/* Frevio Column (Featured with light indigo background) */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center bg-indigo-50/35 border-x border-indigo-100/70">
                  <Check className="size-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-950">{row.frevio.text}</span>
                </div>

                {/* Stack of Tools Column */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center text-slate-600">
                  {row.stack.status === 'partial' ? (
                    <Minus className="size-4 text-slate-400" />
                  ) : (
                    <X className="size-4 text-rose-500" />
                  )}
                  <span className="text-xs text-slate-600">{row.stack.text}</span>
                </div>

                {/* Traditional Freelancing Column */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center text-slate-600">
                  {row.traditional.status === 'no' ? (
                    <X className="size-4 text-rose-500" />
                  ) : (
                    <Minus className="size-4 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-600">{row.traditional.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View Cards */}
        <div className="space-y-4 md:hidden">
          {COMPARISON_ROWS.map((row) => (
            <div key={row.id} className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[11px] tabular-nums text-indigo-600 font-bold">{row.id}</span>
                <h3 className="text-sm font-semibold text-slate-950">{row.title}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl p-3 bg-indigo-50/50 border border-indigo-100">
                  <Check className="size-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-mono text-indigo-600 font-bold">Frevio</div>
                    <div className="text-xs font-semibold text-slate-950">{row.frevio.text}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3 bg-slate-50 border border-slate-200 text-slate-600">
                  <Minus className="size-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500 font-medium">A stack of tools</div>
                    <div className="text-xs text-slate-600">{row.stack.text}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3 bg-slate-50 border border-slate-200 text-slate-600">
                  <X className="size-4 text-rose-500 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500 font-medium">Traditional way</div>
                    <div className="text-xs text-slate-600">{row.traditional.text}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
