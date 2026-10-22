import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

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

/** Sits outside the sheet, on the black frame. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 60% at 85% 100%, rgb(109 40 217 / 0.35), transparent 70%), radial-gradient(60% 60% at 10% 30%, rgb(76 17 48 / 0.45), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-2xl font-semibold tracking-tight text-white">Frevio</span>
          </Link>
          <p className="text-sm text-white/70">Your clients, one link. No more chasing.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-widest text-white/60">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith('/') ? (
                      <Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
                    ) : (
                      <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="pb-6 text-xs text-white/60">© 2026 Frevio · support@frevio.app</p>
      </div>

      {/* Giant wordmark, cropped by the page edge */}
      <p
        aria-hidden="true"
        className="relative -mb-[0.24em] select-none text-center text-[27vw] font-semibold leading-none tracking-[-0.06em] text-white/[0.07]"
      >
        frevio
      </p>
    </footer>
  )
}
