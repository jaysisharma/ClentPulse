'use client'

import { useEffect } from 'react'

const TESTIMONIALS = [
  {
    quote: "ClientPulse cut my admin time in half. No more writing status emails from scratch.",
    name: "Sarah Chen",
    role: "Product Designer & Freelancer",
  },
  {
    quote: "We manage 12+ projects. ClientPulse keeps everyone aligned with clients seamlessly.",
    name: "Marcus Rodriguez",
    role: "Creative Director, Design Agency",
  },
  {
    quote: "Time tracking linked to invoices means nothing slips through the cracks.",
    name: "Priya Patel",
    role: "Freelance Developer",
  },
  {
    quote: "The portfolio feature helped me land my biggest client yet.",
    name: "James Wilson",
    role: "UI/UX Freelancer",
  },
  {
    quote: "Our clients see progress happening. The approval workflow is a game changer.",
    name: "Elena Kowalski",
    role: "Founder, Digital Studio",
  },
  {
    quote: "ClientPulse replaced three tools I was juggling. Less context switching, better organization.",
    name: "David Thompson",
    role: "Consultant & Freelancer",
  },
  {
    quote: "The time tracking is so intuitive. Every freelancer needs this.",
    name: "Lisa Anderson",
    role: "Web Developer & Solopreneur",
  },
  {
    quote: "Best investment we made this year. Hours of admin work gone.",
    name: "Alex Kumar",
    role: "Agency Owner",
  },
  {
    quote: "Clients always ask how I send such professional updates so consistently.",
    name: "Rachel Green",
    role: "Graphic Designer",
  },
  {
    quote: "Automatic tracking means I never miss a billable hour. Revenue improved immediately.",
    name: "Tom Bradley",
    role: "Freelance Strategist",
  },
  {
    quote: "Client communication improved 100%. They feel more informed than ever.",
    name: "Jessica Wong",
    role: "Design Consultant",
  },
  {
    quote: "The invoice payment integration handles everything. Game changing for cash flow.",
    name: "Michael Park",
    role: "Startup Founder",
  },
]

export function TestimonialsCarousel() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scroll-left {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .carousel-animate {
        animation: scroll-left 30s linear infinite;
      }
      .carousel-animate:hover {
        animation-play-state: paused;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden px-6">
      {/* Row 1 */}
      <div className="mb-6">
        <div className="flex gap-6 carousel-animate" style={{ width: 'fit-content' }}>
          {[...TESTIMONIALS.slice(0, 6), ...TESTIMONIALS.slice(0, 6)].map((testimonial, idx) => (
            <div
              key={`${testimonial.name}-${idx}`}
              className="flex-shrink-0 w-80 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100/60 dark:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all"
            >
              <div className="space-y-4 mb-6">
                <div className="flex gap-1">
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i} className="text-indigo-600 dark:text-indigo-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm h-16 line-clamp-3">{testimonial.quote}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div>
        <div className="flex gap-6 carousel-animate" style={{ width: 'fit-content', animationDirection: 'reverse' }}>
          {[...TESTIMONIALS.slice(6, 12), ...TESTIMONIALS.slice(6, 12)].map((testimonial, idx) => (
            <div
              key={`${testimonial.name}-${idx}`}
              className="flex-shrink-0 w-80 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all"
            >
              <div className="space-y-4 mb-6">
                <div className="flex gap-1">
                  {'★★★★★'.split('').map((_, i) => (
                    <span key={i} className="text-indigo-600 dark:text-indigo-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm h-16 line-clamp-3">{testimonial.quote}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
