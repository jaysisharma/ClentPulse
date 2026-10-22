'use client'

import { useEffect, useState } from 'react'
import { Link2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInView } from './reveal'
import { card, muted, stage, well } from './styles'

// x/y are % positions in the stage; xm is the phone x position.
const SCATTERED = [
  { from: 'Email', text: 'Re: Re: Fwd: logo_final_FINAL_v2.pdf', x: 25, xm: 46, y: 18, r: -3 },
  { from: 'Slack', text: '“can we also do a quick landing page?”', x: 75, xm: 54, y: 26, r: 2.5 },
  { from: 'WhatsApp', text: 'where are we on this?', x: 20, xm: 44, y: 52, r: 2 },
  { from: 'Drive', text: 'Maya requested access to “Brand assets”', x: 79, xm: 56, y: 60, r: -2.5 },
  { from: 'Email', text: 'Reminder: invoice #0011 is 14 days overdue', x: 47, xm: 50, y: 84, r: 1.5 },
]

/**
 * The hero visual: five scattered client messages collapse into one Frevio
 * link. The link is the only violet on the page.
 */
export function OneLink() {
  const [ref, inView] = useInView<HTMLDivElement>(0.45)
  const [converged, setConverged] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setConverged(true), 1400)
    return () => clearTimeout(t)
  }, [inView, run])

  const replay = () => {
    setConverged(false)
    setRun((n) => n + 1)
  }

  return (
    <div ref={ref} className={cn(stage, 'h-[460px] sm:h-[480px]')}>
      <p
        className={cn(
          'absolute left-5 top-5 text-sm text-canvas/60 transition-opacity duration-500 sm:left-8 sm:top-7',
          converged && 'opacity-0'
        )}
      >
        Where your client is looking for you today
      </p>

      {SCATTERED.map((m, i) => (
        <div
          key={m.text}
          aria-hidden={converged}
          className={cn(
            card,
            'absolute w-[min(85%,300px)] rounded-xl px-4 py-3',
            'left-[var(--xm)] top-[var(--y)] sm:left-[var(--x)]',
            'transition-[left,top,transform,opacity] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]'
          )}
          style={
            {
              '--x': converged ? '50%' : `${m.x}%`,
              '--xm': converged ? '50%' : `${m.xm}%`,
              '--y': converged ? '50%' : `${m.y}%`,
              transform: `translate(-50%, -50%) rotate(${converged ? 0 : m.r}deg) scale(${converged ? 0.6 : 1})`,
              opacity: converged ? 0 : 1,
              transitionDelay: `${converged ? i * 70 : 0}ms`,
            } as React.CSSProperties
          }
        >
          <p className={cn('text-xs font-medium', muted)}>{m.from}</p>
          <p className="mt-0.5 text-sm">{m.text}</p>
        </div>
      ))}

      <div
        className={cn(
          card,
          'absolute left-1/2 top-1/2 w-[min(90%,420px)] -translate-x-1/2 -translate-y-1/2 p-6 text-center',
          'transition-[opacity,transform] duration-500 ease-out',
          converged ? 'scale-100 opacity-100 delay-700' : 'pointer-events-none scale-95 opacity-0'
        )}
      >
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-sm text-on-accent">
          <Link2 className="h-4 w-4" />
          frevio.app/p/northwind
        </div>
        <p className="mt-5 text-lg font-light tracking-[-0.02em]">Every update, approval and invoice. One place.</p>
        <div className={cn(well, 'mx-auto mt-4 grid w-fit grid-cols-3 divide-x divide-line text-xs')}>
          {['Updates', 'Approvals', 'Invoices'].map((t) => (
            <span key={t} className="px-3 py-1.5">
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={replay}
          tabIndex={converged ? 0 : -1}
          className={cn('mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 px-3 text-xs transition-colors hover:text-ink', muted)}
        >
          <RotateCcw className="h-3 w-3" /> Replay
        </button>
      </div>
    </div>
  )
}
