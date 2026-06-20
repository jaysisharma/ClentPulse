import Link from 'next/link'
import { Clock } from 'lucide-react'

export function HoursWidget({ hours }: { hours: number }) {
  if (!hours) return null

  return (
    <Link href="/time" className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 transition-colors group">
      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white">{hours % 1 === 0 ? hours : hours.toFixed(1)}h logged</div>
        <div className="text-xs text-slate-400">on this project</div>
      </div>
    </Link>
  )
}
