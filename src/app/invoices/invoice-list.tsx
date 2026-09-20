'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, FileText, ArrowRight, AlertCircle, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LineItem { amount: number }
interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  status: string
  due_date: string | null
  items: LineItem[]
}

const STATUS_STYLES: Record<string, string> = {
  draft:   'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10',
  sent:    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  paid:    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  overdue: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
}

const FILTERS = ['all', 'draft', 'sent', 'overdue', 'paid'] as const
type Filter = typeof FILTERS[number]

function isOverdue(inv: Invoice) {
  if (inv.status === 'paid' || !inv.due_date) return false
  return new Date(inv.due_date) < new Date(new Date().toDateString())
}

function total(inv: Invoice) {
  return (inv.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: invoices.length, draft: 0, sent: 0, overdue: 0, paid: 0 }
    for (const inv of invoices) {
      if (isOverdue(inv)) c.overdue++
      else c[inv.status as Filter] = (c[inv.status as Filter] ?? 0) + 1
    }
    return c
  }, [invoices])

  const visible = useMemo(() => {
    let list = invoices
    if (filter !== 'all') {
      list = list.filter(inv =>
        filter === 'overdue' ? isOverdue(inv) : inv.status === filter && !isOverdue(inv)
      )
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(inv =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q)
      )
    }
    return list
  }, [invoices, filter, query])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Status segmented pill */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-1 rounded-full w-fit ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-sm overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap',
                filter === f
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5',
              )}
            >
              {f}
              {counts[f] > 0 && (
                <span className={cn(
                  'ml-1.5 text-[10px] font-mono',
                  filter === f ? 'text-slate-200 dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'
                )}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by invoice # or client…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 transition-all ring-1 ring-slate-950/5 dark:ring-white/5 font-light"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-12 text-center shadow-xs dark:shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No invoices match your filter or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-sm overflow-hidden">
          {/* Column headers (desktop only) */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1.5fr_1.2fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-white/5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            <span>Invoice & Client</span>
            <span>Status</span>
            <span>Due Date</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {visible.map(inv => {
              const overdue = isOverdue(inv)
              const statusKey = overdue ? 'overdue' : inv.status
              const amount = total(inv)

              return (
                <div
                  key={inv.id}
                  className="md:grid md:grid-cols-[minmax(0,2fr)_1.5fr_1.2fr_1fr_auto] md:items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col group"
                >
                  {/* Invoice # and Client */}
                  <Link href={`/invoices/${inv.id}`} className="min-w-0">
                    <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {inv.invoice_number}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {inv.client_name}
                    </p>
                  </Link>

                  {/* Status Badge */}
                  <div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider',
                      STATUS_STYLES[statusKey] ?? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    )}>
                      {statusKey === 'paid' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {statusKey === 'overdue' && <AlertCircle className="w-3 h-3" />}
                      {statusKey}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {inv.due_date ? (
                      <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}>
                        {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-mono">No due date</span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-sm font-light font-mono text-slate-900 dark:text-white text-right">
                    {fmt(amount)}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
