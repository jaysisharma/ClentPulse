'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2, Circle, Plus, Trash2, ClipboardList,
  User, Users,
} from 'lucide-react'
import { CollapsibleCard } from './collapsible-card'

interface ChecklistItem {
  id: string
  title: string
  assigned_to: 'freelancer' | 'client'
  done: boolean
  done_at: string | null
}

const FREELANCER_TEMPLATES = [
  'Send contract for signature',
  'Collect 50% deposit',
  'Set up project folder / repo',
  'Share project brief',
  'Schedule kickoff call',
]

const CLIENT_TEMPLATES = [
  'Sign contract',
  'Pay deposit invoice',
  'Provide brand assets (logo, fonts, colors)',
  'Share login credentials / hosting access',
  'Review and approve project brief',
]

export function KickoffChecklist({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingFor, setAddingFor] = useState<'freelancer' | 'client' | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState<'freelancer' | 'client' | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled || !user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('checklist_items')
        .select('id, title, assigned_to, done, done_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      if (cancelled) return
      setItems((data as ChecklistItem[]) ?? [])
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  async function addItem(title: string, assignedTo: 'freelancer' | 'client') {
    if (!title.trim() || !userId) return
    setSaving(true)
    const res = await fetch('/api/checklist-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, title: title.trim(), assignedTo }),
    })
    const data = await res.json()
    if (res.ok) setItems(prev => [...prev, data as ChecklistItem])
    setNewTitle('')
    setAddingFor(null)
    setShowTemplates(null)
    setSaving(false)
  }

  async function toggle(item: ChecklistItem) {
    await fetch(`/api/checklist-item/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done }),
    })
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, done: !i.done, done_at: !i.done ? new Date().toISOString() : null } : i
    ))
  }

  async function remove(id: string) {
    await fetch('/api/checklist-item', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const myItems     = items.filter(i => i.assigned_to === 'freelancer')
  const clientItems = items.filter(i => i.assigned_to === 'client')
  const totalDone   = items.filter(i => i.done).length
  const total       = items.length
  const allCompleted = total > 0 && totalDone === total

  return (
    <CollapsibleCard
      projectId={projectId}
      hideColumn="hide_kickoff"
      key={loading ? 'loading' : 'loaded'}
      icon={<ClipboardList className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      title="Kickoff Checklist"
      meta={total > 0 ? `${totalDone}/${total} complete` : undefined}
      defaultOpen={loading ? true : !allCompleted}
    >
      <div className="space-y-5">
        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{totalDone === total ? '🎉 All done — ready to start!' : `${total - totalDone} item${total - totalDone !== 1 ? 's' : ''} remaining`}</span>
              <span>{Math.round((totalDone / total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-500 bg-indigo-500"
                style={{ width: `${Math.round((totalDone / total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Your tasks */}
        <Section
          label="Your tasks"
          icon={<User className="w-3.5 h-3.5" />}
          color="indigo"
          items={myItems}
          onToggle={toggle}
          onRemove={remove}
          onAdd={() => { setAddingFor('freelancer'); setShowTemplates(null) }}
          onShowTemplates={() => setShowTemplates(showTemplates === 'freelancer' ? null : 'freelancer')}
          showTemplates={showTemplates === 'freelancer'}
          templates={FREELANCER_TEMPLATES}
          onPickTemplate={t => addItem(t, 'freelancer')}
          adding={addingFor === 'freelancer'}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          onSubmit={() => addItem(newTitle, 'freelancer')}
          onCancel={() => { setAddingFor(null); setNewTitle('') }}
          saving={saving}
          emptyText="Add things you need to do before starting work."
        />

        {/* Client tasks */}
        <Section
          label="Client tasks"
          icon={<Users className="w-3.5 h-3.5" />}
          color="violet"
          items={clientItems}
          onToggle={toggle}
          onRemove={remove}
          onAdd={() => { setAddingFor('client'); setShowTemplates(null) }}
          onShowTemplates={() => setShowTemplates(showTemplates === 'client' ? null : 'client')}
          showTemplates={showTemplates === 'client'}
          templates={CLIENT_TEMPLATES}
          onPickTemplate={t => addItem(t, 'client')}
          adding={addingFor === 'client'}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          onSubmit={() => addItem(newTitle, 'client')}
          onCancel={() => { setAddingFor(null); setNewTitle('') }}
          saving={saving}
          emptyText="Add things the client needs to provide before you start."
        />
      </div>
    </CollapsibleCard>
  )
}

// ── Section sub-component ─────────────────────────────────────────────────────

function Section({
  label, icon, color, items, onToggle, onRemove, onAdd, onShowTemplates,
  showTemplates, templates, onPickTemplate, adding, newTitle, setNewTitle,
  onSubmit, onCancel, saving, emptyText,
}: {
  label: string
  icon: React.ReactNode
  color: 'indigo' | 'violet'
  items: ChecklistItem[]
  onToggle: (i: ChecklistItem) => void
  onRemove: (id: string) => void
  onAdd: () => void
  onShowTemplates: () => void
  showTemplates: boolean
  templates: string[]
  onPickTemplate: (t: string) => void
  adding: boolean
  newTitle: string
  setNewTitle: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  saving: boolean
  emptyText: string
}) {
  const accent = color === 'indigo' ? 'text-indigo-600 bg-indigo-50' : 'text-violet-600 bg-violet-50'
  const ring   = color === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-violet-500'
  const doneColor = color === 'indigo' ? '#6366F1' : '#8B5CF6'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${accent}`}>
          {icon}
          {label}
          {items.length > 0 && (
            <span className="opacity-60">· {items.filter(i => i.done).length}/{items.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowTemplates}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Templates
          </button>
          <button
            onClick={onAdd}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />Add
          </button>
        </div>
      </div>

      {/* Template pills */}
      {showTemplates && (
        <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
          {templates.map(t => (
            <button
              key={t}
              onClick={() => onPickTemplate(t)}
              className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-full px-2.5 py-1 hover:border-indigo-300 hover:text-indigo-700 transition-colors text-left"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {items.length === 0 && !adding ? (
          <p className="text-xs text-slate-400 py-1 italic">{emptyText}</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 group">
              <button onClick={() => onToggle(item)} className="flex-shrink-0">
                {item.done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: doneColor }} />
                  : <Circle className="w-4 h-4 text-slate-300 hover:text-slate-400 transition-colors" />
                }
              </button>
              <span className={`flex-1 text-sm min-w-0 ${item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {item.title}
              </span>
              {item.done_at && (
                <span className="text-[10px] text-slate-300 flex-shrink-0 hidden group-hover:block">
                  {new Date(item.done_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}

        {/* Inline add form */}
        {adding && (
          <div className="flex gap-2 mt-2">
            <input
              autoFocus
              className={`flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${ring} focus:bg-white dark:focus:bg-slate-800  transition-colors`}
              placeholder="Task description…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit()
                if (e.key === 'Escape') onCancel()
              }}
            />
            <button
              onClick={onSubmit}
              disabled={!newTitle.trim() || saving}
              className="px-3 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
