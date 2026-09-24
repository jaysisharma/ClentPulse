'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface Props {
  signupHref: string
}

export function BottomCtaSection({ signupHref }: Props) {
  return (
    <section className="py-24 lg:py-32 px-5 sm:px-8 bg-[#090A0F] text-white border-t border-white/[0.08] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
          <span>Work smarter. Look more professional.</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.03em] text-white leading-[1.08]">
          Give every client a better <br className="hidden sm:inline" />
          <span className="font-semibold text-slate-100">way to work with you.</span>
        </h2>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
          Start for free. No credit card required. Share your first project link in less than 2 minutes.
        </p>

        {/* CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={signupHref}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-medium text-sm transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
          >
            <span>Start free</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </Link>
        </div>

        {/* Reassurance pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-light">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>2 projects free forever</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant client portal setup</span>
          </div>
        </div>

      </div>
    </section>
  )
}
