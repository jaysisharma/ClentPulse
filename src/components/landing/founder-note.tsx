import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { ember, section } from './styles'

// Real words from the founder. Stands in for testimonials until real quotes exist.
const EMAIL = 'support@frevio.app'

const STATS = [
  { value: '$0', label: 'Frevio fee on client payments' },
  { value: '0', label: 'Accounts your client has to make' },
  { value: '1', label: 'Link per project' },
]

export function FounderNote() {
  return (
    <section className={section}>
      <Reveal className={cn(ember, 'grid gap-12 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16')}>
        <figure>
          <p className="text-xs font-medium uppercase tracking-widest text-white/60">Why Frevio exists</p>
          <blockquote className="mt-6 space-y-5 text-pretty">
            <p className="text-3xl font-light leading-[1.1] tracking-[-0.03em] md:text-4xl">
              Clients don&rsquo;t ask &ldquo;any updates?&rdquo; to be difficult. They just can&rsquo;t see the work.
            </p>
            <p className="max-w-lg text-base leading-relaxed text-white/65">
              I built Frevio so they can. One private link to see progress, approve work and pay, with no account to
              create. If anything gets in your way, email me at{' '}
              <a href={`mailto:${EMAIL}`} className="text-white underline underline-offset-4 hover:no-underline">
                {EMAIL}
              </a>
              . I read every message.
            </p>
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink">
              JS
            </span>
            <div>
              <p className="text-sm font-medium">Jaysi Sharma</p>
              <p className="text-xs text-white/60">Founder, Frevio</p>
            </div>
          </figcaption>
        </figure>

        <dl className="self-end divide-y divide-white/10 border-y border-white/10">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-6 py-5">
              <dt className="text-sm text-white/65">{s.label}</dt>
              <dd className="text-4xl font-light tracking-[-0.03em] tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
