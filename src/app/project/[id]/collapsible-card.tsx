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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl overflow-hidden">
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
          {meta != null && <span className="text-xs text-slate-400 flex-shrink-0">{meta}</span>}
        </button>
        <div className="flex items-center gap-2">
          {action && <div className="flex-shrink-0">{action}</div>}
          {projectId && hideColumn && (
            <button
              onClick={handleHide}
              disabled={hiding}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:bg-slate-800 disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              {hiding ? 'Hiding…' : 'Hide'}
            </button>
          )}
        </div>
      </div>
      {open && <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">{children}</div>}
    </div>
  )
}
