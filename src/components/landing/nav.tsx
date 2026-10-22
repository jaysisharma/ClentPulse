'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { primaryBtn } from './styles'

const LINKS = [
  { href: '#portal', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '/calculator', label: 'Free tools' },
]

export function Nav({ isLoggedIn, signupHref }: { isLoggedIn: boolean; signupHref: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-canvas/85 backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Brand />

        <div className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          {LINKS.map((l) =>
            l.href.startsWith('/') ? (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="hidden min-h-11 items-center text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link href={isLoggedIn ? '/dashboard' : signupHref} className={cn(primaryBtn, 'px-5')}>
            {isLoggedIn ? 'Dashboard' : 'Start free'}
          </Link>
        </div>
      </nav>
    </header>
  )
}
