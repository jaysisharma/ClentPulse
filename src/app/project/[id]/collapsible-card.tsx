'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Compact collapsible card for the project sidebar. Header (icon + title + a
// small meta value + optional action) stays visible; the body collapses. Matches
// the sidebar card chrome so collapsed and expanded widgets sit consistently.
export function CollapsibleCard({
  icon,
  title,
  meta,
  action,
  defaultOpen = true,
  children,
  projectId,
  hideColumn,
}: {
  // A rendered element (e.g. <Flag className="…" />), not a component reference —
  // a server component can't pass a component function across to this client one.
  icon: React.ReactNode
  title: string
  meta?: React.ReactNode
  action?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  projectId?: string
  hideColumn?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [hiding, setHiding] = useState(false)
  const router = useRouter()

  async function handleHide() {
    if (!projectId || !hideColumn) return
    setHiding(true)
    const supabase = createClient()
    await supabase.from('projects').update({ [hideColumn]: true }).eq('id', projectId)
    window.dispatchEvent(new CustomEvent('section-hidden', { detail: { name: title } }))
    setHiding(false)
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-4 gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="group flex items-center gap-2 min-w-0 cursor-pointer"
        >
          <ChevronDown
            className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0', open ? '' : '-rotate-90')}
          />
          {icon}
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</span>
          {meta != null && <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 font-mono">{meta}</span>}
        </button>
        <div className="flex items-center gap-2">
          {action && <div className="flex-shrink-0">{action}</div>}
          {projectId && hideColumn && (
            <button
              onClick={handleHide}
              disabled={hiding}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              {hiding ? 'Hiding…' : 'Hide'}
            </button>
          )}
        </div>
      </div>
      {open && <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 pt-4">{children}</div>}
    </div>
  )
}
