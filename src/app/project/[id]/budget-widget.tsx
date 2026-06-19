'use client'

import Link from 'next/link'
import { DollarSign } from 'lucide-react'
import { CollapsibleCard } from './collapsible-card'

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
    <CollapsibleCard
      icon={<DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      title="Budget"
      meta={
        <span className={over ? 'text-red-600 font-medium' : ''}>
          ${invoiced.toLocaleString()} / ${budget.toLocaleString()}
        </span>
      }
      action={
        <Link href={`/project/${projectId}/settings`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          Edit
        </Link>
      }
    >
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
    </CollapsibleCard>
  )
}
