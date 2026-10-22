'use client'

import { useEffect, useState } from 'react'
import { Link2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { Stage } from './stage'
import { useInView } from './reveal'

// x/y are % positions in the stage; xm is the phone x position.
const SCATTERED = [
  { from: 'Email', text: 'Re: Re: Fwd: logo_final_FINAL_v2.pdf', x: 24, xm: 46, y: 16, r: -4 },
  { from: 'Slack', text: '“can we also do a quick landing page?”', x: 75, xm: 54, y: 24, r: 3 },
  { from: 'WhatsApp', text: 'where are we on this? 👀', x: 19, xm: 44, y: 52, r: 2 },
  { from: 'Drive', text: 'Maya requested access to “Brand assets”', x: 79, xm: 56, y: 60, r: -3 },
  { from: 'Email', text: 'Reminder: invoice #0011 is 14 days overdue', x: 47, xm: 50, y: 85, r: 1.5 },
]

const CALM = [
  { n: '01', title: 'One timeline', body: 'Every update, file and decision in one place.' },
  { n: '02', title: 'Timestamped approvals', body: 'Not “looks good 👍” buried in chat.' },
  { n: '03', title: 'Signed scope changes', body: 'Agreed before the extra work starts.' },
  { n: '04', title: 'Invoices on milestones', body: 'Paid right after the work is approved.' },
]

export function BeforeAfter() {
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
    <section className="mx-auto max-w-6xl px-3 sm:px-6">
      <SectionHeading label="The problem" title="Clients don't ignore you." muted="They lose you between five apps." stacked />

      <Stage tone="dusk" className="mt-12">
        <div ref={ref} className="relative mx-auto h-[440px] max-w-4xl sm:h-[420px]">
          {SCATTERED.map((m, i) => (
            <div
              key={m.text}
              className={cn(
                'absolute w-[min(85%,300px)] rounded-xl bg-surface px-4 py-3 shadow-[0_14px_34px_-12px_rgba(0,0,0,0.75)]',
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
              <p className="text-[11px] font-medium uppercase tracking-wider text-danger">{m.from}</p>
              <p className="mt-0.5 text-sm text-ink">{m.text}</p>
            </div>
          ))}

          {/* The one link */}
          <div
            className={cn(
              'absolute left-1/2 top-1/2 w-[min(90%,400px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]',
              'transition-[opacity,transform] duration-500 ease-out',
              converged ? 'scale-100 opacity-100 delay-700' : 'pointer-events-none scale-90 opacity-0'
            )}
          >
            <div className="mx-auto flex w-fit items-center gap-2 rounded-lg bg-sunken px-3 py-2 font-mono text-sm text-ink">
              <Link2 className="h-4 w-4 text-accent" />
              frevio.app/p/northwind
            </div>
            <p className="mt-4 text-base text-ink">One link. Every update, approval and invoice.</p>
            <button
              onClick={replay}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Replay
            </button>
          </div>
        </div>
      </Stage>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CALM.map((c) => (
          <li key={c.n} className="rounded-2xl bg-surface p-5">
            <p className="text-xs text-ink-muted">{c.n}</p>
            <p className="mt-2 text-base font-medium text-ink">{c.title}</p>
            <p className="mt-1 text-sm text-ink-muted">{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
