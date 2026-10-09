'use client'

import { useEffect, useRef } from 'react'
import { Sparkles, Mail, Bell, ShieldAlert } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AutomationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
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

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const automations = [
    {
      icon: Sparkles,
      title: 'Automated update draft preparation',
      description:
        'Frevio compiles your recently completed milestones, pending approvals, and active tasks into a clear draft broadcast so you can review and publish in seconds.',
      badge: 'Review before sending',
    },
    {
      icon: Mail,
      title: '1-click client email notifications',
      description:
        'Deliver polished email updates to clients through Resend with a direct link to their portal whenever a milestone is ready for review or an invoice is due.',
      badge: 'Email integration',
    },
    {
      icon: Bell,
      title: 'Overdue milestone & blocker flags',
      description:
        'Visual alert banners flag when a project is waiting on client feedback, deposit payment, or asset delivery, preventing silent timeline delays.',
      badge: 'Automated flags',
    },
    {
      icon: ShieldAlert,
      title: 'Scope Creep Shield & change orders',
      description:
        'Turn out-of-scope feedback into a formal change order with price, timeline impact (+X days), and upfront Stripe payment before you start additional work.',
      badge: 'Revenue protection',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-indigo-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Practical Productivity</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Let routine work <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              take care of itself.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Practical automations designed to eliminate administrative friction — without taking control away from how you run your business.
          </p>
        </div>

        {/* 4 Automation Cards Grid with GSAP entrance */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-purple-400 px-2.5 py-1 rounded bg-[#101113] border border-[#2A2D33]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
