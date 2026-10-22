import { Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import { card, heading, muted, section, well } from './styles'

const mockCard = cn(card, 'w-full p-5 shadow-sm sm:p-6 dark:shadow-none')

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
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
            {l}
          </li>
        ))}
      </ul>
      <p className={cn('mt-5 border-t border-slate-200 pt-3 text-xs dark:border-white/10', muted)}>
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
      <div className="mt-6 border-b border-slate-300 pb-1 dark:border-white/20">
        <span className="font-[family-name:var(--font-caveat)] text-3xl">Maya Chen</span>
      </div>
      <div className={cn('mt-2 flex items-center justify-between text-xs', muted)}>
        <span>Signed by client</span>
        <span className="text-emerald-700 dark:text-emerald-400">Today, 14:05 ✓</span>
      </div>
    </div>
  )
}

function InvoiceMock() {
  const rows = [
    { n: '#0012', label: 'Logo system', amt: '$1,800', status: 'Paid', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    { n: '#0013', label: 'Guidelines', amt: '$1,400', status: 'Due Fri', tone: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    { n: '#0014', label: 'Landing page', amt: '$900', status: 'Draft', tone: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400' },
  ]
  return (
    <div className={cn(card, 'w-full divide-y divide-slate-200 p-2 shadow-sm dark:divide-white/10 dark:shadow-none')}>
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
          <span className="text-slate-900 dark:text-white">$3,450</span> of $5,400
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full w-[64%] rounded-full bg-slate-900 dark:bg-white" />
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

const FEATURES = [
  {
    title: 'Updates that send themselves.',
    body: 'Post progress as you work. Frevio turns it into a clear weekly email, so clients stop asking “any updates?”.',
    mock: <UpdateMock />,
  },
  {
    title: 'Scope changes, signed first.',
    body: '“One more thing” becomes a change order the client signs in one click, before you start the extra work.',
    mock: <ContractMock />,
  },
  {
    title: 'Invoices tied to milestones.',
    body: 'Each invoice belongs to the work it pays for. Clients see it right after they approve, while the value is fresh.',
    mock: <InvoiceMock />,
  },
  {
    title: 'Know your real rate.',
    body: 'Track hours against the budget and see your effective hourly rate before a project quietly turns unprofitable.',
    mock: <BudgetMock />,
  },
]

export function Features() {
  return (
    <section className={section}>
      <SectionHeading
        label="Behind the link"
        title={
          <>
            The rest of the client job,{' '}
            <span className="text-slate-500">handled in the same place.</span>
          </>
        }
      />

      <div className="mt-16 space-y-20 sm:space-y-28">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <Reveal className={cn(i % 2 === 1 && 'md:order-2')}>
              <p className={cn('font-mono text-xs', muted)}>0{i + 1}</p>
              <h3 className={cn(heading, 'mt-3 text-2xl sm:text-3xl')}>{f.title}</h3>
              <p className={cn('mt-3 max-w-md text-base leading-relaxed', muted)}>{f.body}</p>
            </Reveal>
            <Reveal delay={100} className={cn('mx-auto w-full max-w-md', i % 2 === 1 && 'md:order-1')}>
              {f.mock}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  )
}
