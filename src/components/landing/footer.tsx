import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { ember } from './styles'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#portal', label: 'Client portal' },
      { href: '#how-it-works', label: 'How it works' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/demo', label: 'Live demo' },
    ],
  },
  {
    title: 'Free tools',
    links: [
      { href: '/calculator', label: 'Rate calculator' },
      { href: '/calculator/scope-creep', label: 'Scope creep calculator' },
      { href: '/calculator/invoice-generator', label: 'Invoice generator' },
      { href: '/roadmap', label: 'Public roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: 'mailto:support@frevio.app', label: 'Contact' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
]

const linkClass = 'inline-flex min-h-11 items-center transition-colors hover:text-white'

/** Full-bleed ember footer, squared off at the bottom edge. */
export function Footer() {
  return (
    <footer className={cn(ember, 'rounded-b-none')}>
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Brand inverted className="[&_span]:text-4xl [&_svg]:h-12 [&_svg]:w-12" />
          <p className="text-sm text-white/60">The client portal for freelancers and small studios.</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">{col.title}</p>
              <ul className="mt-2 text-sm text-white/80">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith('/') ? (
                      <Link href={l.href} className={linkClass}>{l.label}</Link>
                    ) : (
                      <a href={l.href} className={linkClass}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 border-t border-white/10 py-6 pb-24 text-xs text-white/60 md:pb-6">
          © {new Date().getFullYear()} Frevio. Payments processed by Stripe.
        </p>
      </div>
    </footer>
  )
}
