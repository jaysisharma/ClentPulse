'use client'

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import Link from 'next/link'
import {
  Flame, Zap, Target, Clock, ArrowRight,
  ExternalLink, Send, Sparkles, Globe
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

export interface PriorityCanvasRef {
  triggerAutoPrioritize: () => void
}

export const PriorityCanvas = forwardRef<
  PriorityCanvasRef,
  {
    projects: Project[]
    workspaceId?: string
    searchQuery?: string
    layoutMode?: 'matrix' | 'columns'
  }
>(function PriorityCanvas(
  {
    projects,
    workspaceId = 'default',
    searchQuery = '',
    layoutMode = 'matrix',
  },
  ref
) {
  const [priorityMap, setPriorityMap] = useState<Record<string, PriorityTier>>({})
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<PriorityTier | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Initialize priorities from database project records or localStorage
  useEffect(() => {
    const local = getLocalPriorityMap(workspaceId)
    const initialMap: Record<string, PriorityTier> = { ...local }

    projects.forEach(p => {
      if (p.priority && (p.priority === 'p0' || p.priority === 'p1' || p.priority === 'p2' || p.priority === 'p3')) {
        initialMap[p.id] = p.priority as PriorityTier
      } else if (!initialMap[p.id]) {
        initialMap[p.id] = p.status === 'paused' || p.status === 'completed' ? 'p3' : 'p1'
      }
    })

    setPriorityMap(initialMap)
  }, [projects, workspaceId])

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
    showToast(`Moved ${projName} to ${PRIORITY_ZONES[tier].label}`)
  }

  // Auto-prioritize using heuristics
  function handleAutoPrioritize() {
    const suggestions = autoSuggestPriorities(projects)
    const supabase = createClient()
    setPriorityMap(prev => ({ ...prev, ...suggestions }))
    for (const [pId, tier] of Object.entries(suggestions)) {
      saveProjectPriority(supabase, pId, tier, workspaceId)
    }
    showToast('Priorities optimized by deadlines & client blockers')
  }

  // Expose auto-prioritize to parent toolbar ref
  useImperativeHandle(ref, () => ({
    triggerAutoPrioritize: handleAutoPrioritize,
  }))

  // Enriched projects with metrics
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
        const days = Math.floor((Date.now() - (latest ? new Date(latest.sent_at!).getTime() : new Date(p.created_at).getTime())) / 86_400_000)
        healthLabel = `No update · ${days}d`
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

  // Filtered by search query from toolbar
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return enrichedProjects
    const q = searchQuery.toLowerCase()
    return enrichedProjects.filter(p =>
      p.project_name.toLowerCase().includes(q) ||
      p.client_name.toLowerCase().includes(q)
    )
  }, [enrichedProjects, searchQuery])

  // Group by tier
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
    <div className="space-y-4">
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
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
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
              className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 flex flex-col transition-all min-h-[380px] shadow-2xs ${
                isDropActive ? 'ring-2 ring-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/20 scale-[1.01]' : ''
              }`}
            >
              {/* Zone Header */}
              <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white truncate">
                    {cfg.title}
                  </h3>
                </div>

                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-400">
                  {items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="h-full min-h-[140px] rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-5 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-light">
                      No works in {cfg.shortLabel}
                    </p>
                    <p className="text-[10px] text-slate-400/80 dark:text-slate-600 mt-0.5">
                      Drop projects here
                    </p>
                  </div>
                ) : (
                  items.map(p => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={e => handleDragStart(e, p.id)}
                      className={`group rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c0d12] hover:border-slate-300 dark:hover:border-white/20 p-3.5 transition-all shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing relative ${
                        draggedId === p.id ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Card Header: Color Chip, Name, Client, Compact Tier Selector */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <Link
                              href={`/project/${p.id}`}
                              className="text-xs font-semibold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {p.project_name}
                            </Link>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate pl-4 mt-0.5 font-light">
                            {p.client_name}
                          </p>
                        </div>

                        {/* Minimal Native Tier Selector */}
                        <select
                          value={p.priorityTier}
                          onChange={e => handleSetPriority(p.id, e.target.value as PriorityTier)}
                          className={`appearance-none text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                            PRIORITY_ZONES[p.priorityTier].badgeBg
                          } ${PRIORITY_ZONES[p.priorityTier].badgeText} ${
                            PRIORITY_ZONES[p.priorityTier].borderColor
                          }`}
                          title="Change priority tier"
                        >
                          <option value="p0">P0 · Immediate</option>
                          <option value="p1">P1 · Active</option>
                          <option value="p2">P2 · Queue</option>
                          <option value="p3">P3 · Parked</option>
                        </select>
                      </div>

                      {/* Status & Live Link */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            p.healthTone === 'danger'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                              : p.healthTone === 'warn'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{p.healthLabel}</span>
                        </span>

                        {p.live_url && (
                          <a
                            href={p.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-auto"
                            title={`Open live site/app: ${p.live_url}`}
                          >
                            <Globe className="w-3 h-3" />
                            <span className="font-mono">Live</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}
                      </div>

                      {/* Budget micro-bar if set */}
                      {p.budgetVal && p.budgetVal > 0 ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-1">
                            <span>Billed</span>
                            <span>{Math.round(p.pct ?? 0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                            <div
                              className="h-1 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round(p.pct ?? 0)}%`, backgroundColor: p.color }}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Card Footer: Quick Actions */}
                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/5">
                        <Link
                          href={`/project/${p.id}/update`}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send update</span>
                        </Link>

                        <Link
                          href={`/project/${p.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
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
})
