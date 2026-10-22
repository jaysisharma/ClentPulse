import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { muted } from './styles'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#portal', label: 'Client portal' },
      { href: '#faq', label: 'FAQ' },
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
      { href: 'mailto:support@frevio.cloud', label: 'Contact' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
]

const linkClass = 'inline-flex min-h-11 items-center transition-colors hover:text-ink'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 pt-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="space-y-2">
            <Brand />
            <p className={cn('max-w-xs text-sm leading-relaxed', muted)}>The client portal for freelancers and small studios.</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium">{col.title}</p>
              <ul className={cn('mt-1 text-sm', muted)}>
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

        <p className={cn('mt-12 border-t border-line py-6 pb-24 text-xs md:pb-6', muted)}>
          © {new Date().getFullYear()} Frevio. Payments processed by Stripe.
        </p>
      </div>
    </footer>
  )
}
