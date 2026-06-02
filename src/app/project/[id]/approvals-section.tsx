'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, XCircle, Clock, ExternalLink, Trash2 } from 'lucide-react'

interface Approval { id: string; title: string; url: string | null; status: string; feedback: string | null; created_at: string }

const STATUS_UI = {
  pending:           { icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'Pending' },
  approved:          { icon: CheckCircle2,  color: 'text-emerald-600',bg: 'bg-emerald-50',label: 'Approved' },
  changes_requested: { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50',    label: 'Changes requested' },
}

export function ApprovalsSection({ projectId, initialApprovals }: { projectId: string; initialApprovals: Approval[] }) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('approvals').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    setApprovals(data ?? [])
  }, [projectId])

  async function create(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/approvals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, title, url }) })
    setTitle(''); setUrl(''); setShowForm(false); setSaving(false)
    load()
  }

  async function del(id: string) {
    const supabase = createClient()
    await supabase.from('approvals').delete().eq('id', id)
    setApprovals(a => a.filter(x => x.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">Approval requests</h2>
        <button onClick={() => setShowForm(s => !s)} className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          <Plus className="w-4 h-4" />New request
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-indigo-200 p-4 mb-4 space-y-3">
          <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Title (e.g. Homepage mockup v2)" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Deliverable URL (optional)" value={url} onChange={e => setUrl(e.target.value)} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>Create request</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {!approvals.length ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          No approval requests yet. Create one to get client sign-off on deliverables.
        </div>
      ) : (
        <div className="space-y-2">
          {approvals.map(a => {
            const ui = STATUS_UI[a.status as keyof typeof STATUS_UI]
            const Icon = ui.icon
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 group">
                <div className={`mt-0.5 p-1.5 rounded-lg ${ui.bg}`}>
                  <Icon className={`w-4 h-4 ${ui.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm">{a.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium ${ui.color}`}>{ui.label}</span>
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline">
                        <ExternalLink className="w-3 h-3" />View deliverable
                      </a>
                    )}
                  </div>
                  {a.feedback && <p className="text-xs text-slate-500 mt-1 italic">{a.feedback}</p>}
                </div>
                <button onClick={() => del(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
