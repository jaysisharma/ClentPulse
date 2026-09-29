'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Flame, Zap, Target, Clock, ArrowRight,
  ExternalLink, Send, Sparkles, LayoutGrid,
  Columns3, Search, Wand2, Globe, Check,
  AlertTriangle, FileSignature, CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  PriorityTier,
  PRIORITY_ZONES,
  getLocalPriorityMap,
  saveProjectPriority,
  autoSuggestPriorities
} from '@/lib/project-priority'
import type { Project } from '@/app/project/projects-list'

interface EnrichedProject extends Project {
  priorityTier: PriorityTier
  needsAttention?: boolean
  healthLabel?: string
  healthTone?: 'danger' | 'warn' | 'ok' | 'idle'
  budgetVal?: number
  invoiced?: number
  pct?: number
}

const ZONE_ICONS = {
  flame: Flame,
  zap: Zap,
  target: Target,
  clock: Clock,
}

export function PriorityCanvas({
  projects,
  workspaceId = 'default',
}: {
  projects: Project[]
  workspaceId?: string
}) {
  const [priorityMap, setPriorityMap] = useState<Record<string, PriorityTier>>({})
  const [layoutMode, setLayoutMode]   = useState<'matrix' | 'columns'>('matrix')
  const [search, setSearch]           = useState('')
  const [draggedId, setDraggedId]     = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<PriorityTier | null>(null)
  const [toastMessage, setToastMessage]     = useState<string | null>(null)

  // Initialize priorities from database project records or localStorage
  useEffect(() => {
    const local = getLocalPriorityMap(workspaceId)
    const initialMap: Record<string, PriorityTier> = { ...local }

    projects.forEach(p => {
      if (p.priority && (p.priority === 'p0' || p.priority === 'p1' || p.priority === 'p2' || p.priority === 'p3')) {
        initialMap[p.id] = p.priority as PriorityTier
      } else if (!initialMap[p.id]) {
        // Default based on status
        initialMap[p.id] = p.status === 'paused' || p.status === 'completed' ? 'p3' : 'p1'
      }
    })

    setPriorityMap(initialMap)
  }, [projects, workspaceId])

  // Flash toast
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Update a single project's priority
  async function handleSetPriority(projectId: string, tier: PriorityTier) {
    const supabase = createClient()
    setPriorityMap(prev => ({ ...prev, [projectId]: tier }))
    await saveProjectPriority(supabase, projectId, tier, workspaceId)
    const projName = projects.find(p => p.id === projectId)?.project_name || 'Project'
    showToast(`Moved "${projName}" to ${PRIORITY_ZONES[tier].shortLabel}`)
  }

  // Auto-suggest intelligent priorities
  async function handleAutoPrioritize() {
    const suggestions = autoSuggestPriorities(projects)
    setPriorityMap(prev => ({ ...prev, ...suggestions }))
    const supabase = createClient()
    for (const [pId, tier] of Object.entries(suggestions)) {
      saveProjectPriority(supabase, pId, tier, workspaceId)
    }
    showToast('Intelligently sorted projects based on active deadlines & blockers!')
  }

  // Enriched projects with priority and metrics
  const enrichedProjects: EnrichedProject[] = useMemo(() => {
    const cutoff7d = new Date()
    cutoff7d.setDate(cutoff7d.getDate() - 7)

    return projects.map(p => {
      const tier = priorityMap[p.id] || (p.status === 'paused' || p.status === 'completed' ? 'p3' : 'p1')
      const sent = (p.updates ?? []).filter(u => u.sent_at)
      const latest = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
      const lastDate = latest ? new Date(latest.sent_at!) : new Date(p.created_at)
      const isOverdue = p.status === 'active' && lastDate < cutoff7d
      const pending = (p.approvals ?? []).filter(a => a.status === 'pending').length
      const unsigned = (p.contracts ?? []).filter(c => !c.signed_at).length
      const needsAttention = isOverdue || pending > 0 || unsigned > 0

      const budgetVal = p.budget ? parseFloat(p.budget) : 0
      const invoiced = (p.invoices ?? []).flatMap(i => i.items ?? []).reduce((s, it) => s + (it.amount ?? 0), 0)
      const pct = budgetVal > 0 ? Math.min((invoiced / budgetVal) * 100, 100) : 0

      let healthTone: 'danger' | 'warn' | 'ok' | 'idle' = 'ok'
      let healthLabel = 'On track'

      if (isOverdue) {
        healthTone = 'danger'
        healthLabel = 'Update overdue'
      } else if (unsigned > 0) {
        healthTone = 'warn'
        healthLabel = 'Contract unsigned'
      } else if (pending > 0) {
        healthTone = 'warn'
        healthLabel = `${pending} approval${pending > 1 ? 's' : ''} pending`
      } else if (p.status !== 'active') {
        healthTone = 'idle'
        healthLabel = p.status
      }

      return {
        ...p,
        priorityTier: tier,
        needsAttention,
        healthLabel,
        healthTone,
        budgetVal,
        invoiced,
        pct,
      }
    })
  }, [projects, priorityMap])

  // Filtered by search
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return enrichedProjects
    const q = search.toLowerCase()
    return enrichedProjects.filter(p =>
      p.project_name.toLowerCase().includes(q) ||
      p.client_name.toLowerCase().includes(q)
    )
  }, [enrichedProjects, search])

  // Group by priority tier
  const tierBuckets = useMemo(() => {
    const buckets: Record<PriorityTier, EnrichedProject[]> = {
      p0: [],
      p1: [],
      p2: [],
      p3: [],
    }
    filteredProjects.forEach(p => {
      buckets[p.priorityTier].push(p)
    })
    return buckets
  }, [filteredProjects])

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  function handleDragOver(e: React.DragEvent, zone: PriorityTier) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (activeDropZone !== zone) setActiveDropZone(zone)
  }

  function handleDragLeave(e: React.DragEvent, zone: PriorityTier) {
    if (activeDropZone === zone) setActiveDropZone(null)
  }

  function handleDrop(e: React.DragEvent, zone: PriorityTier) {
    e.preventDefault()
    setActiveDropZone(null)
    const id = e.dataTransfer.getData('text/plain') || draggedId
    if (id) {
      handleSetPriority(id, zone)
    }
    setDraggedId(null)
  }

  return (
    <div className="space-y-6">
      {/* Canvas Controls & Workload Telemetry */}
      <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-4 sm:p-5 backdrop-blur-md shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                Priority Matrix & Canvas
                <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Focus Mode
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Drag cards or click P0–P3 pills to prioritize active client delivery.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-Prioritize button */}
            <button
              type="button"
              onClick={handleAutoPrioritize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
              title="Auto-prioritize based on pending approvals, stale updates, and deadlines"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Smart Sort</span>
            </button>

            {/* Layout Switcher (2x2 Matrix vs 4-Column Board) */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setLayoutMode('matrix')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layoutMode === 'matrix'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="2x2 Quadrant Matrix View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('columns')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layoutMode === 'columns'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="4-Column Board View"
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search canvas…"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Priority Distribution Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
          {(['p0', 'p1', 'p2', 'p3'] as PriorityTier[]).map(tier => {
            const cfg = PRIORITY_ZONES[tier]
            const count = tierBuckets[tier].length
            return (
              <div
                key={tier}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-xs"
              >
                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-indigo-500/30 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Priority Canvas Grid / Board */}
      <div
        className={
          layoutMode === 'matrix'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-5'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'
        }
      >
        {(['p0', 'p1', 'p2', 'p3'] as PriorityTier[]).map(tier => {
          const cfg = PRIORITY_ZONES[tier]
          const Icon = ZONE_ICONS[cfg.iconName]
          const items = tierBuckets[tier]
          const isDropActive = activeDropZone === tier

          return (
            <div
              key={tier}
              onDragOver={e => handleDragOver(e, tier)}
              onDragLeave={e => handleDragLeave(e, tier)}
              onDrop={e => handleDrop(e, tier)}
              className={`rounded-2xl border ${cfg.borderColor} bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5 p-4 sm:p-5 flex flex-col transition-all min-h-[360px] backdrop-blur-md shadow-xs ${
                isDropActive ? 'ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 scale-[1.01]' : ''
              }`}
            >
              {/* Quadrant Header */}
              <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg ${cfg.badgeBg} flex items-center justify-center`}
                      style={{ color: cfg.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {cfg.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light line-clamp-1">
                    {cfg.description}
                  </p>
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      No works in {cfg.shortLabel}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-light">
                      Drag project cards here or use the priority selector on any card.
                    </p>
                  </div>
                ) : (
                  items.map(p => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={e => handleDragStart(e, p.id)}
                      className={`rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] p-4 transition-all shadow-2xs hover:shadow-sm cursor-grab active:cursor-grabbing group relative ${
                        draggedId === p.id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Top Bar: Color Chip, Name, & Priority Tier Pills */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <Link href={`/project/${p.id}`} className="min-w-0 flex-1 group/title">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors">
                              {p.project_name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate pl-4">
                            {p.client_name}
                          </p>
                        </Link>

                        {/* Interactive Priority Selector (P0-P3) */}
                        <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-0.5 rounded-lg shadow-2xs">
                          {(['p0', 'p1', 'p2', 'p3'] as PriorityTier[]).map(t => {
                            const isCurrent = p.priorityTier === t
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleSetPriority(p.id, t)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                                  isCurrent
                                    ? `${PRIORITY_ZONES[t].badgeBg} ${PRIORITY_ZONES[t].badgeText} shadow-2xs scale-105`
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                                title={`Set priority to ${PRIORITY_ZONES[t].label}`}
                              >
                                {PRIORITY_ZONES[t].shortLabel}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Health & Live URL */}
                      <div className="flex flex-wrap items-center gap-2 my-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            p.healthTone === 'danger'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                              : p.healthTone === 'warn'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {p.healthLabel}
                        </span>

                        {p.live_url && (
                          <a
                            href={p.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-500/20 hover:underline"
                            title={p.live_url}
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span>Live App</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}
                      </div>

                      {/* Budget Bar if set */}
                      {p.budgetVal && p.budgetVal > 0 ? (
                        <div className="space-y-1 my-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Billed</span>
                            <span>{Math.round(p.pct ?? 0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-1 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round(p.pct ?? 0)}%`, backgroundColor: p.color }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5 mt-2">
                        <Link
                          href={`/project/${p.id}/update`}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                          <Send className="w-3 h-3 text-slate-400" />
                          <span>Update</span>
                        </Link>

                        <div className="flex items-center gap-2">
                          {p.status === 'completed' && (
                            <Link
                              href={`/portfolio/item/new?projectId=${p.id}`}
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Showcase</span>
                            </Link>
                          )}
                          <Link
                            href={`/project/${p.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
