import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import type { ProjectKpi } from '@/types'

interface KpiSnapshotStripProps {
  kpis: ProjectKpi[] | null | undefined
  accentColor?: string
  className?: string
}

export function KpiSnapshotStrip({ kpis, accentColor = '#6366F1', className = '' }: KpiSnapshotStripProps) {
  if (!kpis || !Array.isArray(kpis) || kpis.length === 0) return null

  // Filter out any completely blank items
  const validKpis = kpis.filter(k => k && k.label?.trim() && k.value?.trim())
  if (validKpis.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Target className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>Performance & Growth Snapshot</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Campaign Metrics</span>
      </div>

      <div className={`grid grid-cols-2 ${validKpis.length >= 4 ? 'lg:grid-cols-4' : validKpis.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3`}>
        {validKpis.map((kpi, idx) => {
          const trend = kpi.trend?.trim()
          let trendType: 'positive' | 'negative' | 'neutral' = 'neutral'
          if (trend) {
            if (trend.startsWith('+') || /up|gain|boost|increase/i.test(trend)) {
              trendType = 'positive'
            } else if (trend.startsWith('-') || /down|drop|loss|decrease/i.test(trend)) {
              trendType = 'negative'
            }
          }

          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-4 shadow-xs dark:shadow-none transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  {kpi.label}
                </span>

                {trend && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                      trendType === 'positive'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : trendType === 'negative'
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {trendType === 'positive' ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : trendType === 'negative' ? (
                      <TrendingDown className="w-2.5 h-2.5" />
                    ) : (
                      <Minus className="w-2.5 h-2.5" />
                    )}
                    <span>{trend}</span>
                  </span>
                )}
              </div>

              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {kpi.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
