'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
  ArrowUpRight, ChevronDown, Menu, X, Sparkles, SlidersHorizontal,
  Radio, Eye, Wand2, SendHorizontal
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
          <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-85">
            <Logo className="w-6 h-6 text-slate-950" />
            <span className="ml-2.5 font-bold text-base tracking-tight text-slate-950 font-mono">Frevio</span>
          </Link>
        </div>

        {/* Center: Navigation Links Pill (Dead Center via Absolute Positioning) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full bg-white/90 py-1.5 px-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/80 backdrop-blur-xl pointer-events-auto z-10">
          <nav className="flex items-center gap-0.5 text-sm text-slate-600">
            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductMenuOpen(true)}
              onMouseLeave={() => setProductMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProductMenuOpen(!productMenuOpen)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <span>Features</span>
                <ChevronDown className={`size-3 text-slate-400 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {productMenuOpen && (
                <div className="absolute -left-6 top-full pt-2 z-50 w-[420px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-2xl p-3 shadow-2xl ring-1 ring-slate-900/5 grid grid-cols-2 gap-2">
                    <Link
                      href="#presence"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Live Presence</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Real-time VS Code pulse</div>
                      </div>
                    </Link>

                    <Link
                      href="#screens"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center flex-shrink-0 text-indigo-600">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Client Portal</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Passcode status pages</div>
                      </div>
                    </Link>

                    <Link
                      href="#bento"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center flex-shrink-0 text-amber-600">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Stripe Invoicing</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Instant online payment</div>
                      </div>
                    </Link>

                    <Link
                      href="#integrations"
                      onClick={() => setProductMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200/80 flex items-center justify-center flex-shrink-0 text-violet-600">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">Approvals & Sign</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Deliverable sign-offs</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#workflows"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Workflows
            </a>

            <a
              href="#screens"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Inside
            </a>

            <a
              href="#comparison"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Comparison
            </a>

            <a
              href="#testimonials"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Testimonials
            </a>

            <a
              href="#pricing"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
            >
              FAQ
            </a>
          </nav>
        </div>

        {/* Far Right: Sign In & CTA Button */}
        <div className="hidden md:flex items-center gap-3 pointer-events-auto z-10">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-950 font-medium text-white hover:bg-slate-800 h-9 px-4 text-sm transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-colors"
              >
                Sign in
              </Link>

              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-950 font-medium text-white hover:bg-slate-800 h-9 px-4 text-sm transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <span>Start free</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Bar */}
        <div className="flex w-full items-center justify-between md:hidden pointer-events-auto rounded-full border border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-2 shadow-lg">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo className="w-5 h-5 text-slate-950" />
            <span className="font-bold text-sm text-slate-950 font-mono">Frevio</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={isLoggedIn ? '/dashboard' : signupHref}
              className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <span>{isLoggedIn ? 'Dashboard' : 'Start free'}</span>
              <ArrowUpRight className="size-3" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-2xl p-4 shadow-2xl space-y-3 pointer-events-auto animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-1 text-sm text-slate-700">
            <a href="#workflows" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Workflows</a>
            <a href="#screens" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Inside</a>
            <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Comparison</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Testimonials</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">FAQ</a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-xs font-semibold bg-slate-950 text-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  href={signupHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold bg-slate-950 text-white"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
