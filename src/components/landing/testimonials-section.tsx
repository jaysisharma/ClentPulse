'use client'

import { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function TestimonialsSection() {
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. 3 Testimonial Cards Stagger
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 45, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.14,
            duration: 0.8,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const testimonials = [
    {
      quote:
        'Frevio completely changed how I work with clients. No more endless update messages at midnight. Clients just open their link and see exactly what got shipped today.',
      name: 'Rohan K.',
      role: 'Full-stack Developer',
      initials: 'RK',
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      quote:
        'I close projects faster and get paid sooner. The client portal looks super professional, and my clients consistently comment on how smooth and transparent it feels.',
      name: 'Priya S.',
      role: 'Product Designer',
      initials: 'PS',
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      quote:
        'Finally, everything in one place. My clients love how easy it is to follow the progress and sign off on deliverables without having to create an account or learn another app.',
      name: 'Arun T.',
      role: 'Freelance Studio Owner',
      initials: 'AT',
      badgeColor: 'bg-emerald-600 text-white',
    },
  ]

  return (
    <section
      ref={containerRef}
      id="testimonials"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#07080D] border-t border-white/[0.08] text-white relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-rose-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white leading-[1.08]">
            Built for freelancers, <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-200">by freelancers</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            Real feedback from independent developers, designers and small studios around the world.
          </p>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl flex flex-col justify-between space-y-6 hover:border-white/20 hover:-translate-y-1.5 transition-all duration-300 relative group"
            >
              {/* Star Rating */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-300 font-light leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${t.badgeColor} group-hover:scale-110 transition-transform`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm group-hover:text-indigo-400 transition-colors">{t.name}</div>
                  <div className="text-xs text-slate-400 font-light">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
