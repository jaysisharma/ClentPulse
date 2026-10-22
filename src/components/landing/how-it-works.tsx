import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { heading, muted, section } from './styles'

const STEPS = [
  { title: 'Create the project', body: 'Name it, add your client’s email and set milestones. Add a contract if you want one.' },
  { title: 'Send one link', body: 'Your client gets a private portal. No account to create, no password to forget.' },
  { title: 'Get approved and paid', body: 'Post updates as you go. Clients approve and pay the milestone from the same page.' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className={cn(section, 'scroll-mt-24')}>
      <SectionHeading label="How it works" title="Live in under a minute." />

      <ol className="mt-12 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid gap-2 py-7 sm:grid-cols-[4rem_1fr_1.4fr] sm:items-baseline sm:gap-8">
            <span className={cn('font-mono text-sm', muted)}>0{i + 1}</span>
            <h3 className={cn(heading, 'text-xl sm:text-2xl')}>{s.title}</h3>
            <p className={cn('text-base leading-relaxed', muted)}>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
