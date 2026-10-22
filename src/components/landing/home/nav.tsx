'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

interface NavProps {
  isLoggedIn: boolean
  signupHref: string
}

const LINKS = [
  { href: '#portal', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav({ isLoggedIn, signupHref }: NavProps) {
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
        'sticky top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-line bg-sunken/80 backdrop-blur-xl' : 'border-b border-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="text-base font-semibold tracking-tight text-ink">Frevio</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
          <Link href="/calculator" className="transition-colors hover:text-ink">
            Free tools
          </Link>
        </div>

        <div className="flex items-center gap-5">
          {!isLoggedIn && (
            <Link href="/auth/login" className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline">
              Log in
            </Link>
          )}
          <Link
            href={isLoggedIn ? '/dashboard' : signupHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-sunken"
          >
            {isLoggedIn ? 'Dashboard' : 'Start free'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  )
}
