'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react'
import { StripeIcon } from '@/components/ui/brand-icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const [copied, setCopied] = useState(false)
  const [approved, setApproved] = useState(true)

  const handleCopy = () => {
    navigator.clipboard?.writeText?.('https://frevio.cloud/p/acme-rebrand')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. 3 Cards Stagger
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 45, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.16,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 3. Smooth fill of the progress bar in Card 2
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { width: '0%' },
          {
            width: '75%',
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: progressBarRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] dark:bg-[#090A0F] border-t border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/[0.02] dark:bg-indigo-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 lg:space-y-20 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>See How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 dark:text-white leading-[1.08]">
            A simple experience <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">for both sides</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            Zero client training. Zero software for them to install. Just one living link where everything lives from kickoff to final payout.
          </p>
        </div>

        {/* 3 Steps Workflow Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
          
          {/* ────────────────────────────────────────────── */}
          {/* STEP 1: You send a link */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0e1017] rounded-[28px] border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-2xl hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.09)] dark:hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-semibold group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 dark:group-hover:text-white transition-colors">
                  1
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 01</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white tracking-tight">
                You send a link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Create a project and share a passcode-protected link with your client.
              </p>
            </div>

            {/* Real Product Slice: Share & Passcode Window */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#131622] p-4 space-y-3.5 shadow-inner">
                
                {/* Browser-style address pill */}
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-rose-400/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 ml-2 truncate">portal.frevio.cloud</span>
                </div>

                {/* URL Bar with Copy Button */}
                <div className="flex items-center justify-between bg-white dark:bg-[#0e1017] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm text-xs">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 flex-shrink-0 animate-pulse" />
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] truncate">
                      frevio.cloud/p/acme
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-white/10 dark:hover:bg-white/15 transition-all flex-shrink-0 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-scale-in" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Passcode & Status */}
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <Lock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>Passcode: <strong className="text-slate-700 dark:text-white font-mono">4892</strong></span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    PIN Protected
                  </span>
                </div>

                {/* Recipient status */}
                <div className="pt-1 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                  <span>Client access</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">No account required</span>
                </div>

              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────── */}
          {/* STEP 2: Client views project */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0e1017] rounded-[28px] border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-2xl hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.09)] dark:hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-semibold group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 dark:group-hover:text-white transition-colors">
                  2
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 02</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white tracking-tight">
                Client views project
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                They can see progress, deliverables, give feedback and approve work.
              </p>
            </div>

            {/* Real Product Slice: Client Portal Milestone & Sign-off */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#131622] p-4 space-y-3.5 shadow-inner">
                
                {/* Milestone Title + Sign-off Pill */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Deliverable #02
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Brand Guidelines v2.4
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApproved(!approved)}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 shadow-sm active:scale-95 ${
                      approved
                        ? 'text-emerald-700 bg-emerald-100/90 border-emerald-200/70 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                        : 'text-amber-700 bg-amber-100/90 border-amber-200/70 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{approved ? 'Approved' : 'In Review'}</span>
                  </button>
                </div>

                {/* Authentic Client Feedback Quote */}
                <div className="bg-white dark:bg-[#0e1017] p-3 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        S
                      </div>
                      <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        Sarah · <span className="text-slate-400 font-normal">Client PM</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug pl-1">
                    &ldquo;This looks great! Approved to move forward. 👍&rdquo;
                  </p>
                </div>

                {/* Live Progress Bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Sprint Progress</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      ref={progressBarRef}
                      className="bg-emerald-500 h-full w-[75%] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────── */}
          {/* STEP 3: Get paid faster */}
          {/* ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0e1017] rounded-[28px] border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-2xl hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.09)] dark:hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            
            {/* Step Meta Header */}
            <div className="p-7 pb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-semibold group-hover:bg-[#635BFF] transition-colors">
                  3
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">STEP 03</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white tracking-tight">
                Get paid faster
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Create an invoice and your client can pay securely via Stripe.
              </p>
            </div>

            {/* Real Product Slice: Stripe Invoice Card */}
            <div className="p-5 pt-0">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#131622] p-4 space-y-3.5 shadow-inner">
                
                {/* Invoice ID & Due Tag */}
                <div className="flex items-center justify-between text-xs">
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    #INV-0012
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-500/20">
                    Milestone 2
                  </span>
                </div>

                {/* Amount Due Card */}
                <div className="bg-white dark:bg-[#0e1017] p-3 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Due</div>
                    <div className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">$3,200.00</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/20 font-semibold">
                      Due on sign-off
                    </span>
                  </div>
                </div>

                {/* 1-Click Pay with Stripe Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5349e0] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-[0.98] group/btn"
                >
                  <StripeIcon className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                  <span>Pay with Stripe</span>
                </button>

                {/* Payout reassurance */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400 animate-bounce" />
                  <span>Instant deposit to your bank account</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
