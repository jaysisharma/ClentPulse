'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FileText, MessageSquare, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { card, muted, primaryBtn, secondaryBtn, section, well } from './styles'

type Step = 'review' | 'approve' | 'pay'

const STEPS: { id: Step; label: string; blurb: string }[] = [
  { id: 'review', label: 'Review', blurb: 'Progress, files and updates in one timeline.' },
  { id: 'approve', label: 'Approve', blurb: 'One tap, timestamped for the record.' },
  { id: 'pay', label: 'Pay', blurb: 'The milestone invoice, ready on sign-off.' },
]

export function PortalDemo({ signupHref }: { signupHref: string }) {
  const [step, setStep] = useState<Step>('review')
  const [approved, setApproved] = useState(false)
  const [paid, setPaid] = useState(false)
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const reset = () => {
    setApproved(false)
    setPaid(false)
    setStep('review')
  }

  return (
    <section id="portal" className={cn(section, 'scroll-mt-24')}>
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <SectionHeading
          label="Try it"
          title="This is what your client sees."
          sub="Click through it. Review, approve, pay. That's the whole job for them, and nothing to sign up for."
        />

        <div className={cn(card, 'overflow-hidden shadow-xl')}>
          <div className="flex items-center justify-between border-b border-line px-5 py-3 sm:px-6">
            <div>
              <p className={cn('text-xs', muted)}>Northwind Coffee · Brand refresh</p>
              <p className="text-sm font-semibold">Logo system, v3</p>
            </div>
            <button
              onClick={reset}
              className={cn('inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-md px-3 text-xs transition-colors hover:text-ink', muted)}
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div id="portal-demo-panel" role="tabpanel" className="min-h-[300px] px-5 py-6 sm:px-6">
            {step === 'review' && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { when: '2h ago', text: 'Uploaded v3 with the tightened wordmark and the new coffee-bean glyph.' },
                  { when: 'Mon', text: 'Discovery wrapped. Moodboard and positioning notes are attached.' },
                ].map((u) => (
                  <div key={u.text} className={cn(well, 'p-4')}>
                    <p className={cn('text-xs', muted)}>
                      <span className="font-semibold text-ink">Studio Ash</span> · {u.when}
                    </p>
                    <p className="mt-1 text-sm">{u.text}</p>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  {['Primary', 'Mono', 'Glyph'].map((f) => (
                    <div key={f} className={cn(well, 'flex aspect-[5/3] flex-col items-center justify-center gap-1', muted)}>
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">{f}.svg</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep('approve')} className={cn(secondaryBtn, 'w-full')}>
                  Continue to approval →
                </button>
              </div>
            )}

            {step === 'approve' && (
              <div className="space-y-4 animate-fade-in">
                <div className={cn(well, 'flex aspect-[16/6] items-center justify-center')}>
                  <span className="text-3xl font-semibold tracking-tight sm:text-4xl">northwind.</span>
                </div>
                {approved ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-positive/20 bg-positive/10 p-4 text-sm animate-fade-in">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-positive text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="font-semibold">Approved by Maya at Northwind</p>
                        <p className={cn('text-xs', muted)}>Today, 10:42 · saved to the project record</p>
                      </div>
                    </div>
                    <button onClick={() => setStep('pay')} className={cn(secondaryBtn, 'w-full')}>
                      Invoice is ready →
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => setApproved(true)} className={cn(primaryBtn, 'flex-1')}>
                      <Check className="h-4 w-4" /> Approve deliverable
                    </button>
                    <button className={cn(secondaryBtn, 'flex-1')}>
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
                    <span className="text-sm font-semibold">Invoice #0012</span>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs font-medium',
                        paid
                          ? 'border-positive/20 bg-positive/10 text-positive'
                          : 'border-attention/20 bg-attention/10 text-attention'
                      )}
                    >
                      {paid ? 'Paid' : 'Due in 7 days'}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className={muted}>Milestone 2 · Logo system</dt>
                      <dd className="tabular-nums">$1,600</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className={muted}>Extra revision round (signed change order)</dt>
                      <dd className="tabular-nums">$200</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold">
                      <dt>Total</dt>
                      <dd className="tabular-nums">$1,800</dd>
                    </div>
                  </dl>
                </div>
                {paid ? (
                  <div className="space-y-4 pt-1 text-center animate-fade-in">
                    <p className="text-base">Paid. Receipt sent to both of you. Nobody chased anyone.</p>
                    <Link href={signupHref} className={primaryBtn}>
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

          {/* Steps double as tabs */}
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
                    'relative min-h-11 cursor-pointer px-3 py-3 text-left transition-colors sm:px-5',
                    i > 0 && 'border-l border-line',
                    active ? 'bg-sunken' : 'hover:bg-sunken'
                  )}
                >
                  <span
                    className={cn(
                      'absolute inset-x-0 top-0 h-0.5 transition-colors',
                      i <= stepIndex ? 'bg-ink' : 'bg-transparent'
                    )}
                  />
                  <p className="text-xs">
                    <span className={muted}>0{i + 1}</span>{' '}
                    <span className={cn('ml-1 font-medium', active ? '' : muted)}>{s.label}</span>
                  </p>
                  <p className={cn('mt-1 hidden text-xs leading-relaxed sm:block', muted)}>{s.blurb}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
