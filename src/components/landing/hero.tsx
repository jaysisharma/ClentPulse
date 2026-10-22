import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Receipt } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'
import { cn } from '@/lib/utils'
import { PortalPreview } from './portal-preview'
import { card, ember, heading, muted, primaryBtn, textLink } from './styles'

/** Small notification card floated on the ember panel, like a phone alert. */
function Notice({ icon, title, meta, className }: { icon: React.ReactNode; title: string; meta: string; className?: string }) {
  return (
    <div className={cn(card, 'flex items-center gap-3 p-3.5 pr-5 shadow-xl shadow-black/30', className)}>
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sunken text-ink">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className={cn('text-xs', muted)}>{meta}</p>
      </div>
    </div>
  )
}

export function Hero({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 md:pt-36">
      <div className="mx-auto max-w-3xl text-center">
        <a
          href="#pricing"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <span className="rounded-full border border-line bg-surface px-3 py-1.5">
            Client portal for freelancers, free for 2 projects
            <ArrowUpRight className="ml-1 inline h-3 w-3" />
          </span>
        </a>

        <h1 className={cn(heading, 'mt-6 text-[2.6rem] leading-[1.04] sm:text-6xl md:text-7xl')}>
          Your clients, one link. <span className="text-ink-muted">No more chasing.</span>
        </h1>

        <p className={cn('mx-auto mt-6 max-w-xl text-lg leading-relaxed', muted)}>
          Clients review your work, approve it and pay the invoice from one private page. No account for them, no
          &ldquo;any updates?&rdquo; for you.
        </p>

        <div id="hero-cta" className="mt-9 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
          <Link href={signupHref} className={primaryBtn}>
            {isLoggedIn ? 'Go to dashboard' : 'Start free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo" className={textLink}>
            See what your client sees <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className={cn('mt-3 text-xs', muted)}>No card required. Invoices paid through Stripe, no Frevio fee.</p>

        {!isLoggedIn && (
          <div className="mt-6 flex justify-center">
            <LaunchPromoBanner />
          </div>
        )}
      </div>

      <div className={cn(ember, 'mt-14 p-4 sm:p-8 md:mt-20 lg:p-12')}>
        <div className="grid items-center gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div aria-hidden="true" className="hidden flex-col gap-3 lg:flex">
            <p className="mb-2 text-sm text-white/60">Today</p>
            <Notice
              icon={<Check className="h-4 w-4 text-positive" strokeWidth={2.5} />}
              title="Maya approved Logo system v3"
              meta="Northwind · 14:05"
            />
            <Notice
              icon={<Receipt className="h-4 w-4" />}
              title="Invoice #0012 paid, $1,800"
              meta="Stripe · 14:07"
              className="ml-8"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              One page per project. Your client sees progress, signs off and pays without logging in.
            </p>
          </div>
          <PortalPreview />
        </div>
      </div>
    </section>
  )
}
