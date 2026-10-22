import { Plus } from 'lucide-react'
import { SectionHeading } from './section-heading'

// Written against the objections that stop a signup.
const FAQS = [
  {
    q: 'Do my clients need to create an account or install anything?',
    a: 'No. They open a private link in any browser, on any device. No password, no email confirmation, no app.',
  },
  {
    q: 'Is the portal private?',
    a: 'Each project gets its own unguessable link that only you share. Clients only ever see their own project.',
  },
  {
    q: 'Can I put my own brand on it?',
    a: 'Pro adds your logo and studio colors. Studio also supports a custom domain such as portal.yourstudio.com, with SSL handled for you.',
  },
  {
    q: 'How do clients pay?',
    a: 'Invoices are attached to milestones. Once a client approves the work, the invoice is right there for them to pay, and both of you get a receipt.',
  },
  {
    q: 'What do I get on the free plan?',
    a: 'Up to 2 active projects with the full client portal, approvals and invoices. Archive finished projects any time to make room, or upgrade to Pro for unlimited.',
  },
  {
    q: 'Can I try it before sending it to a real client?',
    a: 'Yes. Open the live demo to click through exactly what your client sees, then create your first project for free.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-20 px-3 sm:px-6">
      <div className="flex flex-col gap-6 px-1 md:flex-row md:items-end md:justify-between">
        <SectionHeading label="Common questions" title="Still deciding?" muted="Here's what people ask." stacked />
        <p className="max-w-xs text-sm leading-relaxed text-ink-muted md:text-right">
          Can&apos;t find it? Email{' '}
          <a href="mailto:support@frevio.app" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
            support@frevio.app
          </a>{' '}
          and the founder replies personally.
        </p>
      </div>

      <div className="mt-10 divide-y divide-line overflow-hidden rounded-[28px] bg-surface">
        {FAQS.map((f) => (
          <details key={f.q} className="group px-5 sm:px-7">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus className="h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="-mt-1 pb-5 pr-10 text-base leading-relaxed text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
