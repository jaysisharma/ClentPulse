'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
  ArrowUpRight, ChevronDown, Sparkles, Copy, Check, Menu, X,
  Radio, Globe, CreditCard, CheckCircle2, Clock
} from 'lucide-react'

interface Props {
  isLoggedIn: boolean
  signupHref: string
  promoRemaining: number | null
}

export function OveradsNavbar({ isLoggedIn, signupHref, promoRemaining }: Props) {
  const [productMenuOpen, setProductMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  function copyCoupon() {
    navigator.clipboard.writeText('EARLY50')
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  return (
    <>
      {/* ── Top Announcement Banner (Light Theme) ── */}
      {promoRemaining !== null && promoRemaining > 0 && (
        <div className="relative z-50 bg-slate-50 text-slate-700 border-b border-slate-200/80 text-xs py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-x-3 text-center flex-wrap gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-normal text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              First 50 users get <strong className="text-slate-900 font-semibold">1 Month of Frevio Pro FREE</strong> ({promoRemaining} left).
            </span>
            <button
              onClick={copyCoupon}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-300 bg-white font-mono text-[11px] text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedCoupon ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              EARLY50
            </button>
            <Link href={signupHref} className="inline-flex items-center gap-0.5 text-slate-900 font-medium underline underline-offset-4 hover:text-indigo-600 transition-colors">
              Claim <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Floating Header ── */}
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">

          {/* Desktop Pill Nav (Light Mode Glass) */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 backdrop-blur-xl py-1.5 pl-4 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 mx-auto">
            <Link href="/" className="flex items-center gap-2 mr-2 group">
              <Logo className="w-6 h-6 transition-transform group-hover:scale-105" />
              <span className="font-bold text-sm tracking-tight text-slate-950">Frevio</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 mx-1" />

            <nav className="flex items-center gap-1 text-sm text-slate-600">
              {/* Product Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductMenuOpen(true)}
                onMouseLeave={() => setProductMenuOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  Features
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {productMenuOpen && (
                  <div className="absolute left-0 top-full pt-2 z-50 w-[420px] animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-3 shadow-xl ring-1 ring-slate-900/5 grid grid-cols-2 gap-1.5">
                      <Link
                        href="#presence"
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
                        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center flex-shrink-0 text-indigo-600">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Client Portal</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Passcode status pages</div>
                        </div>
                      </Link>

                      <Link
                        href="#bento"
                        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center flex-shrink-0 text-amber-600">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Stripe Invoicing</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">Instant online payment</div>
                        </div>
                      </Link>

                      <Link
                        href="#integrations"
                        className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200/80 flex items-center justify-center flex-shrink-0 text-violet-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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

              <a href="#workflows" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                Workflows
              </a>
              <a href="#screens" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                Inside
              </a>
              <a href="#comparison" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                Comparison
              </a>
              <a href="#testimonials" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors">
                FAQ
              </a>
            </nav>

            <span className="h-4 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-1.5 pl-1">
              <Link
                href={isLoggedIn ? '/dashboard' : '/auth/login'}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-colors"
              >
                {isLoggedIn ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1 bg-slate-950 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-xs"
              >
                Get started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Header Bar */}
          <div className="flex md:hidden w-full items-center justify-between rounded-full border border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-2 shadow-lg">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-bold text-sm text-slate-950">Frevio</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={signupHref}
                className="bg-slate-950 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-slate-800"
              >
                Start free
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-slate-600 hover:text-slate-950 cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-4 shadow-xl space-y-3 pointer-events-auto animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-1 text-sm text-slate-700">
              <a href="#workflows" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Workflows</a>
              <a href="#screens" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Inside</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Comparison</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Testimonials</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">FAQ</a>
            </nav>
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <Link
                href={isLoggedIn ? '/dashboard' : '/auth/login'}
                className="text-center py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Sign in'}
              </Link>
              <Link
                href={signupHref}
                className="text-center py-2.5 rounded-xl text-xs font-semibold bg-slate-950 text-white"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
