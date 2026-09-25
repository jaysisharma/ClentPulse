'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Activity, FolderGit2, CheckCircle2, CreditCard, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function SolutionSection({ signupHref }: Props) {
  const containerRef = useRef<HTMLElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Left column text stagger
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. 2x2 cards stagger in
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 35, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: cardsRef.current,
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
      id="solution"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] dark:bg-[#090A0F] border-t border-slate-200/80 dark:border-white/[0.08] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Solution Copy & CTA */}
          <div ref={leftColRef} className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>The Solution</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.03em] text-slate-950 dark:text-white leading-[1.08]">
              One link. <br />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Everything your client needs.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-xl">
              Send a simple, secure link. Your client can track progress, view deliverables, give feedback, approve work, and pay invoices — no account, no confusion.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-medium text-sm transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] group"
              >
                <span>Start free</span>
                <ArrowRight className="w-4 h-4 text-white dark:text-slate-900 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-light">
                Free for 2 active projects · No credit card
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Feature Cards Grid */}
          <div className="lg:col-span-6">
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Track progress */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50/60 dark:hover:bg-[#12141d] shadow-xs dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                  Track progress
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  Show exactly what&apos;s happening in real-time without writing manual update messages.
                </p>
              </div>

              {/* Card 2: View deliverables */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50/60 dark:hover:bg-[#12141d] shadow-xs dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                  View deliverables
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  Access design files, code repositories, builds, and assets organized by milestone.
                </p>
              </div>

              {/* Card 3: Approve work */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50/60 dark:hover:bg-[#12141d] shadow-xs dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                  Approve work
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  Give pinpoint feedback and sign off on completed deliverables with one single click.
                </p>
              </div>

              {/* Card 4: Pay invoices */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1017] border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50/60 dark:hover:bg-[#12141d] shadow-xs dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                  Pay invoices
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  Fast, secure card and bank payments right from the link via official Stripe integration.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
