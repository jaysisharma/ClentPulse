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
    <div className="border-y border-[#2A2D33]/60 bg-[#0e0f12] py-6 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#A1A5AD]/60">
          Trusted by independent designers & creative studios globally
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Gradient edge fades */}
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#0e0f12] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#0e0f12] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 animate-marquee gap-12 sm:gap-16 items-center">
          {STUDIOS.concat(STUDIOS).map((studio, idx) => (
            <span
              key={idx}
              className="text-xs sm:text-sm font-mono tracking-widest text-[#A1A5AD]/40 hover:text-[#F5F5F3] transition-colors whitespace-nowrap"
            >
              {studio}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
