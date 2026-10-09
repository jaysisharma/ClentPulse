'use client'

import { useEffect, useRef } from 'react'
import { FolderPlus, Share2, ArrowRightCircle } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

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

      if (stepsRef.current) {
        gsap.fromTo(
          stepsRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.18,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const steps = [
    {
      number: '01',
      icon: FolderPlus,
      title: 'Create a workspace',
      description:
        'Set up a project in under two minutes. Define your core milestones, add your kickoff checklist, and attach initial files or contracts.',
      tag: 'Step 1',
    },
    {
      number: '02',
      icon: Share2,
      title: 'Share one link',
      description:
        'Give your client a clean, passcode-protected link to their workspace. No passwords to remember or accounts for them to register.',
      tag: 'Step 2',
    },
    {
      number: '03',
      icon: ArrowRightCircle,
      title: 'Keep the work moving',
      description:
        'Publish updates, collect 1-click deliverable sign-offs, and receive invoice payments via Stripe without endless email threads.',
      tag: 'Step 3',
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-indigo-400 mb-4">
            <span>Simple 3-Step Flow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            From scattered updates <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              to a smoother workflow.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            You don&apos;t need to change how you do your creative or technical work — only where your clients look to see it happen.
          </p>
        </div>

        {/* 3 Horizontal Steps with GSAP Entrance */}
        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-md bg-[#101113] border border-[#2A2D33]">
                      {step.tag}
                    </span>
                    <span className="text-2xl font-light font-mono text-[#A1A5AD]/40 group-hover:text-indigo-400/50 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#1E2126] border border-[#2A2D33] flex items-center justify-center text-indigo-400 mb-4 group-hover:border-indigo-500/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {step.description}
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
