'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'

interface CinematicCtaProps {
  signupHref: string
}

export function CinematicCta({ signupHref }: CinematicCtaProps) {
  const router = useRouter()
  const [clientName, setClientName] = useState('')

  const clientSlug = clientName.trim()
    ? clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : 'your-client'

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault()
    // Append client preview slug to signup url
    const target = signupHref.includes('?')
      ? `${signupHref}&client=${encodeURIComponent(clientSlug)}`
      : `${signupHref}?client=${encodeURIComponent(clientSlug)}`
    router.push(target)
  }

  return (
    <section className="relative py-24 sm:py-32 lg:py-36 bg-[#08090A] border-t border-white/[0.08] text-[#F3F4F6] overflow-hidden">
      {/* Restrained subtle dark ambient radial glow (No rainbow gradients) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#5E6AD2]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Kicker */}
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#5E6AD2] mb-4 font-semibold">
          Ready to eliminate client chaos?
        </div>

        {/* Monumental Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.035em] text-white leading-[1.12]">
          Your next client project deserves a calmer operating system.
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-[#8A8F98] font-normal leading-relaxed max-w-2xl mx-auto">
          Lock in upfront deposits, get 1-click deliverable sign-offs, and stop answering 11 PM WhatsApp status inquiries.
        </p>

        {/* High-Converting Client Portal Generator Hook */}
        <div className="mt-10 max-w-xl mx-auto p-2 sm:p-2.5 rounded-2xl bg-[#0E1013] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <form onSubmit={handleLaunch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl bg-[#08090A] border border-white/[0.08] focus-within:border-[#5E6AD2]/60 transition-colors">
              <span className="text-xs font-mono text-[#8A8F98] select-none mr-1.5">frevio.cloud/p/</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="nike, acme, or studio"
                className="w-full bg-transparent text-xs font-mono text-white placeholder:text-[#8A8F98]/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white bg-[#5E6AD2] hover:bg-[#6875E3] transition-all cursor-pointer whitespace-nowrap shadow-[0_0_16px_rgba(94,106,210,0.35)]"
            >
              <span>Create client portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] font-mono text-[#8A8F98]">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Direct Stripe payouts · 0% commission
            </span>
            <span>Free for 2 clients forever</span>
          </div>
        </div>

        {/* Secondary explore demo link */}
        <div className="mt-6">
          <Link
            href="/demo"
            className="text-xs font-mono text-[#8A8F98] hover:text-white transition-colors underline underline-offset-4"
          >
            Or test-drive the live client portal demo first →
          </Link>
        </div>

        {/* Trust Badges below */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[#8A8F98]">
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Free 2-client tier forever
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Direct Stripe deposits
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            Zero client logins needed
          </span>
        </div>
      </div>
    </section>
  )
}
