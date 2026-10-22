'use client'

import { useEffect, useState } from 'react'
import { Check, FileText, Lock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInView } from './reveal'
import { card, muted, well } from './styles'

/**
 * Coded preview of the client portal. Plays the product story on a loop:
 * approve → milestone done → invoice → paid. Demo data only.
 */

// 0 awaiting · 1 approve pressed · 2 approved · 3 invoice shown · 4 pay pressed · 5 paid
type Phase = 0 | 1 | 2 | 3 | 4 | 5
const LOOP_MS = 8200
const TIMELINE: [Phase, number][] = [
  [1, 1600],
  [2, 2000],
  [3, 2900],
  [4, 4300],
  [5, 4700],
  [0, LOOP_MS],
]

export function PortalPreview() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3)
  const [phase, setPhase] = useState<Phase>(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!inView || paused || reduced) return
    const timers = TIMELINE.map(([p, t]) => setTimeout(() => setPhase(p), t))
    const loop = setInterval(() => {
      TIMELINE.forEach(([p, t]) => timers.push(setTimeout(() => setPhase(p), t)))
    }, LOOP_MS)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(loop)
    }
  }, [inView, paused, reduced])

  const p: Phase = reduced ? 5 : phase
  const approved = p >= 2
  const invoiceShown = p >= 3
  const paid = p >= 5

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(card, 'overflow-hidden shadow-xl')}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className={cn(well, 'mx-auto flex min-w-0 items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs', muted)}>
          <Lock className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">frevio.app/p/northwind-rebrand</span>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className={cn('text-xs', muted)}>Studio Ash · for Northwind Coffee</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">Brand refresh</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out"
                style={{ width: approved ? '78%' : '52%' }}
              />
            </div>
            <span className={cn('w-9 text-right font-mono text-xs tabular-nums', muted)}>{approved ? '78%' : '52%'}</span>
          </div>
        </div>

        {/* Deliverable awaiting approval */}
        <div className={cn(well, 'p-4')}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Logo system, v3</p>
                <p className={cn('text-xs', muted)}>Uploaded 2h ago · 4 files</p>
              </div>
            </div>
            <span
              className={cn(
                'whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-colors duration-300',
                approved
                  ? 'border-positive/20 bg-positive/10 text-positive'
                  : 'border-attention/20 bg-attention/10 text-attention'
              )}
            >
              {approved ? 'Approved' : 'Awaiting you'}
            </span>
          </div>

          <div className="mt-4 h-9">
            {approved ? (
              <p className={cn('flex h-full items-center gap-2 text-sm animate-fade-in', muted)}>
                <Check className="h-4 w-4 text-positive" />
                Approved by Maya · Today, 10:42
              </p>
            ) : (
              <div className="flex gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white transition-transform duration-150',
                    p === 1 && 'scale-95 ring-4 ring-ink/15'
                  )}
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs font-medium">
                  <MessageSquare className="h-3.5 w-3.5" /> Request changes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice: dimmed until the deliverable is approved */}
        <div
          className={cn(
            well,
            'flex items-center justify-between p-4 transition-all duration-500 ease-out',
            invoiceShown ? 'opacity-100' : 'opacity-45'
          )}
        >
          <div>
            <p className={cn('text-xs', muted)}>{invoiceShown ? 'Invoice #0012 · Milestone 2' : 'Invoice · unlocks after approval'}</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums">$1,800</p>
          </div>
          {!invoiceShown ? null : paid ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/20 bg-positive/10 px-3 py-1.5 text-xs font-semibold text-positive">
              <Check className="h-3.5 w-3.5" /> Paid
            </span>
          ) : (
            <span
              className={cn(
                'rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition-transform duration-150',
                p === 4 && 'scale-95 ring-4 ring-ink/15'
              )}
            >
              Pay now
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
