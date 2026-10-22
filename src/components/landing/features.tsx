import { Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import { card, ember, heading, muted, section, well } from './styles'

const mockCard = cn(card, 'w-full p-5 sm:p-6')

function UpdateMock() {
  return (
    <div className={mockCard}>
      <div className={cn('flex items-center gap-2 text-xs', muted)}>
        <Mail className="h-3.5 w-3.5" /> To: maya@northwind.co · Fri 9:00
      </div>
      <p className="mt-3 text-base font-semibold">Weekly update: Brand refresh</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {['Logo system v3 approved', 'Brand guidelines started, draft due Wed', 'Nothing needed from you this week'].map((l) => (
          <li key={l} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-ink-muted" />
            {l}
          </li>
        ))}
      </ul>
      <p className={cn('mt-5 border-t border-line pt-3 text-xs', muted)}>
        Sent automatically from your project timeline
      </p>
    </div>
  )
}

function ContractMock() {
  return (
    <div className={mockCard}>
      <p className={cn('text-xs', muted)}>Change order #3</p>
      <p className="mt-1 text-base font-semibold">Add a landing page: $900, +6 days</p>
      <div className="mt-6 border-b border-line-strong pb-1">
        <span className="font-[family-name:var(--font-caveat)] text-3xl">Maya Chen</span>
      </div>
      <div className={cn('mt-2 flex items-center justify-between text-xs', muted)}>
        <span>Signed by client</span>
        <span className="text-positive">Today, 14:05 ✓</span>
      </div>
    </div>
  )
}

function InvoiceMock() {
  const rows = [
    { n: '#0012', label: 'Logo system', amt: '$1,800', status: 'Paid', tone: 'border-positive/20 bg-positive/10 text-positive' },
    { n: '#0013', label: 'Guidelines', amt: '$1,400', status: 'Due Fri', tone: 'border-attention/20 bg-attention/10 text-attention' },
    { n: '#0014', label: 'Landing page', amt: '$900', status: 'Draft', tone: 'border-line bg-sunken text-ink-muted' },
  ]
  return (
    <div className={cn(card, 'w-full divide-y divide-line p-2')}>
      {rows.map((r) => (
        <div key={r.n} className="flex items-center gap-3 px-3 py-3.5 text-sm">
          <span className={cn('font-mono text-xs', muted)}>{r.n}</span>
          <span className="flex-1 truncate">{r.label}</span>
          <span className="tabular-nums">{r.amt}</span>
          <span className={cn('w-16 rounded-full border py-0.5 text-center text-xs font-medium', r.tone)}>{r.status}</span>
        </div>
      ))}
    </div>
  )
}

function BudgetMock() {
  return (
    <div className={mockCard}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Budget</p>
        <p className={cn('text-sm tabular-nums', muted)}>
          <span className="text-ink">$3,450</span> of $5,400
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken">
        <div className="h-full w-[64%] rounded-full bg-ink" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className={cn(well, 'p-3')}>
          <p className={cn('flex items-center gap-1.5 text-xs', muted)}>
            <Clock className="h-3 w-3" /> This week
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">14h 20m</p>
        </div>
        <div className={cn(well, 'p-3')}>
          <p className={cn('text-xs', muted)}>Effective rate</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">$82/h</p>
        </div>
      </div>
    </div>
  )
}

const TILES = [
  {
    title: 'Updates that send themselves.',
    body: 'Post progress as you work. Frevio turns it into a clear weekly email, so clients stop asking “any updates?”.',
    mock: <UpdateMock />,
    dark: true,
    span: 'md:col-span-7',
  },
  {
    title: 'Scope changes, signed first.',
    body: '“One more thing” becomes a change order the client signs in one click, before you start the extra work.',
    mock: <ContractMock />,
    span: 'md:col-span-5',
  },
  {
    title: 'Invoices tied to milestones.',
    body: 'Each invoice belongs to the work it pays for. Clients see it right after they approve.',
    mock: <InvoiceMock />,
    span: 'md:col-span-5',
  },
  {
    title: 'Know your real rate.',
    body: 'Track hours against the budget and see your effective rate before a project quietly turns unprofitable.',
    mock: <BudgetMock />,
    dark: true,
    span: 'md:col-span-7',
  },
]

/** Bento of the four jobs behind the link: dark ember tiles alternate with paper ones. */
export function Features() {
  return (
    <section className={section}>
      <SectionHeading
        label="Behind the link"
        title={
          <>
            The rest of the client job, <span className="text-ink-muted">in the same place.</span>
          </>
        }
      />

      <div className="mt-10 grid gap-3 md:grid-cols-12">
        {TILES.map((t, i) => (
          <Reveal
            key={t.title}
            delay={(i % 2) * 80}
            className={cn(t.span, t.dark ? ember : card, 'flex flex-col gap-8 p-6 sm:p-8')}
          >
            <div className="max-w-md">
              <h3 className={cn(heading, 'text-2xl leading-tight md:text-[1.75rem]', t.dark && 'text-white')}>{t.title}</h3>
              <p className={cn('mt-3 text-sm leading-relaxed', t.dark ? 'text-white/65' : muted)}>{t.body}</p>
            </div>
            <div className={cn('mt-auto w-full', t.dark ? 'max-w-md self-end' : '')}>{t.mock}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
