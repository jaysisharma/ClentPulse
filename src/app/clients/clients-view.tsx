'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Search, Mail, FolderOpen, ArrowRight, ShieldCheck, ShieldOff, Users, Plus,
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
  { key: 'portal', label: 'Portal access' },
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
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, emails, or projects…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                filter === f.key ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 py-14 px-6 text-center">
          <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No clients match</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(client => (
            <div
              key={client.key}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col"
            >
              {/* Identity */}
              <div className="flex items-start gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: client.avatarColor }}
                >
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{client.name}</span>
                    {client.activeProjects > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />active
                      </span>
                    )}
                  </div>
                  {client.email ? (
                    <a
                      href={`mailto:${client.email}`}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors mt-0.5 max-w-full"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 mt-0.5 block">No email set</span>
                  )}
                </div>
                {/* Portal status */}
                {client.hasPortal ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">
                    <ShieldCheck className="w-3 h-3" />Portal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full flex-shrink-0">
                    <ShieldOff className="w-3 h-3" />No portal
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-bold tabular-nums">{client.projectCount}</span>
                  project{client.projectCount !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-bold tabular-nums">{client.sentUpdates}</span>
                  update{client.sentUpdates !== 1 ? 's' : ''} sent
                </span>
              </div>

              {/* Projects */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {client.projects.map(p => (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="truncate max-w-[12rem]">{p.project_name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </Link>
                ))}
                <Link
                  href="/project/new"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors px-2 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />Add project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
