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
      <div className="flex h-20 w-full items-center px-5 sm:px-8">
        
        {/* Desktop Pill Nav (Exact Overads Layout & Text) */}
        <div className="mx-auto hidden items-center gap-1.5 rounded-full bg-white/90 py-1.5 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:flex border border-slate-200/80 backdrop-blur-xl pointer-events-auto">
          
          {/* Logo */}
          <Link href="/" className="inline-flex items-center transition-opacity hover:opacity-80 mr-3">
            <Logo className="w-5 h-5 text-slate-950" />
            <span className="ml-2 font-bold text-sm tracking-tight text-slate-950 font-mono">Frevio</span>
          </Link>

          {/* Separator */}
          <span aria-hidden="true" className="mr-2 h-5 w-px bg-slate-200" />

          {/* Navigation Links */}
          <nav className="flex items-center gap-0.5 pr-3 text-sm text-slate-600">
            
            {/* Product Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductMenuOpen(true)}
              onMouseLeave={() => setProductMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProductMenuOpen(!productMenuOpen)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors cursor-pointer"
              >
                <span>Product</span>
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {productMenuOpen && (
                <div className="absolute -left-6 top-full pt-2 z-50 w-[580px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-2xl p-3.5 shadow-2xl ring-1 ring-slate-900/5 grid grid-cols-2 gap-2">
                    
                    <Link
                      href="#workflows"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <Sparkles className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-indigo-600 transition-colors">Workflows</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Tell it once. It runs every week.</span>
                      </div>
                    </Link>

                    <Link
                      href="#screens"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <SlidersHorizontal className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-emerald-600 transition-colors">Ads Manager</span>
                        <span className="mt-0.5 block text-xs text-slate-500">All your ads, one dashboard.</span>
                      </div>
                    </Link>

                    <Link
                      href="#comparison"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Radio className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-amber-600 transition-colors">Signals</span>
                        <span className="mt-0.5 block text-xs text-slate-500">See how AI answers about your brand.</span>
                      </div>
                    </Link>

                    <Link
                      href="#comparison"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <Eye className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-purple-600 transition-colors">Competitors</span>
                        <span className="mt-0.5 block text-xs text-slate-500">See what rivals actually run.</span>
                      </div>
                    </Link>

                    <Link
                      href="#workflows"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                        <Wand2 className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-rose-600 transition-colors">Creative Studio</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Make ad creatives with AI.</span>
                      </div>
                    </Link>

                    <Link
                      href="#integrations"
                      onClick={() => setProductMenuOpen(false)}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="size-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
                        <SendHorizontal className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-slate-950 group-hover:text-cyan-600 transition-colors">Publish</span>
                        <span className="mt-0.5 block text-xs text-slate-500">Write once, post across your channels.</span>
                      </div>
                    </Link>

                  </div>
                </div>
              )}
            </div>

            <a
              className="rounded-full px-3 py-1.5 text-sm text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
              href="#pricing"
            >
              Pricing
            </a>

            <a
              className="rounded-full px-3 py-1.5 text-sm text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
              href="#faq"
            >
              Docs
            </a>
          </nav>

          {/* Sign in */}
          <Link
            href={isLoggedIn ? '/dashboard' : '/auth/login'}
            className="inline-flex h-9 items-center rounded-full px-3 text-sm text-slate-600 hover:text-slate-950 hover:bg-slate-100/70 transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign in'}
          </Link>

          {/* Start Free Button */}
          <Link
            href={signupHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 font-medium text-white hover:bg-slate-800 h-9 px-4 text-sm transition-all hover:scale-[1.02] shadow-sm"
          >
            <span>Start free</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile Header Bar */}
        <div className="flex w-full items-center justify-between md:hidden pointer-events-auto rounded-full border border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-2 shadow-lg">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo className="w-5 h-5 text-slate-950" />
            <span className="font-bold text-sm text-slate-950 font-mono">Frevio</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={signupHref}
              className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <span>Start free</span>
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
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-slate-100">Docs</a>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
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
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
