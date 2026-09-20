'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowUpRight, Menu, X, Sparkles, Star } from 'lucide-react'

interface Props {
  isLoggedIn: boolean
  signupHref: string
}

export function StoryNavbar({ isLoggedIn, signupHref }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastY, setLastY] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      setHidden(y > lastY + 10 && y > 100)
      if (y < lastY || y < 60) setHidden(false)
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'bg-[#040508]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo & Product Hunt Badge */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-indigo-500/20 blur-sm group-hover:bg-indigo-500/40 transition-colors" />
              <Logo className="relative w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight font-mono">Frevio</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-[10px] font-mono text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Product Hunt</span>
            <span className="text-amber-400 font-bold">#1 Product of the Day</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { label: 'The Protocol', href: '#comparison' },
            { label: 'Live Simulator', href: '#simulator' },
            { label: 'Bento System', href: '#bento' },
            { label: 'Outcomes', href: '#testimonials' },
            { label: 'Pricing', href: '#pricing' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Primary CTA Buttons */}
        <div className="hidden md:flex items-center gap-3.5">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
            >
              Console <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-all cursor-pointer font-sans"
              >
                Start Free
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#07080b]/95 backdrop-blur-2xl border-t border-white/[0.08] px-6 py-6 space-y-4 shadow-2xl">
          {[
            { label: 'The Protocol', href: '#comparison' },
            { label: 'Live Simulator', href: '#simulator' },
            { label: 'Bento System', href: '#bento' },
            { label: 'Outcomes', href: '#testimonials' },
            { label: 'Pricing', href: '#pricing' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.08]">
            <Link
              href={signupHref}
              className="block w-full text-center py-3 rounded-full text-xs font-semibold bg-white text-slate-950"
              onClick={() => setMobileOpen(false)}
            >
              Start Free — 2 Min Setup
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
