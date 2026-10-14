'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface FrevioCtaProps {
  signupHref: string
}

export function FrevioCta({ signupHref }: FrevioCtaProps) {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 bg-[#0c0d12] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.01] shadow-xs cursor-pointer"
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
