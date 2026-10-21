import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Zap, DollarSign, Activity } from 'lucide-react'
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

  // Pick an appropriate icon based on metric label
  const getKpiIcon = (label: string) => {
    const l = label.toLowerCase()
    if (l.includes('roas') || l.includes('revenue') || l.includes('sales') || l.includes('arr') || l.includes('mrr') || l.includes('$')) {
      return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
    }
    if (l.includes('speed') || l.includes('rate') || l.includes('ctr') || l.includes('boost')) {
      return <Zap className="w-3.5 h-3.5 text-amber-500" />
    }
    if (l.includes('target') || l.includes('goal') || l.includes('kpi')) {
      return <Target className="w-3.5 h-3.5 text-indigo-500" />
    }
    if (l.includes('growth') || l.includes('traffic') || l.includes('user')) {
      return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
    }
    return <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <span>Performance & Campaign Metrics</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Live Telemetry</span>
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
              className="bg-white/80 dark:bg-[#0c0d12]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center flex-shrink-0">
                    {getKpiIcon(kpi.label)}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                    {kpi.label}
                  </span>
                </div>

                {trend && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      trendType === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : trendType === 'negative'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
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

