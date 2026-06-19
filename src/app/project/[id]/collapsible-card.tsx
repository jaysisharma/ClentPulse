'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}: {
  // A rendered element (e.g. <Flag className="…" />), not a component reference —
  // a server component can't pass a component function across to this client one.
  icon: React.ReactNode
  title: string
  meta?: React.ReactNode
  action?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
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
          <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
          {meta != null && <span className="text-xs text-slate-400 flex-shrink-0">{meta}</span>}
        </button>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {open && <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>}
    </div>
  )
}
