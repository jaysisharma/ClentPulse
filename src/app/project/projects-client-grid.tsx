'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Search, Send, ArrowRight, Clock, AlertTriangle, CheckCircle2, FileSignature, DollarSign } from 'lucide-react'

interface Update { id: string; created_at: string; sent_at: string | null }
interface Approval { id: string; status: string }
interface Contract { id: string; signed_at: string | null }
interface Milestone { id: string; done: boolean }
export interface Project {
  id: string
  project_name: string
  client_name: string
  color: string
  status: string
  budget: string | null
  hourly_rate: number | null
  created_at: string
  updates: Update[]
  approvals: Approval[]
  contracts: Contract[]
  milestones: Milestone[]
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function daysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function ProjectsClientGrid({ projects }: { projects: Project[] }) {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')
  const [attentionOnly, setAttentionOnly] = useState(false)

  const cutoff7d = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d
  }, [])

  const enriched = useMemo(() => projects.map(p => {
    const sent       = (p.updates ?? []).filter(u => u.sent_at)
    const latest     = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    const lastDate   = latest ? new Date(latest.sent_at!) : new Date(p.created_at)
    const isOverdue  = p.status === 'active' && lastDate < cutoff7d
    const pendingApprovals  = (p.approvals ?? []).filter(a => a.status === 'pending').length
    const unsignedContracts = (p.contracts ?? []).filter(c => !c.signed_at).length
    const needsAttention    = isOverdue || pendingApprovals > 0 || unsignedContracts > 0
    const milestoneTotal    = (p.milestones ?? []).length
    const milestoneDone     = (p.milestones ?? []).filter(m => m.done).length
    return { ...p, sent, latest, isOverdue, pendingApprovals, unsignedContracts, needsAttention, milestoneTotal, milestoneDone }
  }), [projects, cutoff7d])

  const counts = useMemo(() => ({
    all:       projects.length,
    active:    projects.filter(p => p.status === 'active').length,
    paused:    projects.filter(p => p.status === 'paused').length,
    completed: projects.filter(p => p.status === 'completed').length,
    attention: enriched.filter(p => p.needsAttention).length,
  }), [projects, enriched])

  const filtered = useMemo(() => enriched.filter(p => {
    const matchesSearch  = p.project_name.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus  = statusFilter === 'all' || p.status === statusFilter
    const matchesAttn    = !attentionOnly || p.needsAttention
    return matchesSearch && matchesStatus && matchesAttn
  }), [enriched, search, statusFilter, attentionOnly])

  return (
    <div className="space-y-4">

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
          />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/60 p-1 rounded-lg">
          {(['all', 'active', 'paused', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              {s}
              {counts[s] > 0 && (
                <span className={`ml-1.5 text-[10px] font-semibold ${statusFilter === s ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Needs attention toggle */}
        {counts.attention > 0 && (
          <button
            onClick={() => setAttentionOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              attentionOnly
                ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-950 shadow-sm'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Needs attention
            <span className={`ml-0.5 ${attentionOnly ? 'text-amber-800' : 'text-slate-400'}`}>{counts.attention}</span>
          </button>
        )}
      </div>

      {/* Empty state */}
      {!filtered.length && (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500 font-medium">No projects match your filters.</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(project => {
          const isActive    = project.status === 'active'
          const isCompleted = project.status === 'completed'

          return (
            <div
              key={project.id}
              className={`bg-white rounded-2xl border flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 ${
                isActive    ? 'border-slate-200/80 shadow-sm'
                : isCompleted ? 'border-slate-200/80 shadow-sm opacity-75 hover:opacity-100'
                : 'border-slate-200/80 shadow-sm opacity-85 hover:opacity-100'
              }`}
            >
              {/* Top color strip */}
              <div className="h-[3px] w-full" style={{ backgroundColor: isActive ? project.color : '#cbd5e1' }} />

              {/* Card body */}
              <div className="p-5 flex-1 space-y-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/project/${project.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate">
                      {project.project_name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{project.client_name}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    project.status === 'active'    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : project.status === 'paused'  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-150'
                  }`}>
                    {project.status === 'active' && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />
                    )}
                    {project.status}
                  </span>
                </div>

                {/* Last update + overdue warning */}
                <div className="flex items-center gap-2">
                  {project.isOverdue ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-805 text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1.5 rounded-lg font-medium">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                      No update in {daysAgo(project.latest?.sent_at ?? project.created_at)} days
                    </div>
                  ) : project.latest ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Last update {formatDate(project.latest.sent_at!)}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">No updates sent yet</div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-800">{project.sent.length}</span> updates
                  </div>
                  {project.budget && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-800">{fmt$(parseFloat(project.budget))}</span>
                    </div>
                  )}
                  {project.pendingApprovals > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      {project.pendingApprovals} pending
                    </div>
                  )}
                  {project.unsignedContracts > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                      <FileSignature className="w-3 h-3 text-amber-600" />
                      {project.unsignedContracts} unsigned
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone progress */}
              {project.milestoneTotal > 0 && (
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Milestones</span>
                    <span className="font-bold text-slate-700">{project.milestoneDone}/{project.milestoneTotal}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((project.milestoneDone / project.milestoneTotal) * 100)}%`,
                        backgroundColor: isActive ? project.color : '#a1a1aa',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/project/${project.id}/update`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-slate-400" />
                  Send update
                </Link>
                <Link
                  href={`/project/${project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
