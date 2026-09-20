'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const OPTIONS = ['active', 'paused', 'completed'] as const
type Status = typeof OPTIONS[number]

const STYLES: Record<Status, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  completed: 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10',
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
                onClick={() => change(opt)}
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
  )
}
