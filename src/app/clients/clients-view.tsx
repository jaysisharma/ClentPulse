'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Search, Mail, FolderOpen, ArrowRight, ShieldCheck, ShieldOff, Users, Plus, ChevronRight
} from 'lucide-react'

export type ClientCard = {
  key: string
  name: string
  email: string | null
  hasPortal: boolean
  initials: string
  avatarColor: string
  projectCount: number
  sentUpdates: number
  activeProjects: number
  projects: { id: string; project_name: string; color: string }[]
}

type Filter = 'all' | 'active' | 'portal'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'portal', label: 'Portal Access' },
]

export function ClientsView({ clients }: { clients: ClientCard[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter(c => {
      if (filter === 'active' && c.activeProjects === 0) return false
      if (filter === 'portal' && !c.hasPortal) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        c.projects.some(p => p.project_name.toLowerCase().includes(q))
      )
    })
  }, [clients, query, filter])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status segmented pill */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-1 rounded-full w-fit ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-sm">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap',
                filter === f.key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, emails, or projects…"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 transition-all ring-1 ring-slate-950/5 dark:ring-white/5 font-light"
          />
        </div>
      </div>

      {/* Results Grid */}
      {clients.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-14 px-6 text-center shadow-xs dark:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-slate-900 dark:text-white">Your clients will appear here</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-light">
            Create your first project to add a client and initialize their workspace.
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
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-14 px-6 text-center shadow-xs dark:shadow-sm">
          <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">No clients match</p>
          <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(client => (
            <div
              key={client.key}
              className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs dark:shadow-sm flex flex-col justify-between"
            >
              {/* Identity Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold font-mono flex-shrink-0 shadow-inner"
                      style={{ backgroundColor: client.avatarColor }}
                    >
                      {client.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{client.name}</h3>
                      {client.email ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <span>{client.email}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No email provided</p>
                      )}
                    </div>
                  </div>

                  {/* Portal badge */}
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0',
                    client.hasPortal
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                  )}>
                    {client.hasPortal ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {client.hasPortal ? 'Portal enabled' : 'No portal login'}
                  </span>
                </div>

                {/* Projects pill row */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-2">
                    Linked Projects ({client.projects.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {client.projects.map(p => (
                      <Link
                        key={p.id}
                        href={`/project/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="truncate max-w-[140px]">{p.project_name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{client.activeProjects} active project{client.activeProjects !== 1 ? 's' : ''}</span>
                <span>{client.sentUpdates} update{client.sentUpdates !== 1 ? 's' : ''} sent</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
