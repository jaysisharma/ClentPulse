'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Circle, Plus, Trash2, Flag } from 'lucide-react'
import { CollapsibleCard } from './collapsible-card'

interface Milestone {
  id: string
  title: string
  due_date: string | null
  done: boolean
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(m: Milestone) {
  return !m.done && !!m.due_date && new Date(m.due_date) < new Date(new Date().toDateString())
}

export function MilestonesWidget({
  projectId,
  color,
  initialMilestones,
  defaultOpen = initialMilestones.length > 0,
}: {
  projectId: string
  color: string
  initialMilestones: Milestone[]
  defaultOpen?: boolean
}) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [userId, setUserId] = useState('')
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (user) setUserId(user.id)
    })
  }, [])

  async function toggle(m: Milestone) {
    const supabase = createClient()
    await supabase.from('milestones').update({ done: !m.done }).eq('id', m.id)
    setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, done: !m.done } : x))
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('milestones').delete().eq('id', id)
    setMilestones(prev => prev.filter(x => x.id !== id))
  }

  async function addMilestone() {
    if (!newTitle.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('milestones').insert({
      project_id: projectId,
      user_id: userId,
      title: newTitle.trim(),
      due_date: newDate || null,
    }).select('id, title, due_date, done').single()
    if (data) setMilestones(prev => [...prev, data])
    setNewTitle('')
    setNewDate('')
    setAdding(false)
    setSaving(false)
  }

  const done  = milestones.filter(m => m.done).length
  const total = milestones.length

  return (
    <CollapsibleCard
      projectId={projectId}
      hideColumn="hide_milestones"
      defaultOpen={defaultOpen}
      icon={<Flag className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      title="Milestones"
      meta={total > 0 ? `${done}/${total} complete` : undefined}
      action={
        <button
          onClick={() => setAdding(a => !a)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {adding ? 'Cancel' : '+ Add'}
        </button>
      }
    >

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((done / total) * 100)}%`, backgroundColor: color }}
          />
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            placeholder="Milestone title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addMilestone() }}
            autoFocus
          />
          <input
            type="date"
            className="w-36 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <button
            onClick={addMilestone}
            disabled={!newTitle.trim() || saving}
            className="px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: color }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* List */}
      {milestones.length === 0 && !adding ? (
        <p className="text-xs text-slate-400 text-center py-2">No milestones yet. Add one to track key deliverables.</p>
      ) : (
        <div className="space-y-1.5">
          {milestones.map(m => {
            const overdue = isOverdue(m)
            return (
              <div key={m.id} className="flex items-center gap-2.5 group">
                <button onClick={() => toggle(m)} className="flex-shrink-0">
                  {m.done
                    ? <CheckCircle2 className="w-4 h-4" style={{ color }} />
                    : <Circle className={`w-4 h-4 ${overdue ? 'text-red-400' : 'text-slate-300'} hover:text-slate-400 transition-colors`} />
                  }
                </button>
                <span className={`flex-1 text-sm min-w-0 truncate ${m.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {m.title}
                </span>
                {m.due_date && (
                  <span className={`text-xs flex-shrink-0 ${overdue ? 'text-red-500 font-medium' : m.done ? 'text-slate-300' : 'text-slate-400'}`}>
                    {fmtDate(m.due_date)}
                  </span>
                )}
                <button
                  onClick={() => remove(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </CollapsibleCard>
  )
}
