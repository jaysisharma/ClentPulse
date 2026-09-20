'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const STATS = [
  {
    prefix: '',
    value: 4800,
    suffix: '+',
    display: '4,800+',
    headline: 'Active Practitioners',
    sub: 'Designers, engineers, and studios running client operations on Frevio.',
  },
  {
    prefix: '$',
    value: 12,
    suffix: '.4M',
    display: '$12.4M',
    headline: 'Delivered & Invoiced',
    sub: 'Total milestone value processed through integrated Stripe Rails.',
  },
  {
    prefix: '',
    value: 3,
    suffix: ' Days',
    display: '3 Days',
    headline: 'Average Invoice Settlement',
    sub: 'Down from the freelance industry average of 22 days of chasing.',
  },
]

export function StoryNumbers() {
  const sectionRef = useRef<HTMLElement>(null)
  const counterRefs = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ctx = gsap.context(() => {
      STATS.forEach((stat, i) => {
        const el = counterRefs.current[i]
        if (!el) return

        const obj = { val: 0 }
        gsap.to(obj, {
          val: stat.value,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
          onUpdate: () => {
            const v = Math.round(obj.val)
            const formatted = stat.prefix + (stat.prefix === '$' ? v : v.toLocaleString()) + stat.suffix
            el.textContent = formatted
          },
          onComplete: () => {
            el.textContent = stat.display
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#07080b] py-24 lg:py-32 px-6 border-t border-white/[0.04]"
      aria-label="Metrics and proof"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              05 — The Velocity Numbers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight">
            Measured impact across modern studios.
          </h2>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] p-8 flex flex-col justify-between"
            >
              <div>
                <span
                  ref={(el) => {
                    if (el) counterRefs.current[i] = el
                  }}
                  className="block text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight text-white mb-4"
                  aria-label={stat.display}
                >
                  0
                </span>
                <div className="text-base font-semibold text-slate-200 mb-2">
                  {stat.headline}
                </div>
              </div>

              <p className="text-sm text-slate-400 font-light leading-relaxed pt-4 border-t border-white/[0.04]">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
