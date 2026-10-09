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
    { label: 'Workspace Demo', href: '#demo' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#101113]/85 backdrop-blur-md border-b border-[#2A2D33]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#F5F5F3] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#A7B8FF]/40 rounded-lg py-1 px-1.5"
        >
          <Logo className="w-5 h-5 text-[#A7B8FF]" />
          <span className="font-semibold text-base tracking-tight text-[#F5F5F3]">Frevio</span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#A1A5AD] px-1.5 py-0.5 rounded bg-[#17191D] border border-[#2A2D33]">
            Cloud
          </span>
        </Link>

        {/* Center: Clean Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-[#A1A5AD] hover:text-[#F5F5F3] px-3.5 py-1.5 rounded-full hover:bg-[#17191D] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions (Log in + Start Free) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth/login'}
            className="text-xs font-medium text-[#A1A5AD] hover:text-[#F5F5F3] px-3 py-1.5 rounded-full transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Log in'}
          </Link>

          <Link
            href={signupHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101113] bg-[#A7B8FF] hover:bg-[#b8c6ff] px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-[#A7B8FF]/20"
          >
            <span>{isLoggedIn ? 'Open App' : 'Start free'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={signupHref}
            className="text-xs font-medium text-[#101113] bg-[#A7B8FF] hover:bg-[#b8c6ff] px-3 py-1.5 rounded-full transition-all"
          >
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A1A5AD] hover:text-[#F5F5F3] rounded-lg hover:bg-[#17191D] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#101113] border-b border-[#2A2D33] px-4 py-5 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#A1A5AD] hover:text-[#F5F5F3] py-2 px-3 rounded-lg hover:bg-[#17191D] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#2A2D33] flex flex-col gap-2">
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-sm font-medium text-[#A1A5AD] hover:text-[#F5F5F3] py-2 rounded-lg bg-[#17191D]"
            >
              {isLoggedIn ? 'Dashboard' : 'Log in'}
            </Link>
            <Link
              href={signupHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-[#101113] bg-[#A7B8FF] py-2.5 rounded-lg"
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
