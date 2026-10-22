'use client'

import { useEffect, useState } from 'react'
import { Check, FileText, Lock, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInView } from './reveal'

/**
 * Coded preview of the client portal for the hero. Plays the whole product
 * story on a loop: approve → milestone done → invoice → paid.
 * Demo data only.
 */

// 0 awaiting · 1 approve pressed · 2 approved · 3 invoice shown · 4 pay pressed · 5 paid
type Phase = 0 | 1 | 2 | 3 | 4 | 5
const TIMELINE: [Phase, number][] = [
  [1, 1600],
  [2, 2000],
  [3, 2900],
  [4, 4300],
  [5, 4700],
  [0, 8200],
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
    }, 8200)
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
      className="relative w-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_40px_100px_-30px_rgba(0,0,0,0.85)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          </div>
          <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-sunken px-3 py-1 font-mono text-xs text-ink-muted">
            <Lock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">frevio.app/p/northwind-rebrand</span>
          </div>
          <span className="hidden w-12 sm:block" />
        </div>

        <div className="grid gap-5 p-5 text-left sm:grid-cols-[1.45fr_1fr] sm:p-8">
          {/* Left: project + deliverable */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-ink-muted">Studio Ash · for Northwind Coffee</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">Brand refresh</h3>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                    style={{ width: approved ? '78%' : '52%' }}
                  />
                </div>
                <span className="w-9 text-right font-mono text-xs tabular-nums text-ink-muted">{approved ? '78%' : '52%'}</span>
              </div>
            </div>

            <div className="rounded-xl bg-sunken p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface">
                    <FileText className="h-4 w-4 text-ink" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">Logo system, v3</p>
                    <p className="text-xs text-ink-muted">Uploaded 2h ago · 4 files</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold transition-colors duration-300',
                    approved ? 'bg-positive/15 text-positive' : 'bg-attention/15 text-attention'
                  )}
                >
                  {approved ? 'Approved' : 'Awaiting you'}
                </span>
              </div>

              <div className="mt-4 h-9">
                {approved ? (
                  <p className="flex h-full items-center gap-2 text-sm text-ink-muted animate-fade-in">
                    <Check className="h-4 w-4 text-positive" />
                    Approved by Maya · Today, 10:42
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-canvas transition-transform duration-150',
                        p === 1 && 'scale-95 ring-4 ring-ink/20'
                      )}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]">
                      <MessageSquare className="h-3.5 w-3.5" /> Request changes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: milestones + invoice */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-ink-muted">Milestones</p>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  { label: 'Discovery', done: true },
                  { label: 'Logo system', done: approved, current: !approved },
                  { label: 'Brand guidelines', done: false, current: approved },
                ].map((m) => (
                  <li key={m.label} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-300',
                        m.done ? 'bg-positive text-canvas' : m.current ? 'shadow-[inset_0_0_0_2px_var(--accent)]' : 'shadow-[inset_0_0_0_1px_var(--line-strong)]'
                      )}
                    >
                      {m.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span className={m.done ? 'text-ink-muted' : 'text-ink'}>{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                'rounded-xl bg-sunken p-4 transition-all duration-500 ease-out',
                invoiceShown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-muted">Invoice #0012</p>
                <span className={cn('text-xs font-semibold', paid ? 'text-positive' : 'text-ink-muted')}>
                  {paid ? 'Paid ✓' : 'Due in 7 days'}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold tabular-nums text-ink">$1,800</span>
                {!paid && (
                  <span
                    className={cn(
                      'rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas transition-transform duration-150',
                      p === 4 && 'scale-95 ring-4 ring-ink/20'
                    )}
                  >
                    Pay now
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
