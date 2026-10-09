'use client'

import React from 'react'

const STUDIOS = [
  'STUDIO FORMA',
  'KOTO CRAFT',
  'ACRE CREATIVE',
  'MONO WORKS',
  'VEKTOR LABS',
  'NORTH & CO',
  'OASIS DIGITAL',
  'KINETIC DESIGN',
  'PARALLEL STUDIO',
  'VERTEX AGENCY',
]

/**
 * Linear-style infinite studio marquee ticker.
 * Smooth 60fps continuous horizontal crawl.
 */
export function ClientProofTicker() {
  return (
    <div className="border-y border-white/[0.08] bg-[#08090A] py-6 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8A8F98]/70">
          Trusted by independent designers & creative studios globally
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Gradient edge fades */}
        <div className="absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-[#08090A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-[#08090A] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 animate-marquee gap-12 sm:gap-16 items-center">
          {STUDIOS.concat(STUDIOS).map((studio, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm font-mono tracking-widest text-[#8A8F98]/40 hover:text-white transition-colors whitespace-nowrap"
            >
              {studio}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
