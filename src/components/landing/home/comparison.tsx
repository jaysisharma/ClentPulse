import { ArrowRight, Check } from 'lucide-react'
import { Stage } from './stage'

const BARS = [
  { name: 'Frevio Pro', note: 'Portal, approvals, invoices, updates', price: 19, highlight: true },
  { name: 'Frevio Free', note: 'Up to 2 active projects', price: 0, highlight: true },
  { name: 'A typical tool stack', note: 'Portal + e-sign + invoicing + time tracking', price: 180, highlight: false },
]

const REPLACES = [
  'Status emails you write by hand',
  'A separate client portal login',
  'E-signature for change orders',
  'Invoice PDFs and payment chasing',
]

export function Comparison() {
  const max = Math.max(...BARS.map((b) => b.price))
  return (
    <section id="comparison" className="mx-auto max-w-6xl px-3 sm:px-6">
      <Stage tone="plum">
        <div className="grid gap-12 p-6 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">Why Frevio</p>
            <h2 className="mt-4 text-balance text-4xl font-light leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
              One link instead of a stack of tools.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              Most freelancers stitch together a portal, an e-sign tool, invoicing and time tracking. Frevio does the client-facing
              part of all four, starting at $0.
            </p>
            <ul className="mt-7 space-y-2.5">
              {REPLACES.map((r) => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-white/85">
                  <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                  {r}
                </li>
              ))}
            </ul>
            <a href="#pricing" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
              See pricing <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex flex-col justify-center gap-7">
            {BARS.map((b) => (
              <div key={b.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-base text-white">
                    <span className={b.highlight ? 'font-semibold' : ''}>{b.name}</span>
                  </p>
                  <p className="text-2xl font-light tabular-nums text-white">
                    {b.price === 180 ? '~$180' : `$${b.price}`}
                    <span className="text-sm text-white/70">/mo</span>
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={b.highlight ? 'h-full rounded-full bg-white' : 'h-full rounded-full bg-white/40'}
                    style={{ width: `${Math.max(2, (b.price / max) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/70">{b.note}</p>
              </div>
            ))}
            <p className="text-xs text-white/70">Stack estimate based on typical entry plans for a client portal, e-signature, invoicing and time-tracking tool.</p>
          </div>
        </div>
      </Stage>
    </section>
  )
}
