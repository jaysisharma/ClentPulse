import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

// Canonical KPI / overview tile. See DESIGN.md.
//
// Trend colour follows the arrow direction: up → green, down → red, flat → grey.
// `goodWhen` is accepted for back-compat with existing call sites but no longer
// affects the colour.

type TrendDir = 'up' | 'down' | 'flat'
type GoodWhen = 'up' | 'down' | 'neutral'

// Chip colour follows the arrow direction: up is green, down is red, flat is grey.
const CHIP: Record<TrendDir, string> = {
  up: 'bg-emerald-50 text-emerald-700',
  down: 'bg-rose-50 text-rose-700',
  flat: 'bg-slate-100 text-slate-500',
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
        'rounded-xl border p-5 bg-white transition-colors duration-200',
        tone === 'danger' ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      {/* label + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm text-slate-500">{label}</div>
        {Icon && (
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
              tone === 'danger' ? 'bg-rose-100/70 text-rose-500' : 'bg-slate-100 text-slate-400',
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* value */}
      <div className={cn('text-2xl font-bold mt-2 tabular-nums', tone === 'danger' ? 'text-danger' : 'text-slate-900')}>
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
          {caption != null && <span className="text-xs text-slate-400">{caption}</span>}
        </div>
      )}

      {footer != null && <div className="text-xs text-slate-400 mt-1.5">{footer}</div>}
    </div>
  )
}
