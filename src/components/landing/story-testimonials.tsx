'use client'

import { Quote, Star } from 'lucide-react'

const QUOTES = [
  {
    id: '1',
    quote:
      'Clients completely stopped asking "where are we on the redesign?" because they have a live link with real-time milestones. It saved me at least 6 unbillable hours every single week.',
    author: 'Alex Rivera',
    role: 'Senior Product Designer',
    company: 'Studio Mono',
    outcome: 'Saved 6 hrs/week',
  },
  {
    id: '2',
    quote:
      'As a client managing four different agencies, Frevio is a breath of fresh air. I no longer dig through 40-message email chains to find deliverable links or invoice receipts.',
    author: 'Claire Sterling',
    role: 'VP of Marketing',
    company: 'VenturePulse',
    outcome: 'Zero Email Chasing',
  },
  {
    id: '3',
    quote:
      'The milestone invoice trigger is pure magic. A deliverable gets approved on Friday afternoon, and the Stripe invoice is settled by Friday evening without any chasing.',
    author: 'Marcus Webb',
    role: 'Full-Stack Engineer',
    company: 'Webb Systems',
    outcome: 'Paid Within 24h',
  },
]

export function StoryTestimonials() {
  return (
    <section
      id="testimonials"
      className="relative bg-[#090A0F] py-24 lg:py-32 px-6 border-t border-white/[0.04]"
      aria-label="Client and freelancer testimonials"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              06 — Authentic Outcomes
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight">
            How transparency transforms client relationships.
          </h2>
        </div>

        {/* 3-Column Editorial Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTES.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] p-8 flex flex-col justify-between hover:border-white/[0.12] transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {item.outcome}
                  </span>
                </div>

                <blockquote className="text-sm sm:text-base text-slate-300 font-light leading-relaxed mb-8">
                  "{item.quote}"
                </blockquote>
              </div>

              <div className="pt-6 border-t border-white/[0.04] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {item.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white tracking-tight">{item.author}</div>
                  <div className="text-[11px] text-slate-500 font-light">
                    {item.role} · {item.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
