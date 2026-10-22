'use client'

import { useEffect, useRef } from 'react'
import { Radio, Shield, CreditCard, ArrowRight, CheckCircle2, Clock, Check, Terminal, Zap } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function OveradsWhySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressTextRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Container reveal on scroll
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. Header text reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 3. Staggered reveal for the 3 editorial cards
      gsap.fromTo(
        '.why-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.why-card-grid',
            start: 'top 85%',
            once: true,
          },
        }
      )

      // 4. Interactive progress bar growth on scroll
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

      // 5. Progress number counter 0% -> 75%
      if (progressTextRef.current) {
        const counter = { val: 0 }
        gsap.to(counter, {
          val: 75,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: progressTextRef.current,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (progressTextRef.current) {
              progressTextRef.current.textContent = `${Math.round(counter.val)}%`
            }
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="why" className="px-3 py-4 md:px-6 md:py-8 bg-[#08090a]">
      <div ref={containerRef} className="overflow-hidden rounded-[28px] md:rounded-[36px] bg-[#0c0d12] border border-white/10 shadow-2xl p-7 sm:p-12 md:p-16">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl space-y-4 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <span>Why Frevio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-white leading-tight">
            <span className="block">Write the code. Keep clients calm.</span>
            <span className="block text-slate-300 font-normal">Get paid on time.</span>
          </h2>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-400">
            Stream live presence directly from VS Code, share passcode-locked status pages, and collect invoice payments through Stripe. Everything in one place so you never answer &ldquo;any updates?&rdquo; texts at 11 PM again.
          </p>
        </div>

        {/* 3 Editorial Cards Grid */}
        <div className="why-card-grid grid gap-6 md:grid-cols-3 items-stretch">
          
          {/* Card 1: Write the code */}
          <article className="why-card group relative flex flex-col justify-between rounded-2xl bg-[#12131a] border border-white/5 p-6 hover:border-white/15 transition-all duration-300 shadow-sm">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-medium text-white tracking-tight">Stream live presence</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Link VS Code in 10 seconds. Frevio pulses your active focus area, pauses on idle, and consolidates sessions into clean billable time entries.
              </p>
            </div>

            {/* Embedded Live Graphic */}
            <div className="mt-8 rounded-xl border border-white/10 bg-[#08090d] p-4 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-sans">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Active Now
                </span>
                <span className="text-slate-400">VS Code Extension</span>
              </div>
              <div className="py-3 space-y-1.5">
                <div className="text-white font-medium">Focus: Stripe Webhook & Auth</div>
                <div className="text-slate-400 text-[11px]">Last keystroke: 42s ago</div>
              </div>
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Consolidated time:</span>
                <span className="text-indigo-300 font-semibold font-sans">14.2 hrs logged</span>
              </div>
            </div>
          </article>

          {/* Card 2: Keep clients calm */}
          <article className="why-card group relative flex flex-col justify-between rounded-2xl bg-[#12131a] border border-white/5 p-6 hover:border-white/15 transition-all duration-300 shadow-sm">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-medium text-white tracking-tight">Passcode status pages</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Clients open a branded link to track milestones, view weekly progress notes, and leave instant reactions without signing up for yet another account.
              </p>
            </div>

            {/* Embedded Live Graphic */}
            <div className="mt-8 rounded-xl border border-white/10 bg-[#08090d] p-4 text-xs shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Project Status</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">On Track</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Milestone progress</span>
                  <span ref={progressTextRef} className="font-semibold text-indigo-400">75%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div ref={progressBarRef} className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-2.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-300 truncate mr-2">&ldquo;Looking great, approved v2!&rdquo;</span>
                <span className="text-emerald-400 font-semibold">👍 Client</span>
              </div>
            </div>
          </article>

          {/* Card 3: Get paid on time */}
          <article className="why-card group relative flex flex-col justify-between rounded-2xl bg-[#12131a] border border-white/5 p-6 hover:border-white/15 transition-all duration-300 shadow-sm">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-medium text-white tracking-tight">One-click Stripe payouts</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Generate professional invoices directly from logged time. Send one secure payment link and get paid directly into your bank via Stripe.
              </p>
            </div>

            {/* Embedded Live Graphic */}
            <div className="mt-8 rounded-xl border border-white/10 bg-[#08090d] p-4 text-xs shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-400 text-[11px]">INV-2026-084</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Paid via Stripe</span>
              </div>
              <div className="flex items-baseline justify-between py-1">
                <span className="text-2xl font-bold text-white">$4,850.00</span>
                <span className="text-[11px] text-slate-400">32.0 hrs @ $150/hr</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Apple Pay / Card</span>
                <span className="text-indigo-400">Auto-reconciled</span>
              </div>
            </div>
          </article>

        </div>

      </div>
    </section>
  )
}
