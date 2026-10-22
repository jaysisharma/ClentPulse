import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { card, muted, section } from './styles'

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
    a: 'Yes. Open the live demo to click through exactly what your client sees, then create your first project for free.',
  },
]

export function Faq() {
  return (
    <section id="faq" className={cn(section, 'scroll-mt-24')}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          label="FAQ"
          title="Questions, answered."
          sub={
            <>
              Can&apos;t find it? Email{' '}
              <a href="mailto:support@frevio.app" className="text-slate-900 underline underline-offset-4 hover:no-underline dark:text-white">
                support@frevio.app
              </a>
              .
            </>
          }
        />

        <div className={cn(card, 'divide-y divide-slate-200 dark:divide-white/10')}>
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 sm:px-7">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-45', muted)} />
              </summary>
              <p className={cn('-mt-1 pb-5 pr-8 text-base leading-relaxed', muted)}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
