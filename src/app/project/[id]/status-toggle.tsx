'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const OPTIONS = ['active', 'paused', 'completed'] as const
type Status = typeof OPTIONS[number]

const STYLES: Record<Status, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  paused: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  completed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:bg-slate-800',
}

export function StatusToggle({ projectId, current }: { projectId: string; current: Status }) {
  const [status, setStatus] = useState<Status>(current)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function change(next: Status) {
    if (next === status) { setOpen(false); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('projects').update({ status: next }).eq('id', projectId)
    setStatus(next)
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${STYLES[status]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {saving ? 'Saving…' : status.charAt(0).toUpperCase() + status.slice(1)}
        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-xl shadow-lg py-1 min-w-[140px]">
            {OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => change(opt)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${opt === status ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                <span className={`w-2 h-2 rounded-full ${opt === 'active' ? 'bg-emerald-500' : opt === 'paused' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                {opt === status && <svg className="ml-auto w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
