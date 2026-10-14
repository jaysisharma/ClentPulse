'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface FrevioCtaProps {
  signupHref: string
}

export function FrevioCta({ signupHref }: FrevioCtaProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 sm:px-6 bg-[#0c0d12] border-t border-white/[0.06] overflow-hidden relative">
      {/* Subtle ambient glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div ref={contentRef} className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        
        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal text-white tracking-[-0.03em] leading-[1.08] text-balance">
          Give every client project a clearer home.
        </h2>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-xl mx-auto text-balance">
          Start with your first project, invite your client, and experience a more organized way to work.
        </p>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={signupHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.01] shadow-lg shadow-white/5 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quiet Reassurance */}
        <p className="pt-2 text-xs text-slate-400 font-light">
          Free for up to 2 active projects · No credit card required · Instant setup
        </p>

      </div>
    </section>
  )
}
