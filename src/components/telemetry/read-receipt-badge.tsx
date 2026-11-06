'use client'

import { Eye, EyeOff } from 'lucide-react'

interface ReadReceiptBadgeProps {
  lastViewedAt?: string | null
  viewCount?: number | null
  labelPrefix?: string
  className?: string
  showUnopened?: boolean
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0 || isNaN(diffMs)) return 'just now'

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ReadReceiptBadge({
  lastViewedAt,
  viewCount,
  labelPrefix = 'Client viewed',
  className = '',
  showUnopened = true,
}: ReadReceiptBadgeProps) {
  if (!lastViewedAt) {
    if (!showUnopened) return null
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10 ${className}`}
        title="Recipient has not opened this link yet"
      >
        <EyeOff className="w-3 h-3 opacity-60" />
        <span>Unopened</span>
      </span>
    )
  }

  const relativeTime = formatRelativeTime(lastViewedAt)
  const countLabel = viewCount && viewCount > 1 ? ` (${viewCount}x)` : ''

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 ${className}`}
      title={`Opened by recipient ${viewCount ? `${viewCount} times. ` : ''}Last viewed: ${new Date(lastViewedAt).toLocaleString()}`}
    >
      <Eye className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
      <span>{labelPrefix} {relativeTime}{countLabel}</span>
    </span>
  )
}

