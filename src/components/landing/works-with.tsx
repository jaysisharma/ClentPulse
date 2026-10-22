import { muted, section } from './styles'

const GROUPS = [
  { label: 'You get paid through', items: ['Stripe'] },
  { label: 'Shows your progress from', items: ['GitHub', 'VS Code'] },
  { label: 'Clients open it in', items: ['Any browser', 'Any phone'] },
]

/** Quiet row of facts under the hero, in place of a logo wall. */
export function WorksWith() {
  return (
    <section className={section}>
      <div className="flex flex-col items-center gap-x-10 gap-y-4 text-sm md:flex-row md:justify-center">
        {GROUPS.map((g) => (
          <div key={g.label} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className={muted}>{g.label}</span>
            {g.items.map((i) => (
              <span key={i} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium">
                {i}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
