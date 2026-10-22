import Image from 'next/image'
import { founderNote } from '@/content/social-proof'
import { Reveal } from './reveal'

export function FounderNote() {
  if (!founderNote) return null
  const { body, name, title, avatar, email } = founderNote
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')

  // Link the support address inside the note body.
  const paragraphs = body.split('\n\n').map((para) => {
    const [before, after] = para.split(email)
    return after === undefined ? (
      para
    ) : (
      <>
        {before}
        <a href={`mailto:${email}`} className="text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
          {email}
        </a>
        {after}
      </>
    )
  })

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6">
      <Reveal>
        <p className="text-sm text-ink-muted">Why Frevio exists</p>
        <figure className="mt-8">
          <blockquote className="space-y-6 text-xl font-light leading-relaxed tracking-[-0.01em] text-ink sm:text-[1.7rem] sm:leading-[1.5]">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? '' : 'text-ink-muted'}>
                {p}
              </p>
            ))}
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-4">
            {avatar ? (
              <Image src={avatar} alt={name} width={48} height={48} className="rounded-full object-cover" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                {initials}
              </span>
            )}
            <div>
              <p className="text-base font-semibold text-ink">{name}</p>
              <p className="text-sm text-ink-muted">{title}</p>
            </div>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
