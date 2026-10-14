'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function FrevioProblem() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const visualCardRef = useRef<HTMLDivElement>(null)
  const legendLeftRef = useRef<HTMLDivElement>(null)
  const legendRightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header scroll entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 2. Centerpiece visual card scale-in & perspective lift
      if (visualCardRef.current) {
        gsap.fromTo(
          visualCardRef.current,
          {
            scale: 0.92,
            opacity: 0,
            y: 40,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: visualCardRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Subtle scrub zoom on scroll
        gsap.fromTo(
          visualCardRef.current.querySelector('img'),
          { scale: 1.05 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: visualCardRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // 3. Bottom legend cards stagger in
      if (legendLeftRef.current && legendRightRef.current) {
        gsap.fromTo(
          [legendLeftRef.current, legendRightRef.current],
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: legendLeftRef.current,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="problem" className="py-16 md:py-24 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header: Minimal & Direct */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-xs font-mono uppercase tracking-[0.16em] text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>The Fragmented Reality</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Client work gets messy when it’s everywhere.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Updates in WhatsApp. Feedback in 20-reply email chains. Files lost in Google Drive. Invoices disconnected from progress.
          </p>
        </div>

        {/* ── Centerpiece Visual: Chaos vs. Frevio Clarity ── */}
        <div
          ref={visualCardRef}
          className="relative rounded-2xl border border-white/[0.12] bg-[#0c0d14] overflow-hidden shadow-2xl will-change-transform"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[16/8.5] bg-[#07080c] overflow-hidden">
            <img
              src="/client_chaos_vs_calm.png"
              alt="Visual comparison: Scattered fragmented communication vs centralized Frevio client portal link"
              className="w-full h-full object-cover object-center will-change-transform"
            />
          </div>

          {/* Visual Legend / Breakdown Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] bg-[#090a0f] border-t border-white/[0.08]">
            <div ref={legendLeftRef} className="p-4 sm:p-5 flex items-start gap-3">
              <span className="size-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                  Scattered Communication
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Lost feedback in chat apps, duplicate emails, awkward payment chasing, and constant &ldquo;where are we on this?&rdquo; messages.
                </p>
              </div>
            </div>

            <div ref={legendRightRef} className="p-4 sm:p-5 flex items-start gap-3">
              <span className="size-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Centralized Frevio Link
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  One clean project URL protected by a 6-digit passcode. Milestones, updates, deliverables, and Stripe billing in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
