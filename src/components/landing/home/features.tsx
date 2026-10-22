import { Clock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import { Stage } from './stage'

const floatCard = 'rounded-2xl bg-surface shadow-[0_30px_70px_-25px_rgba(0,0,0,0.85)]'

function CardText({ label, title, body, onStage }: { label: string; title: string; body: string; onStage?: boolean }) {
  return (
    <div>
      <p className={cn('text-sm', onStage ? 'text-white/70' : 'text-ink-muted')}>{label}</p>
      <h3 className={cn('mt-2 text-2xl font-light leading-tight tracking-[-0.02em] sm:text-[1.7rem]', onStage ? 'text-white' : 'text-ink')}>
        {title}
      </h3>
      <p className={cn('mt-3 max-w-md text-sm leading-relaxed sm:text-base', onStage ? 'text-white/75' : 'text-ink-muted')}>{body}</p>
    </div>
  )
}

function UpdateMock() {
  return (
    <div className={cn(floatCard, 'p-5 sm:p-6')}>
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Mail className="h-3.5 w-3.5" /> To: maya@northwind.co · Fri 9:00
      </div>
      <p className="mt-3 text-base font-semibold text-ink">Weekly update: Brand refresh</p>
      <ul className="mt-4 space-y-2.5 text-sm text-ink">
        {['Logo system v3 approved', 'Brand guidelines started, draft due Wed', 'Nothing needed from you this week'].map((l) => (
          <li key={l} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
            {l}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-line pt-3 text-xs text-ink-muted">Sent automatically from your project timeline</p>
    </div>
  )
}

function ContractMock() {
  return (
    <div className="rounded-xl bg-sunken p-4">
      <p className="text-xs text-ink-muted">Change order #3</p>
      <p className="mt-1 text-sm font-semibold text-ink">Add a landing page: $900, +6 days</p>
      <div className="mt-4 border-b border-line-strong/60 pb-1">
        <span className="font-[family-name:var(--font-caveat)] text-2xl text-ink">Maya Chen</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span>Signed by client</span>
        <span className="text-positive">Today, 14:05 ✓</span>
      </div>
    </div>
  )
}

function InvoiceMock() {
  const rows = [
    { n: '#0012', label: 'Logo system', amt: '$1,800', status: 'Paid', tone: 'text-positive bg-positive/15' },
    { n: '#0013', label: 'Guidelines', amt: '$1,400', status: 'Due Fri', tone: 'text-attention bg-attention/15' },
    { n: '#0014', label: 'Landing page', amt: '$900', status: 'Draft', tone: 'text-ink-muted bg-surface' },
  ]
  return (
    <div className="rounded-xl bg-sunken p-1.5">
      {rows.map((r) => (
        <div key={r.n} className="flex items-center gap-3 px-3 py-2.5 text-sm">
          <span className="font-mono text-xs text-ink-muted">{r.n}</span>
          <span className="flex-1 truncate text-ink">{r.label}</span>
          <span className="tabular-nums text-ink">{r.amt}</span>
          <span className={cn('w-16 rounded-full py-0.5 text-center text-[11px] font-semibold', r.tone)}>{r.status}</span>
        </div>
      ))}
    </div>
  )
}

function BudgetMock() {
  return (
    <div className="w-full rounded-xl bg-sunken p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-ink">Budget</p>
        <p className="text-sm tabular-nums text-ink-muted">
          <span className="text-ink">$3,450</span> of $5,400
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full w-[64%] rounded-full bg-accent" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-surface p-3">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Clock className="h-3 w-3" /> This week
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink">14h 20m</p>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <p className="text-xs text-ink-muted">Effective rate</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink">$82/h</p>
        </div>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-6">
      <SectionHeading label="Also included" title="The rest of the client job," muted="behind the same link." className="px-1" />

      <div className="mt-10 grid gap-3 lg:grid-cols-5">
        {/* Big violet card */}
        <Reveal className="lg:col-span-3 lg:row-span-2">
          <Stage className="h-full">
            <div className="flex h-full flex-col gap-8 p-6 sm:p-9">
              <CardText
                onStage
                label="Updates"
                title="Updates that send themselves."
                body="Post progress as you work. Frevio turns it into a clear weekly email, so clients stop asking “any updates?”."
              />
              <div className="flex flex-1 items-center sm:px-6">
                <UpdateMock />
              </div>
            </div>
          </Stage>
        </Reveal>

        <Reveal delay={80} className="flex flex-col gap-6 rounded-[28px] bg-surface p-6 lg:col-span-2 sm:p-8">
          <CardText label="Scope" title="Scope changes, signed first." body="“One more thing” becomes a change order the client signs before you start." />
          <ContractMock />
        </Reveal>

        <Reveal delay={160} className="flex flex-col gap-6 rounded-[28px] bg-surface p-6 lg:col-span-2 sm:p-8">
          <CardText label="Invoices" title="Invoices tied to milestones." body="Clients see the invoice right after they approve, while the value is fresh." />
          <InvoiceMock />
        </Reveal>

        <Reveal delay={80} className="grid items-center gap-6 rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-5 lg:grid-cols-2 lg:gap-12">
          <CardText
            label="Time & budget"
            title="Know your real rate."
            body="Track hours against the budget and see your effective hourly rate before a project quietly turns unprofitable."
          />
          <BudgetMock />
        </Reveal>
      </div>
    </section>
  )
}
