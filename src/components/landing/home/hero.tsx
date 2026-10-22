import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { LaunchPromoBanner } from '@/components/launch-promo-banner'
import { FigmaIcon, GitHubIcon, GoogleDriveIcon, StripeIcon, VSCodeIcon } from '@/components/ui/brand-icons'
import { PortalPreview } from './portal-preview'
import { Stage } from './stage'

interface HeroProps {
  isLoggedIn: boolean
  signupHref: string
}

const WORKS_WITH = [
  { name: 'Stripe', Icon: StripeIcon },
  { name: 'Figma', Icon: FigmaIcon },
  { name: 'GitHub', Icon: GitHubIcon },
  { name: 'Google Drive', Icon: GoogleDriveIcon },
  { name: 'VS Code', Icon: VSCodeIcon },
]

/** Small stage: what lands on your phone while the client works through the portal. */
function NotificationStack() {
  const items = [
    { title: 'Maya approved “Logo system, v3”', meta: 'Northwind Coffee · 10:42', done: true },
    { title: 'Invoice #0012 paid · $1,800', meta: 'Deposited via Stripe · 10:44', done: true },
    { title: 'Change order #3 is waiting', meta: 'Add a landing page · $900', done: false },
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-5 sm:p-6">
      <p className="mb-2 text-sm text-ink-muted">While you keep working…</p>
      {items.map((n) => (
        <div key={n.title} className="flex items-center gap-3 rounded-xl bg-surface/95 px-4 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{n.title}</p>
            <p className="truncate text-xs text-ink-muted">{n.meta}</p>
          </div>
          {n.done ? (
            <Check className="h-4 w-4 flex-shrink-0 text-positive" />
          ) : (
            <span className="flex-shrink-0 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-canvas">Review</span>
          )}
        </div>
      ))}
    </div>
  )
}

export function Hero({ isLoggedIn, signupHref }: HeroProps) {
  return (
    <section className="px-3 pt-16 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-4xl px-1 text-center">
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-full bg-surface py-1 pl-3.5 pr-1 text-xs text-ink-muted shadow-[0_0_0_1px_var(--line)] transition-colors hover:text-ink"
        >
          Built for freelancers &amp; small studios, from $0
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-canvas">
            <ArrowRight className="h-3 w-3" />
          </span>
        </a>

        <h1 className="mt-7 text-balance text-[2.75rem] font-light leading-[1.02] tracking-[-0.03em] text-ink sm:text-7xl md:text-[5.5rem]">
          Your clients, one link.
          <br />
          <span className="text-ink-muted">No more chasing.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Clients review your work, approve it and pay the invoice from one private page. No accounts, no passwords, no chasing.
        </p>

        <div id="hero-cta" className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
          <Link
            href={signupHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-ink/85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-sunken sm:w-auto"
          >
            {isLoggedIn ? 'Go to dashboard' : 'Start free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo" className="py-3 text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent">
            See what your client sees
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-muted">Free for 2 active projects. No card required.</p>

        {!isLoggedIn && (
          <div className="mt-6 flex justify-center">
            <LaunchPromoBanner />
          </div>
        )}
      </div>

      {/* Product stages */}
      <div className="mx-auto mt-14 grid max-w-6xl gap-3 sm:mt-20 lg:grid-cols-[1fr_2.1fr]">
        <Stage className="order-2 min-h-[300px] lg:order-1">
          <NotificationStack />
        </Stage>
        <Stage className="order-1 lg:order-2">
          <div className="p-3 sm:p-8">
            <PortalPreview />
          </div>
        </Stage>
      </div>

      {/* Works with: real integrations only */}
      <div className="mx-auto mt-14 max-w-4xl">
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-line" />
          Works with
          <span className="h-px flex-1 bg-line" />
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {WORKS_WITH.map(({ name, Icon }) => (
            <li key={name} className="flex items-center gap-2 text-sm text-ink-muted">
              <Icon className="h-4 w-4" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
