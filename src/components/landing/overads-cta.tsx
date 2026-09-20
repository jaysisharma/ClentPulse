'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function OveradsCta({ signupHref }: Props) {
  const containerRef = useRef<HTMLElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { y: 30, scale: 0.96, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bannerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.8, opacity: 0.1 },
          {
            scale: 1.2,
            opacity: 0.25,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bannerRef.current,
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
    <section ref={containerRef} className="px-3 py-12 md:px-6 md:py-20 bg-white border-t border-slate-200/80">
      <div
        ref={bannerRef}
        className="max-w-5xl mx-auto rounded-[28px] md:rounded-[36px] bg-gradient-to-b from-slate-50 via-white to-slate-50 border border-slate-200 p-10 sm:p-16 text-center space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden"
      >
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/8 blur-[130px] rounded-full"
        />
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 font-semibold">
          <span>Get Started</span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-slate-950 leading-[0.98]">
          Your client work runs itself. You just approve.
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 font-light leading-relaxed">
          Set up your first project in five minutes. Connect your tools and send your first client status link today. Free forever.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signupHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-8 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-lg shadow-slate-950/15 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
