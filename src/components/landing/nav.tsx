'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { primaryBtn } from './styles'

const LINKS = [
  { href: '#portal', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
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
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled
          ? 'border-slate-200 bg-slate-50/85 backdrop-blur-md dark:border-white/10 dark:bg-[#08090a]/85'
          : 'border-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Brand />

        <div className="hidden items-center gap-7 text-sm text-slate-600 md:flex dark:text-slate-400">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-slate-900 dark:hover:text-white">
              {l.label}
            </a>
          ))}
          <Link href="/calculator" className="transition-colors hover:text-slate-900 dark:hover:text-white">
            Free tools
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="hidden min-h-11 items-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex dark:text-slate-400 dark:hover:text-white"
            >
              Log in
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
