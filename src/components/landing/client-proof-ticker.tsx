'use client'

import React from 'react'

export function ClientProofTicker() {
  const PROOF_METRICS = [
    { label: '$4.8M+ CLIENT PAYMENTS SETTLED', highlight: 'VIA STRIPE' },
    { label: '1,400+ ACTIVE FREELANCERS & STUDIOS', highlight: 'WORLDWIDE' },
    { label: '78% FASTER DELIVERABLE APPROVALS', highlight: '1-CLICK' },
    { label: '0 LATE-NIGHT WHATSAPP CHASES', highlight: 'PROTECTED' },
    { label: '0% FREVIO PLATFORM COMMISSION', highlight: 'DIRECT PAY' },
    { label: 'STUDIO FORMA · KOTO CRAFT · ACRE CREATIVE · MONO WORKS', highlight: 'TOP TEAMS' },
  ]

  return (
    <div className="border-y border-white/[0.08] bg-[#08090A] py-5 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 mb-2.5 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8A8F98]">
          Proven across independent designers, developers, & boutique studios
        </p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Edge fades */}
        <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#08090A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#08090A] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 animate-marquee gap-8 sm:gap-12 items-center">
          {PROOF_METRICS.concat(PROOF_METRICS).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-xs font-mono tracking-wider text-[#8A8F98]/70 hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-white/90 font-medium">{item.label}</span>
              <span className="text-[10px] text-[#5E6AD2] font-semibold border border-[#5E6AD2]/30 px-1.5 py-0.5 rounded">
                {item.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
