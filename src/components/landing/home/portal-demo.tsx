'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FileText, MessageSquare, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { Stage } from './stage'

type Step = 'review' | 'approve' | 'pay'

const STEPS: { id: Step; label: string; blurb: string }[] = [
  { id: 'review', label: 'Review', blurb: 'Progress, files and updates in one timeline.' },
  { id: 'approve', label: 'Approve', blurb: 'One tap, timestamped for the record.' },
  { id: 'pay', label: 'Pay', blurb: 'The milestone invoice, ready on sign-off.' },
]

const well = 'rounded-xl bg-sunken'
const ghostBtn =
  'inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:bg-sunken cursor-pointer'
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-ink/85 cursor-pointer'

export function PortalDemo({ signupHref }: { signupHref: string }) {
  const [step, setStep] = useState<Step>('review')
  const [approved, setApproved] = useState(false)
  const [paid, setPaid] = useState(false)

  const reset = () => {
    setApproved(false)
    setPaid(false)
    setStep('review')
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <section id="portal" className="mx-auto max-w-6xl scroll-mt-20 px-3 sm:px-6">
      <SectionHeading
        label="Try it"
        title="This is what your client sees."
        sub="Click through it. Review, approve, pay. That's the whole job for them."
      />

      <Stage className="mt-12">
        <div className="px-3 py-8 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)]">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs text-ink-muted">Northwind Coffee · Brand refresh</p>
                <p className="text-sm font-semibold text-ink">Logo system, v3</p>
              </div>
              <button
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-xs text-ink-muted hover:bg-sunken hover:text-ink cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Panel */}
            <div id="portal-demo-panel" role="tabpanel" className="min-h-[300px] px-5 py-6 sm:px-7">
              {step === 'review' && (
                <div className="space-y-3 animate-fade-in">
                  {[
                    { when: '2h ago', text: 'Uploaded v3 with the tightened wordmark and the new coffee-bean glyph.' },
                    { when: 'Mon', text: 'Discovery wrapped. Moodboard and positioning notes are attached.' },
                  ].map((u) => (
                    <div key={u.text} className={cn(well, 'p-4')}>
                      <p className="text-xs text-ink-muted">
                        <span className="font-semibold text-ink">Studio Ash</span> · {u.when}
                      </p>
                      <p className="mt-1 text-sm text-ink">{u.text}</p>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    {['Primary', 'Mono', 'Glyph'].map((f) => (
                      <div key={f} className={cn(well, 'flex aspect-[5/3] flex-col items-center justify-center gap-1 text-ink-muted')}>
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">{f}.svg</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep('approve')} className={cn(ghostBtn, 'w-full')}>
                    Continue to approval →
                  </button>
                </div>
              )}

              {step === 'approve' && (
                <div className="space-y-4 animate-fade-in">
                  <div className={cn(well, 'flex aspect-[16/6] items-center justify-center')}>
                    <span className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                      northwind<span className="text-accent">.</span>
                    </span>
                  </div>
                  {approved ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl bg-positive/10 p-4 text-sm animate-fade-in">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-positive text-canvas">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                        <div>
                          <p className="font-semibold text-ink">Approved by Maya at Northwind</p>
                          <p className="text-xs text-ink-muted">Today, 10:42 · saved to the project record</p>
                        </div>
                      </div>
                      <button onClick={() => setStep('pay')} className={cn(ghostBtn, 'w-full')}>
                        Invoice is ready →
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button onClick={() => setApproved(true)} className={cn(primaryBtn, 'flex-1')}>
                        <Check className="h-4 w-4" /> Approve deliverable
                      </button>
                      <button className={cn(ghostBtn, 'flex-1')}>
                        <MessageSquare className="h-4 w-4" /> Request changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 'pay' && (
                <div className="space-y-4 animate-fade-in">
                  <div className={cn(well, 'p-4')}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">Invoice #0012</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          paid ? 'bg-positive/15 text-positive' : 'bg-attention/15 text-attention'
                        )}
                      >
                        {paid ? 'Paid' : 'Due in 7 days'}
                      </span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-muted">Milestone 2 · Logo system</dt>
                        <dd className="tabular-nums text-ink">$1,600</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-muted">Extra revision round (signed change order)</dt>
                        <dd className="tabular-nums text-ink">$200</dd>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold">
                        <dt className="text-ink">Total</dt>
                        <dd className="tabular-nums text-ink">$1,800</dd>
                      </div>
                    </dl>
                  </div>
                  {paid ? (
                    <div className="space-y-4 pt-1 text-center animate-fade-in">
                      <p className="text-base text-ink">Paid. Receipt sent to both of you. Nobody chased anyone.</p>
                      <Link href={signupHref} className={cn(primaryBtn, 'w-full sm:w-auto sm:px-6')}>
                        Want this for your clients? Start free <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <button onClick={() => setPaid(true)} className={cn(primaryBtn, 'w-full')}>
                      Pay $1,800
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step row (tabs) */}
            <div role="tablist" aria-label="Client portal steps" className="grid grid-cols-3 border-t border-line">
              {STEPS.map((s, i) => {
                const active = s.id === step
                return (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={active}
                    aria-controls="portal-demo-panel"
                    onClick={() => setStep(s.id)}
                    className={cn(
                      'relative px-3 py-4 text-left transition-colors cursor-pointer sm:px-5 focus-visible:outline-none focus-visible:bg-sunken',
                      i > 0 && 'border-l border-line',
                      active ? 'bg-sunken' : 'hover:bg-sunken/60'
                    )}
                  >
                    <span
                      className={cn('absolute inset-x-0 top-0 h-0.5 transition-colors', i <= stepIndex ? 'bg-accent' : 'bg-transparent')}
                    />
                    <p className="text-xs text-ink-muted">
                      0{i + 1} <span className={cn('ml-1 font-medium', active ? 'text-ink' : 'text-ink-muted')}>{s.label}</span>
                    </p>
                    <p className="mt-1 hidden text-xs leading-relaxed text-ink-muted sm:block">{s.blurb}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Stage>
    </section>
  )
}
