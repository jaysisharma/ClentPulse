'use client'

import { useEffect, useState } from 'react'
import { Link2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { useInView } from './reveal'
import { card, muted, section, well } from './styles'

// x/y are % positions in the stage; xm is the phone x position.
const SCATTERED = [
  { from: 'Email', text: 'Re: Re: Fwd: logo_final_FINAL_v2.pdf', x: 25, xm: 46, y: 16, r: -3 },
  { from: 'Slack', text: '“can we also do a quick landing page?”', x: 75, xm: 54, y: 24, r: 2.5 },
  { from: 'WhatsApp', text: 'where are we on this?', x: 20, xm: 44, y: 52, r: 2 },
  { from: 'Drive', text: 'Maya requested access to “Brand assets”', x: 79, xm: 56, y: 60, r: -2.5 },
  { from: 'Email', text: 'Reminder: invoice #0011 is 14 days overdue', x: 47, xm: 50, y: 85, r: 1.5 },
]

/** Five scattered client messages collapse into one Frevio link when scrolled into view. */
export function Problem() {
  const [ref, inView] = useInView<HTMLDivElement>(0.45)
  const [converged, setConverged] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setConverged(true), 1100)
    return () => clearTimeout(t)
  }, [inView, run])

  const replay = () => {
    setConverged(false)
    setRun((n) => n + 1)
  }

  return (
    <section className={section}>
      <SectionHeading
        label="The problem"
        title={
          <>
            Clients don&apos;t ignore you.{' '}
            <span className="text-slate-500">They lose you between five apps.</span>
          </>
        }
      />

      <div ref={ref} className={cn(card, 'relative mt-12 h-[440px] overflow-hidden sm:h-[420px]')}>
        {SCATTERED.map((m, i) => (
          <div
            key={m.text}
            className={cn(
              well,
              'absolute w-[min(85%,300px)] bg-white px-4 py-3 shadow-sm dark:bg-[#111218]',
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
            <p className="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">{m.from}</p>
            <p className="mt-0.5 text-sm">{m.text}</p>
          </div>
        ))}

        <div
          className={cn(
            'absolute left-1/2 top-1/2 w-[min(90%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-white/10 dark:bg-[#111218] dark:shadow-none',
            'transition-[opacity,transform] duration-500 ease-out',
            converged ? 'scale-100 opacity-100 delay-700' : 'pointer-events-none scale-90 opacity-0'
          )}
        >
          <div className={cn(well, 'mx-auto flex w-fit items-center gap-2 px-3 py-2 font-mono text-sm')}>
            <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            frevio.app/p/northwind
          </div>
          <p className="mt-4 text-base">One link. Every update, approval and invoice.</p>
          <button
            onClick={replay}
            className={cn('mt-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 px-3 text-xs transition-colors hover:text-slate-900 dark:hover:text-white', muted)}
          >
            <RotateCcw className="h-3 w-3" /> Replay
          </button>
        </div>
      </div>
    </section>
  )
}
