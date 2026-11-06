'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { CARD } from '@/components/dashboard/styles'
import { cn } from '@/lib/utils'
import type { PortalChecklistItem, ScheduleStatus } from './portal-model'
import { SCHEDULE_LABELS } from './portal-model'

// Shared building blocks for the client portal tabs.

export const MUTED = 'text-slate-500 dark:text-slate-400'
export const DIVIDE = 'divide-y divide-[#f1f3f7] dark:divide-white/[0.05]'

export function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function shortDate(d: string) {
  return new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function Section({
  title,
  count,
  action,
  id,
  children,
  className,
  bodyClassName = 'px-5 pb-5',
}: {
  title: string
  count?: number
  action?: React.ReactNode
  id?: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section id={id} aria-label={title} className={cn(CARD, 'overflow-hidden scroll-mt-32', className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {count != null && count > 0 && <CountBadge count={count} />}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function CountBadge({ count, tone = 'amber' }: { count: number; tone?: 'amber' | 'slate' }) {
  return (
    <span className={cn(
      'text-[11px] font-bold px-2 py-0.5 rounded-full border tabular-nums',
      tone === 'amber'
        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/40'
        : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
    )}>
      {count}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, detail }: { icon: React.ElementType; title: string; detail?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-9 h-9 rounded-md bg-slate-50 dark:bg-white/[0.04] border border-[#eaecf2] dark:border-white/[0.08] text-slate-400 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <p className="text-sm">
        <span className="font-semibold">{title}</span>
        {detail && <span className={cn('block sm:inline sm:ml-1', MUTED)}>{detail}</span>}
      </p>
    </div>
  )
}

const SCHEDULE_TONES: Record<ScheduleStatus, { pill: string; dot: string }> = {
  on_track: {
    pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  complete: {
    pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40',
    dot: 'bg-emerald-500',
  },
  late: {
    pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    dot: 'bg-amber-500',
  },
  paused: {
    pill: 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10',
    dot: 'bg-slate-400',
  },
}

export function SchedulePill({ status }: { status: ScheduleStatus }) {
  const tone = SCHEDULE_TONES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold', tone.pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', tone.dot)} />
      {SCHEDULE_LABELS[status]}
    </span>
  )
}

/** One actionable row in "Needs you". */
export function TodoRow({
  icon: Icon,
  tone = 'default',
  accent,
  title,
  detail,
  children,
}: {
  icon: React.ElementType
  tone?: 'default' | 'warning'
  accent: string
  title: React.ReactNode
  detail?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-md border',
      tone === 'warning'
        ? 'border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-amber-500/[0.07]'
        : 'border-[#eaecf2] dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02]'
    )}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span
          className={cn(
            'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0',
            tone === 'warning' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' : 'text-white'
          )}
          style={tone === 'warning' ? undefined : { backgroundColor: accent }}
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold break-words">{title}</p>
          {detail && <p className={cn('text-xs mt-0.5 leading-relaxed', MUTED)}>{detail}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  )
}

export const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 min-h-9 px-4 py-2 rounded-md text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer'
export const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-1.5 min-h-9 px-4 py-2 rounded-md border border-[#eaecf2] dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer'

/** Starts Stripe checkout for an approved change order. */
export function PayChangeOrderButton({
  changeOrderId,
  label,
  accent,
  isDemo = false,
}: {
  changeOrderId: string
  label: string
  accent: string
  isDemo?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pay() {
    if (isDemo) {
      setError('Payments are disabled in the demo.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}/checkout`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      setError(
        data.code === 'STRIPE_CONNECT_INCOMPLETE'
          ? 'Online payment isn’t set up for this project yet. Please arrange payment with your studio.'
          : data.error || 'Could not start the payment. Please try again.'
      )
    } catch {
      setError('Could not start the payment. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5">
      <button type="button" onClick={pay} disabled={loading} className={PRIMARY_BUTTON} style={{ backgroundColor: accent }}>
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
        {label}
      </button>
      {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 max-w-xs sm:text-right">{error}</p>}
    </div>
  )
}

/**
 * Local state seeded from server data. When the server sends a new value (the
 * portal's live refresh), local edits are replaced by it.
 */
export function useSyncedState<T>(initial: T) {
  const [value, setValue] = useState(initial)
  const [synced, setSynced] = useState(initial)
  if (initial !== synced) {
    setSynced(initial)
    setValue(initial)
  }
  return [value, setValue] as const
}

/**
 * Checklist state shared by "Needs you" and the kickoff checklist, so ticking a
 * task in one place updates the other. Resyncs when the server sends new items.
 */
export function useChecklist(initial: PortalChecklistItem[], isDemo = false) {
  const [items, setItems] = useSyncedState(initial)

  /** Optimistically toggles a client task; reverts and resolves false if the save fails. */
  async function toggle(item: PortalChecklistItem): Promise<boolean> {
    if (item.assigned_to !== 'client') return false
    const next = !item.done
    const apply = (done: boolean) =>
      setItems(prev => prev.map(i => (i.id === item.id ? { ...i, done, done_at: done ? new Date().toISOString() : null } : i)))
    apply(next)
    if (isDemo) return true
    const res = await fetch(`/api/checklist-item/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: next }),
    }).catch(() => null)
    if (!res?.ok) {
      apply(!next)
      return false
    }
    return true
  }

  return { items, toggle }
}
