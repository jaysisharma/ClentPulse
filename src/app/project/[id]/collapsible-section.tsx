'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// A section with a clickable header that collapses its body. The title/count and
// an optional right-aligned action (e.g. a "New" button) stay visible when
// collapsed, so the page reads as a tidy list of headers you can open on demand.
export function CollapsibleSection({
  title,
  count,
  action,
  defaultOpen = true,
  children,
  projectId,
  hideColumn,
}: {
  title: string
  count?: number
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="group inline-flex items-center gap-2 -ml-1.5 rounded-lg px-1.5 py-1 hover:bg-slate-100/70 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', open ? '' : '-rotate-90')}
          />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
          {count != null && <span className="text-sm font-medium text-slate-400">{count}</span>}
        </button>
        <div className="flex items-center gap-2">
          {action && <div className="flex-shrink-0">{action}</div>}
          {projectId && hideColumn && (
            <button
              onClick={handleHide}
              disabled={hiding}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md hover:bg-slate-100 disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              {hiding ? 'Hiding…' : 'Hide'}
            </button>
          )}
        </div>
      </div>
      {open && <div className="animate-fade-in">{children}</div>}
    </section>
  )
}
