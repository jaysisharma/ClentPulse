import Link from 'next/link'
import { ArrowRight, Check, Receipt } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'
import { cn } from '@/lib/utils'
import { PortalPreview } from './portal-preview'
import { card, heading, muted, primaryBtn, stage, textLink } from './styles'

/** What lands in your inbox while the client uses the portal. */
function Notice({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <div className={cn(card, 'flex items-center gap-3 rounded-2xl p-3.5 pr-5')}>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sunken">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className={cn('text-xs', muted)}>{meta}</p>
      </div>
    </div>
  )
}

export function Hero({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 md:pt-40">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
        <h1 className={cn(heading, 'text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl')}>
          Your clients, one link. <span className="text-ink-muted">No more chasing.</span>
        </h1>

        <div>
          <p className={cn('max-w-md text-lg leading-relaxed', muted)}>
            Clients review your work, approve it and pay the invoice from one private page. No account for them, no
            &ldquo;any updates?&rdquo; for you.
          </p>
          <div id="hero-cta" className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href={signupHref} className={primaryBtn}>
              {isLoggedIn ? 'Go to dashboard' : 'Start free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/demo" className={textLink}>
              See what your client sees
            </Link>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="mt-8">
          <LaunchPromoBanner />
        </div>
      )}

      <div className={cn(stage, 'mt-14 p-4 sm:p-8 md:mt-16 lg:p-12')}>
        <div className="grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div aria-hidden="true" className="hidden flex-col gap-3 text-ink lg:flex">
            <p className="mb-1 text-sm text-canvas/60">Your inbox, meanwhile</p>
            <Notice
              icon={<Check className="h-4 w-4 text-positive" strokeWidth={2.5} />}
              title="Maya approved Logo system v3"
              meta="Northwind Coffee · 14:05"
            />
            <Notice icon={<Receipt className="h-4 w-4" />} title="Invoice #0012 paid, $1,800" meta="Stripe · 14:07" />
          </div>
          <PortalPreview />
        </div>
      </div>
    </section>
  )
}
