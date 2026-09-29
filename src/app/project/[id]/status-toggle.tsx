'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, Globe, X, ExternalLink } from 'lucide-react'
import { updateProjectLiveUrl } from '@/lib/portfolio-autofill'

const OPTIONS = ['active', 'paused', 'completed'] as const
type Status = typeof OPTIONS[number]

const STYLES: Record<Status, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  completed: 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10',
}

export function StatusToggle({
  projectId,
  current,
  initialLiveUrl = '',
}: {
  projectId: string
  current: Status
  initialLiveUrl?: string
}) {
  const [status, setStatus] = useState<Status>(current)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [enteredLiveUrl, setEnteredLiveUrl] = useState(initialLiveUrl)
  const router = useRouter()

  async function handleStatusChange(next: Status) {
    if (next === status) { setOpen(false); return }
    setOpen(false)

    // When marking completed, prompt to add live website/app link and showcase in portfolio
    if (next === 'completed') {
      setShowCompleteModal(true)
      return
    }

    setSaving(true)
    const supabase = createClient()
    await supabase.from('projects').update({ status: next }).eq('id', projectId)
    setStatus(next)
    setSaving(false)
    router.refresh()
  }

  async function finishProject(urlToSave: string, andShowcase: boolean) {
    setSaving(true)
    const supabase = createClient()
    
    // Save live URL to project if provided
    if (urlToSave.trim()) {
      await updateProjectLiveUrl(supabase, projectId, urlToSave.trim())
    }

    // Update status to completed
    await supabase.from('projects').update({ status: 'completed' }).eq('id', projectId)
    setStatus('completed')
    setSaving(false)
    setShowCompleteModal(false)

    if (andShowcase) {
      router.push(`/portfolio/item/new?projectId=${projectId}`)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors shadow-xs ${STYLES[status]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {saving ? 'Saving…' : status.charAt(0).toUpperCase() + status.slice(1)}
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-full mt-1.5 z-20 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl ring-1 ring-slate-950/5 dark:ring-white/5 py-1.5 min-w-[150px] animate-fade-in backdrop-blur-md">
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleStatusChange(opt)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${opt === status ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt === 'active' ? 'bg-emerald-500' : opt === 'paused' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  {opt === status && <svg className="ml-auto w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Completion Modal: Prompt for Website/App link & Portfolio showcase */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Project Finished!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                  Link the live website or app to showcase your work.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Live Website or App URL <span className="font-normal lowercase text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  value={enteredLiveUrl}
                  onChange={e => setEnteredLiveUrl(e.target.value)}
                  placeholder="https://example.com or https://apps.apple.com/..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5 leading-relaxed">
                Adding your website or mobile app link allows Frevio to automatically take live snapshots and feature it in your public portfolio showroom.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => finishProject(enteredLiveUrl, true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Showcase on Portfolio</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => finishProject(enteredLiveUrl, false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-semibold py-2 text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                <span>Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
