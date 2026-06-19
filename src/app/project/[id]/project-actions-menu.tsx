'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MoreHorizontal, NotebookPen, FileSignature, Settings } from 'lucide-react'

export function ProjectActionsMenu({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = [
    { href: `/project/${projectId}/notes`, label: 'Notes', icon: NotebookPen },
    { href: `/project/${projectId}/contract`, label: 'Contract', icon: FileSignature },
    { href: `/project/${projectId}/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
          open ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
        }`}
        title="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-20 animate-fade-in"
        >
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Icon className="w-4 h-4 text-slate-400" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
