'use client'

import { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { FrevioDashboard } from './frevio-dashboard'

const ACCENT = '#6C4CFD'

const HIGHLIGHTS = [
  'One calm dashboard for every client and project',
  'Automatic branded update emails — no manual reports',
  'Invoices, files, and progress all in one portal',
]

// An honest "see it in action" peek — opens the real product mockup in a modal.
// No fake video; just the actual UI with a few highlights.
export function DemoButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-fade-in relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-[#0B0B12] p-5 sm:p-7">
              <FrevioDashboard />
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-900">This is what your clients (and you) get</h3>
              <ul className="mt-4 space-y-3">
                {HIGHLIGHTS.map(h => (
                  <li key={h} className="flex items-center gap-3 text-[15px] text-slate-600">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}1A` }}>
                      <Check className="h-3 w-3" style={{ color: ACCENT }} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
              <a
                href="/auth/login?mode=signup"
                className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: ACCENT }}
              >
                Start free — set up your first client
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
