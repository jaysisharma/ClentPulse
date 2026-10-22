import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const STEPS = [
  { title: 'Create the project', body: 'Name it, add your client’s email, set milestones. A contract too, if you want one.' },
  { title: 'Send one link', body: 'Your client gets a private portal. No account to create, no password to forget.' },
  { title: 'Get approved and paid', body: 'Post updates as you go. Clients approve and pay the milestone from the same page.' },
]

const FACTS = ['0 client passwords', '1-click sign-off', 'Live in under 60 seconds', '$0 to start']

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
      <SectionHeading label="How it works" title="Live in a minute." muted="Calm for the whole project." />

      <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 80} className="border-t border-line pt-6">
            <span className="font-mono text-sm text-accent">0{i + 1}</span>
            <h3 className="mt-3 text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">{s.body}</p>
          </Reveal>
        ))}
      </ol>

      <p className="mt-16 text-center text-sm text-ink-muted">
        {FACTS.map((f, i) => (
          <span key={f} className="inline-block">
            <span className="text-ink">{f}</span>
            {i < FACTS.length - 1 && <span className="px-3 text-line-strong">·</span>}
          </span>
        ))}
      </p>
    </section>
  )
}
