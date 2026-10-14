'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
  ArrowUpRight, ChevronDown, Sparkles, Copy, Check, Menu, X,
  Radio, Globe, CreditCard, CheckCircle2, FileSignature, Clock, ShieldCheck
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
      {/* ── Top Announcement Banner ── */}
      {promoRemaining !== null && promoRemaining > 0 && (
        <div className="relative z-50 bg-[#08090a] text-slate-200 border-b border-white/5 text-xs py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-x-3 text-center flex-wrap gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-normal text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              First 50 users get <strong className="text-white font-semibold">1 Month of Frevio Pro FREE</strong> ({promoRemaining} left).
            </span>
            <button
              onClick={copyCoupon}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/15 bg-white/5 font-mono text-[11px] text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copiedCoupon ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              EARLY50
            </button>
            <Link href={signupHref} className="inline-flex items-center gap-0.5 text-white font-medium underline underline-offset-4 hover:text-amber-200 transition-colors">
              Claim <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Floating Header ── */}
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto">

          {/* Desktop Pill Nav */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-[#0b0c10]/85 backdrop-blur-xl py-1.5 pl-4 pr-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/5 mx-auto">
            <Link href="/" className="flex items-center gap-2 mr-2 group">
              <Logo className="w-6 h-6 transition-transform group-hover:scale-105" />
              <span className="font-bold text-sm tracking-tight text-white">Frevio</span>
            </Link>

            <span className="h-4 w-px bg-white/10 mx-1" />

            <nav className="flex items-center gap-1 text-sm text-slate-300">
              {/* Product Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductMenuOpen(true)}
                onMouseLeave={() => setProductMenuOpen(false)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Features
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {productMenuOpen && (
                  <div className="absolute left-0 top-full pt-2 z-50 w-[420px] animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="rounded-2xl border border-white/10 bg-[#0e0f15]/95 backdrop-blur-2xl p-3 shadow-2xl ring-1 ring-white/5 grid grid-cols-2 gap-1.5">
                      <Link
                        href="#presence"
                        className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                          <Radio className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">Live Presence</div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Real-time VS Code pulse</div>
                        </div>
                      </Link>

                      <Link
                        href="#screens"
                        className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">Client Portal</div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Passcode status pages</div>
                        </div>
                      </Link>

                      <Link
                        href="#bento"
                        className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">Stripe Invoicing</div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Instant online payment</div>
                        </div>
                      </Link>

                      <Link
                        href="#integrations"
                        className="p-2.5 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">Approvals & Sign</div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">Deliverable sign-offs</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <a href="#workflows" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                Workflows
              </a>
              <a href="#screens" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                Inside
              </a>
              <a href="#comparison" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                Comparison
              </a>
              <a href="#testimonials" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="px-3 py-1.5 rounded-full text-xs font-medium hover:text-white hover:bg-white/5 transition-colors">
                FAQ
              </a>
            </nav>

            <span className="h-4 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1.5 pl-1">
              <Link
                href={isLoggedIn ? '/dashboard' : '/auth/login'}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {isLoggedIn ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-1 bg-white text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm"
              >
                Get started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Header Bar */}
          <div className="flex md:hidden w-full items-center justify-between rounded-full border border-white/10 bg-[#0b0c10]/90 backdrop-blur-xl px-4 py-2 shadow-xl">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-bold text-sm text-white">Frevio</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={signupHref}
                className="bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-semibold"
              >
                Start free
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-slate-300 hover:text-white"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#0b0c10]/95 backdrop-blur-2xl p-4 shadow-2xl space-y-3 pointer-events-auto animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-1 text-sm text-slate-200">
              <a href="#workflows" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Workflows</a>
              <a href="#screens" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Inside</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Comparison</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Testimonials</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">FAQ</a>
            </nav>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                href={isLoggedIn ? '/dashboard' : '/auth/login'}
                className="text-center py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Sign in'}
              </Link>
              <Link
                href={signupHref}
                className="text-center py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-900"
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
