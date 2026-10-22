import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'
import { cn } from '@/lib/utils'
import { OneLink } from './one-link'
import { heading, muted, primaryBtn, textLink } from './styles'

export function Hero({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 md:pt-40">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
        <h1 className={cn(heading, 'text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl')}>
          Your clients, one link. <span className="text-ink-muted">No more chasing.</span>
        </h1>

        <div>
          <p className={cn('max-w-md text-lg leading-relaxed', muted)}>
            Clients don&rsquo;t ignore you. They lose you between five apps. Frevio gives each project one private page
            where they review, approve and pay.
          </p>
          <div id="hero-cta" className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href={signupHref} className={primaryBtn}>
              {isLoggedIn ? 'Go to dashboard' : 'Start free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#portal" className={textLink}>
              Try the client view
            </a>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="mt-8">
          <LaunchPromoBanner />
        </div>
      )}

      <div className="mt-14 md:mt-16">
        <OneLink />
      </div>
    </section>
  )
}
