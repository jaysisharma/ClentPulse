'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

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
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
      <SectionHeading label="Pricing" title="Start free." muted="Upgrade when you grow." />

      <div className="mt-10 flex justify-center">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex gap-1 rounded-full bg-surface p-1 shadow-[0_0_0_1px_var(--line)]">
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                billing === b ? 'bg-sunken text-ink shadow-[0_0_0_1px_var(--line)]' : 'text-ink-muted hover:text-ink'
              )}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
              {b === 'annual' && <span className="ml-1.5 text-xs text-accent">−20%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              'flex flex-col rounded-[28px] bg-surface p-7',
              t.highlighted
                ? 'shadow-[0_0_0_1.5px_var(--accent)]'
                : 'shadow-[0_0_0_1px_var(--line)]'
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">{t.name}</h3>
              {t.badge && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">{t.badge}</span>}
            </div>
            <p className="mt-2 text-sm text-ink-muted">{t.description}</p>
            <p className="mt-7 flex items-baseline gap-1">
              <span className="text-5xl font-light tracking-[-0.03em] tabular-nums text-ink">{t.price[billing]}</span>
              <span className="text-sm text-ink-muted">{t.period}</span>
            </p>
            <ul className="mt-7 flex-1 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={signupHref}
              className={cn(
                'mt-8 rounded-full py-3 text-center text-sm font-semibold transition-colors',
                t.highlighted ? 'bg-ink text-canvas hover:bg-ink/85' : 'bg-sunken text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-canvas'
              )}
            >
              {t.cta}
            </Link>
            <p className="mt-3 text-center text-xs text-ink-muted">{t.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
