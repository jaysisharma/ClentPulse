'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

interface Props {
  signupHref: string
}

export function StoryCta({ signupHref }: Props) {
  return (
    <section
      className="relative bg-[#07080b] py-24 sm:py-32 px-6 overflow-hidden flex flex-col items-center justify-center text-center border-t border-white/[0.04]"
      aria-label="Call to action"
    >
      {/* Ambient specular light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.02) 65%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Micro-label */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300 font-medium">
            Activation in Minutes
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-white leading-tight mb-6">
          Your next client portal is{' '}
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            8 minutes away.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 font-light max-w-xl leading-relaxed mb-10">
          Create your first project, share the link, and present an experience that positions you in the top 1% of independent professionals.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full max-w-sm">
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] transition-all cursor-pointer"
          >
            Start free — No credit card
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/20 bg-white/[0.02] transition-all"
          >
            See client demo
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-indigo-400" />
            <span>2 free active projects forever</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full Stripe integration included</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-indigo-400" />
            <span>Encrypted passcode security</span>
          </div>
        </div>
      </div>
    </section>
  )
}
