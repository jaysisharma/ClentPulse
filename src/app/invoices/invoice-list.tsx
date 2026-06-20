'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, FileText, ArrowRight, AlertCircle, X } from 'lucide-react'

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
  draft:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  sent:    'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
  paid:    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  overdue: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
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
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by invoice # or client…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex-shrink-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize whitespace-nowrap ${
                filter === f
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : f}
              {counts[f] > 0 && f !== 'all' && (
                <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  filter === f ? (
                    f === 'overdue' ? 'bg-red-100 text-red-700' :
                    f === 'paid'   ? 'bg-emerald-100 text-emerald-700' :
                    f === 'sent'   ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  ) : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 py-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No invoices match your search.</p>
          {(query || filter !== 'all') && (
            <button
              onClick={() => { setQuery(''); setFilter('all') }}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(inv => {
            const overdue = isOverdue(inv)
            const statusKey = overdue ? 'overdue' : inv.status
            return (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className={`flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl border p-5 hover:shadow-sm transition-all group ${
                  overdue ? 'border-red-200 hover:border-red-300' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${overdue ? 'bg-red-50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {overdue
                    ? <AlertCircle className="w-4 h-4 text-red-500" />
                    : <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white">{inv.invoice_number}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[statusKey]}`}>
                      {overdue ? 'overdue' : inv.status}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{inv.client_name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-slate-900 dark:text-white">{fmt(total(inv))}</div>
                  {inv.due_date && (
                    <div className={`text-xs mt-0.5 ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                      Due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors ml-2" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
