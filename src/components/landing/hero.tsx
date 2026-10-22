import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'
import { cn } from '@/lib/utils'
import { PortalPreview } from './portal-preview'
import { eyebrow, heading, muted, primaryBtn, secondaryBtn } from './styles'

const PROOF = [
  'Clients never create an account',
  'One-click sign-offs, timestamped',
  'Invoices paid through Stripe, no Frevio fee',
]

export function Hero({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-32 sm:px-6 sm:pt-40 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div>
        <span className={eyebrow}>Client portal for freelancers</span>

        <h1 className={cn(heading, 'mt-6 text-[2.6rem] leading-[1.05] sm:text-6xl')}>
          Your clients, one link.
          <span className="block text-slate-500">No more chasing.</span>
        </h1>

        <p className={cn('mt-6 max-w-lg text-lg leading-relaxed', muted)}>
          Clients review your work, approve it and pay the invoice from one private page. You stop answering
          &ldquo;any updates?&rdquo; and start getting paid on time.
        </p>

        <div id="hero-cta" className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href={signupHref} className={primaryBtn}>
            {isLoggedIn ? 'Go to dashboard' : 'Start free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo" className={secondaryBtn}>
            See what your client sees
          </Link>
        </div>
        <p className={cn('mt-3 text-xs', muted)}>Free for 2 active projects. No card required.</p>

        <ul className="mt-8 space-y-2.5">
          {PROOF.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        {!isLoggedIn && (
          <div className="mt-8">
            <LaunchPromoBanner />
          </div>
        )}
      </div>

      <PortalPreview />
    </section>
  )
}
