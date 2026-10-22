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
    title: 'Deliverable briefs & updates',
    frevio: { text: 'Automated client summaries', status: 'yes' },
    stack: { text: 'Another subscription', status: 'partial' },
    traditional: { text: 'Manual emails', status: 'no' },
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
    frevio: { text: 'Itemized invoices & receipts', status: 'yes' },
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
    title: 'Active projects & clients',
    frevio: { text: '2 Free, Pro for unlimited', status: 'yes' },
    stack: { text: 'Per-seat pricing', status: 'partial' },
    traditional: { text: 'Manual friction', status: 'partial' },
  },
  {
    id: '07',
    title: 'Pricing model',
    frevio: { text: '$0 Free / $19/mo Pro', status: 'yes' },
    stack: { text: '~$180/mo combined', status: 'partial' },
    traditional: { text: 'Lost hours & late fees', status: 'no' },
  },
]

export function OveradsComparisonTable() {
  return (
    <section id="comparison" className="space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
          Everything in one place.
        </h2>
        <p className="text-ink-muted text-base font-light">
          Zero scattered subscriptions. Free forever for up to 2 active client projects.
        </p>
      </div>

      {/* Desktop Comparison Table */}
      <div className="relative hidden overflow-hidden rounded-2xl bg-surface border border-line md:block shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        {/* Header Row */}
        <div className="grid items-end gap-x-2 border-b border-line px-4 pb-5 pt-6 md:px-6 grid-cols-[3rem_1.6fr_repeat(3,1fr)] bg-sunken">
          <div aria-hidden="true" />
          <div className="text-[11px] uppercase tracking-wider font-mono text-ink-muted font-semibold">Key capabilities</div>
          <div className="flex items-center justify-center">
            <span className="inline-flex h-8 items-center gap-2 rounded-lg bg-accent text-on-accent font-bold px-4 text-xs font-mono shadow-sm">
              Frevio
            </span>
          </div>
          <div className="px-2 text-center text-xs font-mono uppercase tracking-wider text-ink-muted">A stack of tools</div>
          <div className="px-2 text-center text-xs font-mono uppercase tracking-wider text-ink-muted">Traditional way</div>
        </div>

        {/* Table Data Rows */}
        <div>
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.id}
              className="grid items-stretch gap-x-2 border-b border-line px-4 transition-colors last:border-b-0 hover:bg-sunken/60 md:px-6 grid-cols-[3rem_1.6fr_repeat(3,1fr)]"
            >
              <div className="flex items-center justify-end py-5 text-right font-mono text-xs tabular-nums text-ink-muted">
                {row.id}
              </div>
              <div className="flex items-center py-5 text-sm leading-snug text-ink font-medium">
                {row.title}
              </div>

              {/* Frevio Column (Featured with warm background) */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center bg-sunken/70 border-x border-line">
                <Check className="size-4 text-accent-strong" />
                <span className="text-xs font-semibold text-ink">{row.frevio.text}</span>
              </div>

              {/* Stack of Tools Column */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center text-ink-muted">
                {row.stack.status === 'partial' ? (
                  <Minus className="size-4 text-ink-muted" />
                ) : (
                  <X className="size-4 text-rose-500" />
                )}
                <span className="text-xs text-ink-muted">{row.stack.text}</span>
              </div>

              {/* Traditional Freelancing Column */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center text-ink-muted">
                {row.traditional.status === 'no' ? (
                  <X className="size-4 text-rose-500" />
                ) : (
                  <Minus className="size-4 text-ink-muted" />
                )}
                <span className="text-xs text-ink-muted">{row.traditional.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View Cards */}
      <div className="space-y-4 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <div key={row.id} className="overflow-hidden rounded-2xl bg-surface border border-line p-5 space-y-3 shadow-sm">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11px] tabular-nums text-accent-strong font-bold">{row.id}</span>
              <h3 className="text-sm font-semibold text-ink">{row.title}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl p-3 bg-sunken border border-line">
                <Check className="size-4 text-accent-strong flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-accent-strong font-bold">Frevio</div>
                  <div className="text-xs font-semibold text-ink">{row.frevio.text}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl p-3 bg-canvas border border-line text-ink-muted">
                <Minus className="size-4 text-ink-muted flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-ink-muted">A stack of tools</div>
                  <div className="text-xs text-ink-muted">{row.stack.text}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl p-3 bg-canvas border border-line text-ink-muted">
                <X className="size-4 text-rose-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-ink-muted">Traditional way</div>
                  <div className="text-xs text-ink-muted">{row.traditional.text}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
