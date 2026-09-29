/**
 * Project Priority Canvas Helper
 * Manages priority tiers, auto-suggestions, drag & drop state, and multi-tier persistence.
 */

export type PriorityTier = 'p0' | 'p1' | 'p2' | 'p3'

export interface PriorityZoneConfig {
  id: PriorityTier
  label: string
  shortLabel: string
  title: string
  description: string
  color: string
  badgeBg: string
  badgeText: string
  borderColor: string
  glowColor: string
  iconName: 'flame' | 'zap' | 'target' | 'clock'
}

export const PRIORITY_ZONES: Record<PriorityTier, PriorityZoneConfig> = {
  p0: {
    id: 'p0',
    label: 'Critical Focus',
    shortLabel: 'P0',
    title: 'P0 · Critical Focus',
    description: 'Urgent deliverables, active sprint deadlines, or blocked items.',
    color: '#F43F5E',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    iconName: 'flame',
  },
  p1: {
    id: 'p1',
    label: 'Active Momentum',
    shortLabel: 'P1',
    title: 'P1 · Active Momentum',
    description: 'Core ongoing client deliverables, retainers, and key milestones.',
    color: '#6366F1',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-500/30',
    glowColor: 'rgba(99, 102, 241, 0.15)',
    iconName: 'zap',
  },
  p2: {
    id: 'p2',
    label: 'Strategic Queue',
    shortLabel: 'P2',
    title: 'P2 · Strategic Queue',
    description: 'Scheduled next phases, roadmap explorations, and scoped work.',
    color: '#0EA5E9',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/20',
    badgeText: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-200 dark:border-sky-500/30',
    glowColor: 'rgba(14, 165, 233, 0.15)',
    iconName: 'target',
  },
  p3: {
    id: 'p3',
    label: 'Parked & Waiting',
    shortLabel: 'P3',
    title: 'P3 · Parked & Waiting',
    description: 'Awaiting client feedback, deposit, or temporarily paused.',
    color: '#64748B',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeText: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-white/10',
    glowColor: 'rgba(100, 116, 139, 0.15)',
    iconName: 'clock',
  },
}

const STORAGE_PREFIX = 'frevio_project_priority_map'

/**
 * Reads project priority map from localStorage
 */
export function getLocalPriorityMap(workspaceId = 'default'): Record<string, PriorityTier> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${workspaceId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Saves a single project's priority in localStorage and attempts Supabase update
 */
export async function saveProjectPriority(
  supabase: any,
  projectId: string,
  priority: PriorityTier,
  workspaceId = 'default'
): Promise<void> {
  if (!projectId) return

  // 1. Immediately persist to localStorage for zero-latency UI
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalPriorityMap(workspaceId)
      current[projectId] = priority
      localStorage.setItem(`${STORAGE_PREFIX}_${workspaceId}`, JSON.stringify(current))
    } catch (e) {
      console.warn('Failed to save priority to localStorage:', e)
    }
  }

  // 2. Persist to Supabase if column exists
  if (supabase) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ priority })
        .eq('id', projectId)

      if (error && !error.message?.includes('column "priority" does not exist')) {
        console.warn('Supabase priority update notice:', error.message)
      }
    } catch (err) {
      // Non-blocking fallback
    }
  }
}

/**
 * Intelligently suggests priorities for all projects based on their telemetry
 */
export function autoSuggestPriorities(projects: any[]): Record<string, PriorityTier> {
  const suggestions: Record<string, PriorityTier> = {}
  const now = Date.now()
  const cutoff5d = 5 * 86_400_000

  for (const p of projects) {
    const isPaused = p.status === 'paused'
    const isCompleted = p.status === 'completed'
    const pendingApprovals = (p.approvals ?? []).filter((a: any) => a.status === 'pending').length
    const unsignedContracts = (p.contracts ?? []).filter((c: any) => !c.signed_at).length
    const sent = (p.updates ?? []).filter((u: any) => u.sent_at)
    const latest = [...sent].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0]
    const lastActivity = latest ? new Date(latest.sent_at).getTime() : new Date(p.created_at).getTime()
    const isStale = (now - lastActivity) > cutoff5d

    if (isCompleted) {
      suggestions[p.id] = 'p3'
    } else if (isPaused) {
      suggestions[p.id] = 'p3'
    } else if (pendingApprovals > 0 || unsignedContracts > 0 || isStale) {
      suggestions[p.id] = 'p0' // Urgent blocker / deadline
    } else {
      suggestions[p.id] = 'p1' // Standard active momentum
    }
  }

  return suggestions
}
