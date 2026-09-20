'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ClipboardList, User, Users } from 'lucide-react'

interface Item {
  id: string
  title: string
  assigned_to: 'freelancer' | 'client'
  done: boolean
  done_at: string | null
}

export function ClientChecklist({
  items: initial,
  accentColor,
}: {
  items: Item[]
  accentColor: string
}) {
  const [items, setItems] = useState<Item[]>(initial)

  async function toggleClientItem(item: Item) {
    if (item.assigned_to !== 'client') return
    const next = !item.done
    setItems(prev =>
      prev.map(i => i.id === item.id
        ? { ...i, done: next, done_at: next ? new Date().toISOString() : null }
        : i
      )
    )
    await fetch(`/api/checklist-item/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: next }),
    })
  }

  const myItems     = items.filter(i => i.assigned_to === 'freelancer')
  const clientItems = items.filter(i => i.assigned_to === 'client')
  const totalDone   = items.filter(i => i.done).length
  const total       = items.length

  if (total === 0) return null

  const allDone = totalDone === total

  return (
    <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xs dark:shadow-none overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="font-semibold text-slate-900 dark:text-white text-sm">Project Deliverable Checklist</span>
        </div>
        {allDone ? (
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            ✓ All completed
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{totalDone}/{total} complete</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((totalDone / total) * 100)}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Freelancer side — read-only */}
        {myItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full w-fit mb-2.5">
              <User className="w-3.5 h-3.5" />
              Studio Tasks
            </div>
            <div className="space-y-2">
              {myItems.map(item => (
                <div key={item.id} className="flex items-center gap-2.5">
                  {item.done
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                    : <Circle className="w-4 h-4 flex-shrink-0 text-slate-300 dark:text-slate-600" />
                  }
                  <span className={`text-xs sm:text-sm ${item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client side — interactive */}
        {clientItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full w-fit mb-2.5">
              <Users className="w-3.5 h-3.5" />
              Client Tasks
              <span className="opacity-60 font-normal">· tap to check off</span>
            </div>
            <div className="space-y-2">
              {clientItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleClientItem(item)}
                  className="w-full flex items-center gap-2.5 text-left group py-1"
                >
                  {item.done
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 transition-colors" style={{ color: accentColor }} />
                    : <Circle className="w-4 h-4 flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
                  }
                  <span className={`text-xs sm:text-sm transition-colors ${
                    item.done
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {item.title}
                  </span>
                  {item.done && item.done_at && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-auto flex-shrink-0">
                      {new Date(item.done_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Check off items as you complete them — your studio team will be notified in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
