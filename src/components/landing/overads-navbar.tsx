'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/landing/theme-toggle'
import {
  ArrowUpRight, ChevronDown, Menu, X, Sparkles, SlidersHorizontal,
  Radio, Eye
} from 'lucide-react'

interface Props {
  isLoggedIn: boolean
  signupHref: string
  promoRemaining: number | null
}

export function OveradsNavbar({ isLoggedIn, signupHref }: Props) {
  const [productMenuOpen, setProductMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 w-full pt-[env(safe-area-inset-top)] pointer-events-none">
      <div className="relative flex h-20 w-full items-center justify-between px-6 sm:px-10 lg:px-12">
        
        {/* Far Left: Logo */}
        <div className="pointer-events-auto flex items-center z-10">
          <Link
            href="/"
            className="inline-flex items-center transition-all hover:opacity-90 px-3.5 py-1.5 rounded-full bg-[#0e1017]/85 backdrop-blur-xl border border-white/10 shadow-lg text-white group"
          >
            <Logo className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
            <span className="ml-2 font-bold text-sm tracking-tight text-white font-mono">Frevio</span>
          </Link>
        </div>

        {/* Center: Navigation Links Pill */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full bg-[#0e1017]/85 py-1.5 px-3.5 shadow-2xl border border-white/10 backdrop-blur-xl pointer-events-auto z-10 text-white transition-colors duration-200">
          <nav className="flex items-center gap-0.5 text-sm text-slate-300">
            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductMenuOpen(true)}
              onMouseLeave={() => setProductMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProductMenuOpen(!productMenuOpen)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Features</span>
                <ChevronDown className={`size-3 text-slate-400 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {productMenuOpen && (
                <div className="absolute -left-6 top-full pt-2 z-50 w-[420px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="rounded-2xl border border-white/10 bg-[#0e1017]/98 backdrop-blur-2xl p-3 shadow-2xl ring-1 ring-white/5 grid grid-cols-2 gap-2 text-slate-200">
                    <Link
                      href="#presence"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Live Presence</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Real-time VS Code pulse</div>
                      </div>
                    </Link>

                    <Link
                      href="#screens"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Client Portal</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Passcode status pages</div>
                      </div>
                    </Link>

                    <Link
                      href="#bento"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Stripe Invoicing</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Instant online payment</div>
                      </div>
                    </Link>

                    <Link
                      href="#integrations"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Approvals & Sign</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Deliverable sign-offs</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#problem"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              The Problem
            </a>

            <a
              href="#solution"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Solution
            </a>

            <a
              href="#how-it-works"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              How it Works
            </a>

            <a
              href="#integrations"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Integrations
            </a>

            <a
              href="#pricing"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Far Right: Theme Toggle, Sign In & CTA Button */}
        <div className="hidden md:flex items-center gap-2 pointer-events-auto z-10 px-2 py-1.5 rounded-full bg-[#0e1017]/85 backdrop-blur-xl border border-white/10 shadow-lg text-white">
          
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle className="rounded-full text-slate-300 hover:text-white" />

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white font-medium text-slate-950 hover:bg-slate-100 h-8 px-3.5 text-xs transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="size-3" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-8 items-center rounded-full px-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>

              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-white font-medium text-slate-950 hover:bg-slate-100 h-8 px-3.5 text-xs transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <span>Start free</span>
                <ArrowUpRight className="size-3 text-slate-900" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Bar */}
        <div className="flex w-full items-center justify-between md:hidden pointer-events-auto rounded-full border border-white/10 bg-[#0e1017]/90 backdrop-blur-xl px-4 py-2 shadow-lg">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo className="w-5 h-5 text-white" />
            <span className="font-bold text-sm text-white font-mono">Frevio</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-full w-8 h-8 text-slate-300 hover:text-white" />
            <Link
              href={isLoggedIn ? '/dashboard' : signupHref}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-slate-100"
            >
              <span>{isLoggedIn ? 'Dashboard' : 'Start free'}</span>
              <ArrowUpRight className="size-3" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-200 hover:bg-white/20 cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/98 dark:bg-[#0e1017]/98 backdrop-blur-2xl p-4 shadow-2xl space-y-3 pointer-events-auto animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1 text-sm text-slate-700 dark:text-slate-300">
            <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white">The Problem</a>
            <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white">The Solution</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white">How it Works</a>
            <a href="#integrations" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white">Integrations</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white">Pricing</a>
          </nav>
        </div>
      )}
    </header>
  )
}
