'use client'

import Link from 'next/link'
import { DollarSign } from 'lucide-react'

export function BudgetWidget({
  projectId, budget, invoiced, color,
}: {
  projectId: string
  budget: number | null
  invoiced: number
  color: string
}) {
  if (!budget) return null

  const pct  = Math.min((invoiced / budget) * 100, 100)
  const over = invoiced > budget

  return (
    <Link href={`/project/${projectId}/settings`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Budget</span>
        </div>
        <span className={`text-xs font-medium ${over ? 'text-red-600' : 'text-slate-500'}`}>
          ${invoiced.toLocaleString()} / ${budget.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : color }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-slate-400">
        <span>{Math.round(pct)}% invoiced</span>
        {over
          ? <span className="text-red-500 font-medium">+${(invoiced - budget).toLocaleString()} over</span>
          : <span>${(budget - invoiced).toLocaleString()} remaining</span>
        }
      </div>
    </Link>
  )
}
