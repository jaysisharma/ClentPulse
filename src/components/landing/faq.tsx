import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { card, eyebrow, heading, muted, section } from './styles'

// Written against the objections that stop a signup.
const FAQS = [
  {
    q: 'Do my clients need to create an account or install anything?',
    a: 'No. They open a private link in any browser, on any device. No password, no email confirmation, no app.',
  },
  {
    q: 'Is the portal private?',
    a: 'Each project gets its own link that only you share, and you can add a passcode. Clients only ever see their own project.',
  },
  {
    q: 'How do clients pay?',
    a: 'Invoices are attached to milestones. Once a client approves the work, the invoice is right there to pay through Stripe, and both of you get a receipt.',
  },
  {
    q: 'Can I put my own brand on it?',
    a: 'Pro adds your logo and studio colors. Studio also supports a custom domain such as portal.yourstudio.com, with SSL handled for you.',
  },
  {
    q: 'What do I get on the free plan?',
    a: 'Up to 2 active projects with the full client portal, approvals and invoices. Archive finished projects any time, or upgrade to Pro for unlimited.',
  },
  {
    q: 'Can I try it before sending it to a real client?',
    a: 'Yes. Create your first project for free and preview your client portal in seconds with no card required.',
  },
]

export function Faq() {
  return (
    <section id="faq" className={cn(section, 'scroll-mt-24')}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={eyebrow}>Common questions</p>
          <h2 className={cn(heading, 'mt-3 text-4xl leading-[1.04] sm:text-5xl md:text-6xl')}>
            Everything else
            <span className="block text-ink-muted">worth asking.</span>
          </h2>
        </div>
        <p className={cn('max-w-xs text-sm leading-relaxed', muted)}>
          Can&apos;t find it? Email{' '}
          <a href="mailto:support@frevio.cloud" className="text-ink underline underline-offset-4 hover:no-underline">
            support@frevio.cloud
          </a>{' '}
          and a human replies within a day.
        </p>
      </div>

      <div className={cn(card, 'mt-10 divide-y divide-line')}>
        {FAQS.map((f) => (
          <details key={f.q} className="group px-5 sm:px-7">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-5 text-sm font-medium sm:text-base [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-45', muted)} />
            </summary>
            <p className={cn('-mt-1 max-w-3xl pb-5 pr-8 text-sm leading-relaxed sm:text-base', muted)}>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
