import { Check, Copy, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { heading, muted, section, well } from './styles'

function CreateMock() {
  return (
    <div className="space-y-2 text-xs">
      <div className={cn(well, 'px-3 py-2')}>
        <p className={muted}>Project</p>
        <p className="mt-0.5 text-sm">Brand refresh</p>
      </div>
      <div className={cn(well, 'px-3 py-2')}>
        <p className={muted}>Client</p>
        <p className="mt-0.5 text-sm">maya@northwind.co</p>
      </div>
    </div>
  )
}

function LinkMock() {
  return (
    <div className="space-y-2 text-xs">
      <div className={cn(well, 'flex items-center gap-2 px-3 py-2.5 font-mono')}>
        <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
        <span className="truncate">frevio.app/p/northwind</span>
        <Copy className={cn('ml-auto h-3.5 w-3.5 flex-shrink-0', muted)} />
      </div>
      <p className={cn('px-1', muted)}>No account, no password. Optional passcode.</p>
    </div>
  )
}

function PaidMock() {
  return (
    <div className="space-y-2 text-xs">
      {[
        ['Logo system v3', 'Approved'],
        ['Invoice #0012, $1,800', 'Paid'],
      ].map(([label, state]) => (
        <div key={label} className={cn(well, 'flex items-center justify-between gap-2 px-3 py-2.5')}>
          <span className="truncate text-sm">{label}</span>
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 font-medium text-positive">
            <Check className="h-3 w-3" strokeWidth={3} /> {state}
          </span>
        </div>
      ))}
    </div>
  )
}

const STEPS = [
  { title: 'Create the project', body: 'Name it, add your client’s email and set milestones.', mock: <CreateMock /> },
  { title: 'Send one link', body: 'Your client gets a private portal that opens anywhere.', mock: <LinkMock /> },
  { title: 'Get approved and paid', body: 'They approve the milestone and pay it on the same page.', mock: <PaidMock /> },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className={cn(section, 'scroll-mt-24')}>
      <SectionHeading label="How it works" title="Live in under a minute." />

      <ol className="mt-10 grid border-t border-line md:grid-cols-3 md:divide-x md:divide-line">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col border-b border-line py-8 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
            <h3 className={cn(heading, 'text-xl')}>
              <span className="text-ink-muted">{i + 1}.</span> {s.title}
            </h3>
            <p className={cn('mt-2 mb-6 text-sm leading-relaxed', muted)}>{s.body}</p>
            <div className="mt-auto">{s.mock}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}
