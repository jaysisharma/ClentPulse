'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, Send, ChevronRight } from 'lucide-react'

interface Update { id: string; sent_at: string | null }
interface Approval { id: string; status: string }
interface Contract { id: string; signed_at: string | null }
interface Milestone { id: string; done: boolean }
interface Invoice { items: { amount: number }[] }
export interface Project {
  id: string
  project_name: string
  client_name: string
  color: string
  status: string
  budget: string | null
  created_at: string
  updates: Update[]
  approvals: Approval[]
  contracts: Contract[]
  milestones: Milestone[]
  invoices: Invoice[]
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function daysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

type Health =
  | { tone: 'danger'; label: string }
  | { tone: 'warn'; label: string }
  | { tone: 'ok'; label: string }
  | { tone: 'idle'; label: string }

const HEALTH_STYLE: Record<Health['tone'], string> = {
  danger: 'bg-rose-50 text-rose-700 border-rose-100',
  warn: 'bg-amber-50 text-amber-700 border-amber-100',
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  idle: 'bg-slate-50 text-slate-500 border-slate-200/70',
}

const STATUSES = ['all', 'active', 'paused', 'completed'] as const
type StatusKey = (typeof STATUSES)[number]

export function ProjectsList({ projects }: { projects: Project[] }) {
  const cutoff7d = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d }, [])

  const enriched = useMemo(() => projects.map(p => {
    const sent     = (p.updates ?? []).filter(u => u.sent_at)
    const latest   = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    const lastDate = latest ? new Date(latest.sent_at!) : new Date(p.created_at)
    const isActive = p.status === 'active'
    const isOverdue = isActive && lastDate < cutoff7d
    const pending  = (p.approvals ?? []).filter(a => a.status === 'pending').length
    const unsigned = (p.contracts ?? []).filter(c => !c.signed_at).length
    const needsAttention = isOverdue || pending > 0 || unsigned > 0

    const budgetVal = p.budget ? parseFloat(p.budget) : 0
    const invoiced  = (p.invoices ?? []).flatMap(i => i.items ?? []).reduce((s, it) => s + (it.amount ?? 0), 0)
    const pct = budgetVal > 0 ? Math.min((invoiced / budgetVal) * 100, 100) : 0

    // One pill, most pressing signal first.
    const health: Health =
      isOverdue ? { tone: 'danger', label: `No update · ${daysAgo(latest?.sent_at ?? p.created_at)}d` }
      : unsigned > 0 ? { tone: 'warn', label: 'Contract unsigned' }
      : pending > 0 ? { tone: 'warn', label: `${pending} approval${pending > 1 ? 's' : ''} pending` }
      : isActive ? { tone: 'ok', label: 'On track' }
      : { tone: 'idle', label: p.status }

    return { ...p, sent, latest, needsAttention, budgetVal, invoiced, pct, health }
  }), [projects, cutoff7d])

  const counts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }), [projects])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusKey>(counts.active > 0 ? 'active' : 'all')

  const filtered = useMemo(() => enriched.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch = p.project_name.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q)
    const matchesStatus = status === 'all' || p.status === status
    return matchesSearch && matchesStatus
  }), [enriched, search, status])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {projects.length >= 8 && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects or clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
            />
          </div>
        )}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 p-1 rounded-lg w-fit">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                status === s ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              {s}
              {counts[s] > 0 && (
                <span className={`ml-1.5 text-[10px] font-semibold ${status === s ? 'text-indigo-600' : 'text-slate-400'}`}>{counts[s]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500 font-medium">No projects match your filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Column headers (desktop only) */}
          <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_1.3fr_1.6fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Project</span>
            <span>Health</span>
            <span>Budget</span>
            <span>Last activity</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map(p => (
              <div
                key={p.id}
                className="md:grid md:grid-cols-[minmax(0,2.2fr)_1.3fr_1.6fr_1fr_auto] md:items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors flex flex-col"
              >
                {/* Project */}
                <Link href={`/project/${p.id}`} className="flex items-center gap-3 min-w-0 group">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{p.project_name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.client_name}</p>
                  </div>
                </Link>

                {/* Health */}
                <div className="mt-2 md:mt-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${HEALTH_STYLE[p.health.tone]}`}>
                    {p.health.tone === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {p.health.label}
                  </span>
                </div>

                {/* Budget */}
                <div className="mt-3 md:mt-0">
                  {p.budgetVal > 0 ? (
                    <div className="max-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-medium">
                        <span className="font-bold text-slate-700 tabular-nums">{fmt$(p.invoiced)}</span>
                        <span className="text-slate-400 tabular-nums">/ {fmt$(p.budgetVal)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.round(p.pct)}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">No budget</span>
                  )}
                </div>

                {/* Last activity */}
                <div className="mt-2 md:mt-0 text-xs text-slate-500 font-medium">
                  {p.latest ? `Updated ${formatDate(p.latest.sent_at!)}` : 'No updates yet'}
                </div>

                {/* Action */}
                <div className="mt-3 md:mt-0 flex items-center gap-2 md:justify-end">
                  <Link
                    href={`/project/${p.id}/update`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Send update
                  </Link>
                  <Link href={`/project/${p.id}`} className="text-slate-300 hover:text-slate-500 transition-colors hidden md:block">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
