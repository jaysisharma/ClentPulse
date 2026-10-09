'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { HaikeiLayeredWaves, HaikeiDotMatrix } from '@/components/ui/haikei-backgrounds'

interface CinematicCtaProps {
  signupHref: string
}

export function CinematicCta({ signupHref }: CinematicCtaProps) {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Haikei background patterns */}
      <HaikeiDotMatrix className="absolute inset-0 w-full h-full pointer-events-none" opacity={0.05} />
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-25 pointer-events-none overflow-hidden">
        <HaikeiLayeredWaves className="w-full h-full object-cover" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Kicker (NO chips) */}
        <div className="text-xs font-mono uppercase tracking-[0.25em] text-indigo-400 mb-6 font-semibold">
          Get Started in 2 Minutes
        </div>

        {/* Monumental Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[-0.035em] text-[#F5F5F3] leading-[1.08] max-w-4xl mx-auto">
          Make working with your clients{' '}
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300">
            feel effortless.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#A1A5AD] font-normal leading-relaxed max-w-2xl mx-auto">
          Give your clients one polished workspace for deliverables, updates, and payments. Stop chasing emails and start delivering with calm clarity.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start free — No card needed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-medium text-[#F5F5F3] bg-[#17191D] hover:bg-[#1E2126] border border-[#2A2D33] hover:border-indigo-500/40 transition-all cursor-pointer"
          >
            <span>Explore live demo</span>
          </Link>
        </div>

        {/* Trust Badges below (Plain text & icons, NO chips) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[#A1A5AD]/80">
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#34D399]" />
            Free 2-client tier forever
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#34D399]" />
            Zero setup fee
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#34D399]" />
            Direct Stripe deposits
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#34D399]" />
            No client login required
          </span>
        </div>
      </div>
    </section>
  )
}
