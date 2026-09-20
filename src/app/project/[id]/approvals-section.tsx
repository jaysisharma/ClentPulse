'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Plus, CheckCircle2, XCircle, Clock, ExternalLink, Trash2,
  Globe, Palette, GitPullRequest, FileText, Archive
} from 'lucide-react'
import { CollapsibleSection } from './collapsible-section'
import { ensureExternalProtocol } from '@/lib/utils'

interface Approval {
  id: string
  title: string
  url: string | null
  preview_type?: string | null
  status: string
  feedback: string | null
  created_at: string
}

const PREVIEW_TYPES = [
  { id: 'staging', label: 'Live Staging', icon: Globe },
  { id: 'figma', label: 'Figma Mockup', icon: Palette },
  { id: 'code_pr', label: 'Code PR', icon: GitPullRequest },
  { id: 'document', label: 'Spec Doc', icon: FileText },
  { id: 'asset_zip', label: 'Assets ZIP', icon: Archive },
] as const

const STATUS_UI = {
  pending:           { icon: Clock,         color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20',  label: 'Pending' },
  approved:          { icon: CheckCircle2,  color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-500/10 border border-emerald-500/20',label: 'Approved' },
  changes_requested: { icon: XCircle,       color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500/10 border border-rose-500/20',    label: 'Changes requested' },
}

export function ApprovalsSection({
  projectId,
  initialApprovals,
  defaultOpen = initialApprovals.length > 0,
}: {
  projectId: string
  initialApprovals: Approval[]
  defaultOpen?: boolean
}) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [previewType, setPreviewType] = useState<string>('staging')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('approvals').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    setApprovals(data ?? [])
  }, [projectId])

  async function create(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, title, url, preview_type: previewType }),
    })
    setTitle('')
    setUrl('')
    setPreviewType('staging')
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function del(id: string) {
    const supabase = createClient()
    await supabase.from('approvals').delete().eq('id', id)
    setApprovals(a => a.filter(x => x.id !== id))
  }

  return (
    <CollapsibleSection
      projectId={projectId}
      hideColumn="hide_approvals"
      defaultOpen={defaultOpen}
      title="Approval requests"
      count={approvals.length}
      action={
        <button
          onClick={() => setShowForm(s => !s)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New request</span>
        </button>
      }
    >
      {showForm && (
        <form onSubmit={create} className="bg-white dark:bg-[#0c0d12]/95 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-5 mb-4 space-y-3.5 shadow-xs backdrop-blur-md animate-fade-in">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Request Title</label>
            <input
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-all"
              placeholder="e.g. Homepage Design Prototype v2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Deliverable Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PREVIEW_TYPES.map(t => {
                const Icon = t.icon
                const selected = previewType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPreviewType(t.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                      selected
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Deliverable URL</label>
            <input
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-all font-mono"
              placeholder="https://staging.domain.com or https://figma.com/file/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Creating...' : 'Create request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs transition-colors shadow-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!approvals.length ? (
        <div className="bg-white/60 dark:bg-[#0c0d12]/60 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center text-xs text-slate-500 dark:text-slate-400 ring-1 ring-slate-950/5 dark:ring-white/5">
          No approval requests yet. Create one to get client sign-off on deliverables.
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map(a => {
            const ui = STATUS_UI[a.status as keyof typeof STATUS_UI] || STATUS_UI.pending
            const Icon = ui.icon
            const pType = PREVIEW_TYPES.find(t => t.id === a.preview_type) || PREVIEW_TYPES[0]
            const DeliverableIcon = pType.icon

            return (
              <div key={a.id} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex items-start gap-4 group shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className={`mt-0.5 p-2 rounded-xl ${ui.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${ui.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm leading-relaxed">{a.title}</div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${ui.bg} ${ui.color}`}>
                      {ui.label}
                    </span>
                    {a.preview_type && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        <DeliverableIcon className="w-3 h-3" />
                        {pType.label}
                      </span>
                    )}
                    {a.url && (
                      <a
                        href={ensureExternalProtocol(a.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline transition-colors ml-1"
                      >
                        <ExternalLink className="w-3 h-3" />Open {pType.label}
                      </a>
                    )}
                  </div>
                  {a.feedback && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-3 italic font-light">
                      {a.feedback}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => del(a.id)}
                  aria-label="Delete request"
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </CollapsibleSection>
  )
}
