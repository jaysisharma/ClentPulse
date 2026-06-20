import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

// Canonical KPI / overview tile. See DESIGN.md.
//
// Trend colour follows the arrow direction: up → green, down → red, flat → grey.
// `goodWhen` is accepted for back-compat with existing call sites but no longer
// affects the colour. Theme-driven via Tailwind dark: variants.

type TrendDir = 'up' | 'down' | 'flat'
type GoodWhen = 'up' | 'down' | 'neutral'

// Chip colour follows the arrow direction: up is green, down is red, flat is grey.
const CHIP: Record<TrendDir, string> = {
  up: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  down: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
  flat: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const TREND_ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus } as const

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  trend,
  caption,
  footer,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
  tone?: 'default' | 'danger'
  trend?: { dir: TrendDir; label: string; goodWhen?: GoodWhen }
  caption?: React.ReactNode
  footer?: React.ReactNode
}) {
  const TrendIcon = trend ? TREND_ICON[trend.dir] : null

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-colors duration-200',
        tone === 'danger'
          ? 'bg-white dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:border-rose-300'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700',
      )}
    >
      {/* label + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
        {Icon && (
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
              tone === 'danger'
                ? 'bg-rose-100/70 dark:bg-rose-950/50 text-rose-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* value */}
      <div
        className={cn(
          'text-2xl font-bold mt-2 tabular-nums',
          tone === 'danger' ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white',
        )}
      >
        {value}
      </div>

      {/* trend chip + caption */}
      {(trend || caption != null) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && TrendIcon && (
            <span className={cn('inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums', CHIP[trend.dir])}>
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
              {trend.label}
            </span>
          )}
          {caption != null && <span className="text-xs text-slate-400 dark:text-slate-500">{caption}</span>}
        </div>
      )}

      {footer != null && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{footer}</div>}
    </div>
  )
}
