'use client'

import { useEffect, useRef } from 'react'
import { Palette, Code, BarChart3, CheckCircle2, ExternalLink, Sparkles, Clock } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function UseCasesSection() {
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
          { opacity: 0, y: 35, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.14,
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

  const useCases = [
    {
      category: 'Designers & UI/UX Studios',
      icon: Palette,
      headline: 'Visual deliverables and client sign-offs',
      description:
        'Share Figma prototypes, design systems, and brand asset packages. Clients review and approve iterations in a single click before you move to production.',
      example: {
        title: 'Brand Identity & Web UI System',
        status: 'Figma Prototype v2.1',
        item1: 'Logo & Typography Guidelines',
        item1Status: 'Approved',
        item2: 'Desktop & Mobile UI Components',
        item2Status: 'In Review',
      },
    },
    {
      category: 'Developers & Technical Teams',
      icon: Code,
      headline: 'Milestones, staging previews, and launch readiness',
      description:
        'Keep technical delivery transparent. Share staging links, track sprint completions, and tie milestone payments directly to deliverable sign-offs.',
      example: {
        title: 'Next.js Web Application & API',
        status: 'Staging Build #184',
        item1: 'Stripe Checkout & Customer Portal',
        item1Status: 'Deployed',
        item2: 'Production Handover & Domain DNS',
        item2Status: 'Pending Sign-off',
      },
    },
    {
      category: 'Marketers & Growth Consultants',
      icon: BarChart3,
      headline: 'Campaign deliverables and reporting visibility',
      description:
        'Organize marketing deliverables, analytics report links, ad creative sets, and content calendars in one reliable hub that keeps stakeholders aligned.',
      example: {
        title: 'Q4 Performance Growth Campaign',
        status: 'Reporting Dashboard Link',
        item1: 'Ad Creatives & Copy Deck',
        item1Status: 'Approved',
        item2: 'Weekly KPI & Conversion Audit',
        item2Status: 'Live Review',
      },
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="solutions"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#9BCDBF] mb-4">
            <span>Tailored for Client Services</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Whatever you create, <br />
            <span className="font-normal text-[#A7B8FF]">
              your clients deserve clarity.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Frevio adapts seamlessly to how you deliver work — providing structure without forcing you into rigid project management frameworks.
          </p>
        </div>

        {/* 3 Use-Case Cards with GSAP Entrance */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/40 transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-[#A7B8FF] group-hover:border-[#A7B8FF]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD]">
                      {uc.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {uc.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                    {uc.description}
                  </p>
                </div>

                {/* Contextual UI mini-card */}
                <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-[11px] text-[#A1A5AD]">
                    <span className="truncate max-w-[150px]">{uc.example.title}</span>
                    <span className="text-[#A7B8FF]">{uc.example.status}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-[#2A2D33] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#F5F5F3] font-sans truncate mr-2">{uc.example.item1}</span>
                      <span className="text-[#34D399] text-[10px] bg-[#34D399]/10 px-1.5 py-0.5 rounded">
                        {uc.example.item1Status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#A1A5AD] font-sans truncate mr-2">{uc.example.item2}</span>
                      <span className="text-[#A7B8FF] text-[10px] bg-[#A7B8FF]/10 px-1.5 py-0.5 rounded">
                        {uc.example.item2Status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
