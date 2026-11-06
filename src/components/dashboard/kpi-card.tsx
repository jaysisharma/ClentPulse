import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CARD, TONES, type Tone } from './styles'

// Smooth area sparkline drawn from raw values; flat when there is no signal.
function Sparkline({ id, values, color }: { id: string; values: number[]; color: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => ({
    x: 5 + (i * 90) / Math.max(values.length - 1, 1),
    y: max === min ? 26 : 34 - ((v - min) / span) * 26,
  }))
  const line = pts
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`
      const prev = pts[i - 1]
      const cx = (prev.x + p.x) / 2
      return `C${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
    })
    .join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg className="w-20 h-9 flex-shrink-0" viewBox="0 0 100 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${last.x} 40 L5 40 Z`} fill={`url(#${id})`} />
      <path d={line} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
    </svg>
  )
}

export function KpiCard({
  id,
  label,
  value,
  icon: Icon,
  tone,
  badge,
  badgeTone,
  spark,
  href,
}: {
  id: string
  label: string
  value: React.ReactNode
  icon: React.ElementType
  tone: Tone
  badge?: React.ReactNode
  badgeTone?: Tone
  spark?: number[]
  href: string
}) {
  const t = TONES[tone]
  return (
    <Link
      href={href}
      className={cn(
        CARD,
        'p-4 flex flex-col justify-between min-w-0 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', t.tile)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-2xl sm:text-[27px] font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums truncate">
            {value}
          </div>
          {badge && (
            <span className={cn('inline-flex items-center mt-1 px-1.5 py-px rounded border text-[11px] font-bold max-w-full truncate', TONES[badgeTone ?? tone].pill)}>
              {badge}
            </span>
          )}
        </div>
        {spark && spark.length > 1 && <Sparkline id={`spark-${id}`} values={spark} color={t.stroke} />}
      </div>
    </Link>
  )
}
