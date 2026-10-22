import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { muted } from './styles'

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

const linkClass = 'inline-flex min-h-11 items-center transition-colors hover:text-slate-900 dark:hover:text-white'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Brand />
          <p className={cn('max-w-xs text-sm leading-relaxed', muted)}>
            The client portal for freelancers and small studios. One link for reviews, approvals and invoices.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">{col.title}</p>
            <ul className={cn('mt-2 text-sm', muted)}>
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
      <div className="border-t border-slate-200 dark:border-white/10">
        <p className={cn('mx-auto max-w-6xl px-4 py-6 pb-24 text-xs sm:px-6 md:pb-6', muted)}>© {new Date().getFullYear()} Frevio</p>
      </div>
    </footer>
  )
}
