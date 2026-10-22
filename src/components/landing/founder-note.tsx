import { cn } from '@/lib/utils'
import { Reveal } from './reveal'
import { eyebrow, muted, section } from './styles'

// Real words from the founder. Stands in for testimonials until real quotes exist.
const EMAIL = 'support@frevio.cloud'

export function FounderNote() {
  return (
    <section className={section}>
      <Reveal className="grid gap-6 border-t border-line pt-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <p className={eyebrow}>A note from the founder</p>
        <figure className="max-w-2xl">
          <blockquote className="space-y-5 text-lg leading-relaxed">
            <p>
              Clients don&rsquo;t ask &ldquo;any updates?&rdquo; to be difficult. They ask because they can&rsquo;t see
              the work, so you stop what you&rsquo;re doing to tell them.
            </p>
            <p className={muted}>
              I built Frevio so they can see it. One private link to follow progress, approve work and pay, with no
              account to create. If anything gets in your way, email me at{' '}
              <a href={`mailto:${EMAIL}`} className="text-ink underline underline-offset-4 hover:no-underline">
                {EMAIL}
              </a>
              . I read every message.
            </p>
          </blockquote>
          <figcaption className="mt-8">
            <span className="block font-[family-name:var(--font-caveat)] text-3xl leading-none">Jaysi</span>
            <span className={cn('mt-2 block text-sm', muted)}>Jaysi Sharma, founder</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
