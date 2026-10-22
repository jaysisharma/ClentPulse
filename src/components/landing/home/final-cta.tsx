import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'

export function FinalCta({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 text-center sm:px-6">
      <h2 className="text-balance text-[2.75rem] font-light leading-[1.04] tracking-[-0.03em] text-ink sm:text-7xl">
        Send your first
        <br />
        <span className="text-ink-muted">client link today.</span>
      </h2>
      <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
        Create a project, share the link, and it runs from there. Set up in under a minute.
      </p>
      <Link
        href={signupHref}
        className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-canvas transition-colors hover:bg-ink/85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-sunken"
      >
        {isLoggedIn ? 'Open your workspace' : 'Start free'}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="mt-4 text-xs text-ink-muted">Free for 2 active projects. No card required. Cancel paid plans any time.</p>
      {!isLoggedIn && (
        <div className="mt-6 flex justify-center">
          <LaunchPromoBanner />
        </div>
      )}
    </section>
  )
}
