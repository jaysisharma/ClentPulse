'use client'

import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
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
    <section id="testimonials" className="py-24 lg:py-32 px-5 sm:px-8 bg-white border-t border-slate-200/80 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
            Built for freelancers, <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-900">by freelancers</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Real feedback from independent developers, designers and small studios around the world.
          </p>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-3xl bg-[#FAFAFC] border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow relative"
            >
              {/* Star Rating */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${t.badgeColor}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
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
