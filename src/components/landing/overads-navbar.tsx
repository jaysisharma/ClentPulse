'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowUpRight, Menu, X, ArrowRight } from 'lucide-react'

interface Props {
  isLoggedIn: boolean
  signupHref: string
  promoRemaining?: number | null
  promoCap?: number | null
}

export function OveradsNavbar({ isLoggedIn, signupHref }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Capabilities', href: '#solutions' },
    { label: 'Simulator', href: '#sandbox' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090A]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#F3F4F6] hover:text-white transition-colors focus:outline-none rounded-lg py-1 px-1.5"
        >
          <Logo className="w-5 h-5 text-[#5E6AD2]" />
          <span className="font-semibold text-base tracking-tight text-white font-sans">Frevio</span>
        </Link>

        {/* Center: Clean Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-[#8A8F98] hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.05] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions (Log in + Start Free) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth/login'}
            className="text-xs font-medium text-[#8A8F98] hover:text-white px-3 py-1.5 rounded-full transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Log in'}
          </Link>

          <Link
            href={signupHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#6875E3] px-4 py-2 rounded-full transition-all shadow-[0_0_16px_rgba(94,106,210,0.35)] hover:shadow-[0_0_24px_rgba(94,106,210,0.5)]"
          >
            <span>{isLoggedIn ? 'Open App' : 'Start free'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={signupHref}
            className="text-xs font-medium text-white bg-[#5E6AD2] hover:bg-[#6875E3] px-3.5 py-1.5 rounded-full transition-all"
          >
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#8A8F98] hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08090A] border-b border-white/[0.08] px-4 py-5 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#8A8F98] hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-medium text-[#8A8F98] hover:text-white py-2 rounded-lg bg-white/[0.04]"
            >
              {isLoggedIn ? 'Dashboard' : 'Log in'}
            </Link>
            <Link
              href={signupHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-white bg-[#5E6AD2] hover:bg-[#6875E3] py-2.5 rounded-lg"
            >
              <span>{isLoggedIn ? 'Open App' : 'Start free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
