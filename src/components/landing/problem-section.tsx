'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  MessageSquare, FileSearch, CheckSquare, Receipt,
  AlertTriangle, ArrowRight, CheckCircle2
} from 'lucide-react'
import { HaikeiTopography } from '@/components/ui/haikei-backgrounds'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // 1. Header entrance
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

      // 2. Comparison graphic reveal
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }

      // 3. Stagger cards
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
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

  const problems = [
    {
      icon: MessageSquare,
      title: 'Repeating project updates',
      description:
        'Answering "any updates?" across WhatsApp, Slack, iMessage, and email at odd hours, restating progress you already delivered.',
      tag: 'Scattered messages',
      sample: '"Hey, just checking in — where are we on the checkout page design?"',
    },
    {
      icon: CheckSquare,
      title: 'Chasing feedback and approvals',
      description:
        'Feedback gets buried in long threads or verbal calls. Without a clear sign-off record, scope creeps and revisions never end.',
      tag: 'Unclear sign-offs',
      sample: '"Looks great in general! Just can we also change the entire hero section?"',
    },
    {
      icon: FileSearch,
      title: 'Searching through scattered files',
      description:
        'Figma files in one chat, contracts in another, staging links lost in email chains, and invoices saved in separate tabs.',
      tag: 'Fragmented links',
      sample: '"Can you resend the latest Figma link? The one from last Tuesday isn\'t loading."',
    },
    {
      icon: Receipt,
      title: 'Following up on invoices & tasks',
      description:
        'Awkward payment reminders, delayed milestone settlements, and waiting on client assets before you can actually begin.',
      tag: 'Payment friction',
      sample: '"Can you send that invoice again as a PDF? Accounts payable is asking for it."',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] overflow-hidden"
    >
      {/* Haikei Topography Lines Background */}
      <HaikeiTopography className="absolute inset-0 w-full h-full" opacity={0.05} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A1A5AD] mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>The Reality of Client Work</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Your work is organised. <br />
            <span className="font-normal text-[#A1A5AD]">
              Why is managing your clients so messy?
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Project updates live in messages. Feedback gets buried. Invoices need follow-ups. Clients ask questions you&apos;ve already answered.
          </p>
        </div>

        {/* ── VISUAL STORYTELLING: CHAOS VS CLARITY COMPARISON ── */}
        <div
          ref={imageRef}
          className="mb-14 rounded-2xl border border-[#2A2D33] bg-[#17191D] shadow-2xl overflow-hidden"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#0c0d10]">
            <Image
              src="/client_chaos_vs_calm.png"
              alt="Comparison showing client communication chaos on the left with scattered messages and overdue invoices versus clarity with Frevio on the right"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="p-4 bg-[#101113] border-t border-[#2A2D33] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A5AD] font-mono">
            <span className="flex items-center gap-2 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Before: 5 apps, missed DMs, endless status meetings
            </span>
            <span className="flex items-center gap-2 text-[#34D399]">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              With Frevio: 1 shared link, real-time status, 1-click approvals
            </span>
          </div>
        </div>

        {/* 4 Problem Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-[#A7B8FF] group-hover:border-[#A7B8FF]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD] px-2.5 py-1 rounded bg-[#101113] border border-[#2A2D33]">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {prob.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                {/* Realistic quote snippet */}
                <div className="mt-6 pt-4 border-t border-[#2A2D33]/60 bg-[#101113]/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <p className="text-xs font-mono italic text-[#A1A5AD]">
                    {prob.sample}
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
