'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowUpRight, Menu, X } from 'lucide-react'

interface FrevioNavbarProps {
  isLoggedIn: boolean
  signupHref: string
}

export function FrevioNavbar({ isLoggedIn, signupHref }: FrevioNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ── Top Reassurance Ribbon ── */}
      <div className="bg-[#0b0c10] border-b border-white/[0.06] text-xs text-slate-300 py-2 px-4 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-x-2 flex-wrap">
          <span>Free for up to 2 active projects. Zero credit card required.</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <Link
            href={signupHref}
            className="text-white hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Start free <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Floating Nav Header ── */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-[#08090a]/90 backdrop-blur-md border-b border-white/[0.06]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="font-semibold text-base tracking-tight text-white font-sans">
              Frevio
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-normal text-slate-300">
            <a href="#problem" className="hover:text-white transition-colors">
              Problem
            </a>
            <a href="#solution" className="hover:text-white transition-colors">
              Solution
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#client-experience" className="hover:text-white transition-colors">
              Client Portal
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/demo"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              Live Demo
            </Link>
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              {isLoggedIn ? 'Dashboard' : 'Sign in'}
            </Link>
            <Link
              href={signupHref}
              className="inline-flex items-center gap-1.5 bg-white text-slate-950 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-100 transition-all shadow-xs"
            >
              Start free
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href={signupHref}
              className="bg-white text-slate-950 px-3 py-1 rounded-full text-xs font-semibold"
            >
              Start free
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#0c0d12] px-6 py-5 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm text-slate-200">
              <a
                href="#problem"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                Problem
              </a>
              <a
                href="#solution"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                Solution
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                Workflow
              </a>
              <a
                href="#client-experience"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                Client Portal
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-white"
              >
                FAQ
              </a>
              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-indigo-400 font-medium"
              >
                Interactive Live Demo →
              </Link>
            </nav>
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <Link
                href={isLoggedIn ? '/dashboard' : '/auth/login'}
                className="text-center py-2 rounded-lg text-xs font-medium text-slate-300 border border-white/10"
              >
                {isLoggedIn ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link
                href={signupHref}
                className="text-center py-2.5 rounded-lg text-xs font-semibold bg-white text-slate-950"
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
