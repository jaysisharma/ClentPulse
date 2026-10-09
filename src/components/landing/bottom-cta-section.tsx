'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Play, Sparkles } from 'lucide-react'
import { HaikeiLayeredWaves } from '@/components/ui/haikei-backgrounds'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function BottomCtaSection({ signupHref }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      {/* Haikei Layered Waves Horizon */}
      <HaikeiLayeredWaves className="absolute inset-x-0 bottom-0 w-full h-[450px]" opacity={0.08} />

      <div
        ref={contentRef}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        {/* Subtle pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A7B8FF] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#A7B8FF]" />
          <span>Get Started in 2 Minutes</span>
        </div>

        {/* Editorial Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12] max-w-3xl mx-auto">
          Make working with your clients <br />
          <span className="font-normal text-[#A7B8FF]">
            feel effortless.
          </span>
        </h2>

        {/* Supporting copy */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
          Give every project a clearer home and every client a better experience.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#A7B8FF] text-[#101113] hover:bg-[#b8c6ff] h-11 px-7 text-sm font-semibold transition-all hover:scale-[1.03] shadow-md shadow-[#A7B8FF]/10 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="w-4 h-4 text-[#101113]" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] hover:bg-[#1E2126] text-[#F5F5F3] border border-[#2A2D33] h-11 px-6 text-sm font-medium transition-all hover:border-[#A7B8FF]/40 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#9BCDBF] fill-current" />
            <span>Explore the demo</span>
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#A1A5AD]/80 font-mono">
          Free plan includes up to 2 active client workspaces. No credit card required.
        </p>
      </div>
    </section>
  )
}
