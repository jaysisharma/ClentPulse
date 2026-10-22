import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { eyebrow, muted, section } from './styles'

// Real words from the founder. Stands in for testimonials until real quotes exist.
const EMAIL = 'support@frevio.app'

export function FounderNote() {
  return (
    <section className={section}>
      <Reveal className="max-w-3xl">
        <span className={eyebrow}>Why Frevio exists</span>
        <figure className="mt-8">
          <blockquote className="space-y-6 text-xl font-light leading-relaxed tracking-tight sm:text-2xl sm:leading-relaxed">
            <p>
              Every freelancer knows the late-night &ldquo;any updates?&rdquo; message. It&rsquo;s rarely because the client is
              difficult. They just can&rsquo;t see what&rsquo;s happening, so they ask, and you stop working to answer.
            </p>
            <p className={muted}>
              I built Frevio so that never has to happen. Your client gets one private link to see progress, approve work and
              pay, with no account to create. You keep working, they stay in the loop, and the deposit lands before you start.
            </p>
            <p className={muted}>
              If anything in Frevio gets in your way, email me at{' '}
              <a href={`mailto:${EMAIL}`} className="text-slate-900 underline underline-offset-4 hover:no-underline dark:text-white">
                {EMAIL}
              </a>
              . I read every message.
            </p>
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              JS
            </span>
            <div>
              <p className="text-base font-semibold">Jaysi Sharma</p>
              <p className={cn('text-sm', muted)}>Founder, Frevio</p>
            </div>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
