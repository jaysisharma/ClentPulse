'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { card, muted, primaryBtn, secondaryBtn, section } from './styles'

type Billing = 'monthly' | 'annual'

const TIERS = [
  {
    name: 'Free',
    price: { monthly: '$0', annual: '$0' },
    period: 'forever',
    description: 'For freelancers with one or two clients on the go.',
    features: ['Up to 2 active projects', 'Private client portal link', 'Deliverable approvals', 'Invoices'],
    cta: 'Start free',
    note: 'No card required',
    highlighted: false,
  },
  {
    name: 'Pro',
    badge: 'Most popular',
    price: { monthly: '$19', annual: '$15' },
    period: '/month',
    description: 'For full-time freelancers who want their brand on every link.',
    features: ['Unlimited active projects', 'Your logo & studio branding', 'Automatic client update emails', 'Milestone tracking & sign-offs', 'VS Code & GitHub activity', 'Priority email support'],
    cta: 'Start 14-day trial',
    note: 'Cancel anytime',
    highlighted: true,
  },
  {
    name: 'Studio',
    price: { monthly: '$49', annual: '$39' },
    period: '/month',
    description: 'For small studios running several clients at once.',
    features: ['Everything in Pro', 'Custom domain (portal.yourstudio.com)', 'Up to 5 team seats', 'Multi-currency invoicing', 'Priority studio support'],
    cta: 'Choose Studio',
    note: 'Cancel anytime',
    highlighted: false,
  },
]

export function Pricing({ signupHref }: { signupHref: string }) {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <section id="pricing" className={cn(section, 'scroll-mt-24')}>
      <SectionHeading align="center" label="Pricing" title="Start free. Upgrade when you grow." />

      {/* Segmented switcher, same pattern as the login page's Sign up / Sign in tabs */}
      <div className="mt-8 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing period"
          className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/[0.05]"
        >
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={cn(
                'min-h-11 cursor-pointer rounded-lg px-5 text-xs font-semibold transition-all',
                billing === b
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-white/15 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual · save 20%'}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              card,
              'flex flex-col p-7',
              t.highlighted && 'border-slate-900 ring-slate-900/10 dark:border-white/40 dark:ring-white/10'
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.name}</h3>
              {t.badge && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {t.badge}
                </span>
              )}
            </div>
            <p className={cn('mt-2 text-sm', muted)}>{t.description}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-light tracking-tight tabular-nums">{t.price[billing]}</span>
              <span className={cn('text-sm', muted)}>{t.period}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href={signupHref} className={cn(t.highlighted ? primaryBtn : secondaryBtn, 'mt-8 w-full')}>
              {t.cta}
            </Link>
            <p className={cn('mt-3 text-center text-xs', muted)}>{t.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
