'use client'

import Link from 'next/link'
import { ArrowUpRight, Play, Sparkles } from 'lucide-react'
import { HaikeiLayeredWaves } from '@/components/ui/haikei-backgrounds'

interface Props {
  signupHref: string
}

export function BottomCtaSection({ signupHref }: Props) {
  return (
    <section className="py-20 md:py-32 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden">
      {/* Haikei Layered Waves Horizon */}
      <HaikeiLayeredWaves className="absolute inset-x-0 bottom-0 w-full h-[450px]" opacity={0.08} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#A7B8FF] text-[#101113] hover:bg-[#b8c6ff] h-11 px-7 text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm"
          >
            <span>Start free</span>
            <ArrowUpRight className="w-4 h-4 text-[#101113]" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] hover:bg-[#1E2126] text-[#F5F5F3] border border-[#2A2D33] h-11 px-6 text-sm font-medium transition-all"
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
