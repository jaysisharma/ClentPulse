'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, Send, ChevronRight, Plus, FolderPlus } from 'lucide-react'

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
  danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  warn: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  ok: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  idle: 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10',
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
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Status segmented pill */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-1 rounded-full w-fit ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-sm">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                status === s
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              {s}
              {counts[s] > 0 && (
                <span className={`ml-1.5 text-[10px] font-mono ${status === s ? 'text-slate-200 dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'}`}>
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects or clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 transition-all ring-1 ring-slate-950/5 dark:ring-white/5 font-light"
          />
        </div>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-14 px-6 text-center shadow-xs dark:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-slate-900 dark:text-white">No projects yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-light">
            Create your first project to start working with clients in Frevio.
          </p>
          <Link
            href="/project/new"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold px-4 py-2 text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create project</span>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-12 text-center shadow-xs dark:shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No projects match your filter or search query.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-sm overflow-hidden">
          {/* Column headers (desktop only) */}
          <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_1.3fr_1.6fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-white/5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            <span>Project</span>
            <span>Health</span>
            <span>Budget</span>
            <span>Last Activity</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(p => (
              <div
                key={p.id}
                className="md:grid md:grid-cols-[minmax(0,2.2fr)_1.3fr_1.6fr_1fr_auto] md:items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col"
              >
                {/* Project */}
                <Link href={`/project/${p.id}`} className="flex items-center gap-3 min-w-0 group">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{p.project_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.client_name}</p>
                  </div>
                </Link>

                {/* Health */}
                <div className="mt-2 md:mt-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${HEALTH_STYLE[p.health.tone]}`}>
                    {p.health.tone === 'ok' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {p.health.label}
                  </span>
                </div>

                {/* Budget */}
                <div className="mt-3 md:mt-0">
                  {p.budgetVal > 0 ? (
                    <div className="max-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-mono">
                        <span className="text-slate-900 dark:text-white font-medium tabular-nums">{fmt$(p.invoiced)}</span>
                        <span className="text-slate-400 dark:text-slate-500 tabular-nums">/ {fmt$(p.budgetVal)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.round(p.pct)}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">No budget set</span>
                  )}
                </div>

                {/* Last activity */}
                <div className="mt-2 md:mt-0 text-xs text-slate-500 dark:text-slate-400">
                  {p.latest ? `Updated ${formatDate(p.latest.sent_at!)}` : 'No updates yet'}
                </div>

                {/* Action */}
                <div className="mt-3 md:mt-0 flex items-center gap-2 md:justify-end">
                  <Link
                    href={`/project/${p.id}/update`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Send update
                  </Link>
                  <Link href={`/project/${p.id}`} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors hidden md:block">
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
