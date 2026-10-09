'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

interface CinematicCtaProps {
  signupHref: string
}

export function CinematicCta({ signupHref }: CinematicCtaProps) {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-[#08090A] border-t border-white/[0.08] text-[#F3F4F6] overflow-hidden">
      {/* Ambient background glows: Linear electric indigo & cyan */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#5E6AD2]/20 via-[#818CF8]/15 to-[#38BDF8]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Kicker (NO chips) */}
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#5E6AD2] mb-6 font-semibold">
          Get Started in 2 Minutes
        </div>

        {/* Monumental Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[-0.035em] text-white leading-[1.08] max-w-4xl mx-auto">
          Make working with your clients{' '}
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] via-[#818CF8] to-[#38BDF8]">
            feel effortless.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#8A8F98] font-normal leading-relaxed max-w-2xl mx-auto">
          Give your clients one polished workspace for deliverables, updates, and payments. Stop chasing emails and start delivering with calm clarity.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold text-white bg-[#5E6AD2] hover:bg-[#6875E3] shadow-[0_0_28px_rgba(94,106,210,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start free — No card needed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] transition-all cursor-pointer"
          >
            <span>Explore live demo</span>
          </Link>
        </div>

        {/* Trust Badges below (Plain text & icons, NO chips) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[#8A8F98]">
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Free 2-client tier forever
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Zero setup fee
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Direct Stripe deposits
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            No client login required
          </span>
        </div>
      </div>
    </section>
  )
}
