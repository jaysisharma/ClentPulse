'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { MessageSquare, FileSearch, CheckSquare, Receipt } from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function TensionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: visualRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        )
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
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
      num: '01',
      icon: MessageSquare,
      title: 'Repeating project updates',
      desc: 'Answering "any updates?" across WhatsApp, Slack, iMessage, and email at odd hours, restating progress you already delivered.',
      quote: '"Hey, just checking in — where are we on the checkout page design?"',
    },
    {
      num: '02',
      icon: CheckSquare,
      title: 'Chasing feedback and approvals',
      desc: 'Feedback gets buried in long threads or phone calls. Without an immutable sign-off record, scope creeps and revisions never end.',
      quote: '"Looks great in general! Just can we also change the entire hero section?"',
    },
    {
      num: '03',
      icon: FileSearch,
      title: 'Searching through scattered files',
      desc: 'Figma files in one chat, contracts in another, staging links lost in email chains, and invoices saved in separate tabs.',
      quote: '"Can you resend the latest Figma link? The one from last Tuesday isn\'t loading."',
    },
    {
      num: '04',
      icon: Receipt,
      title: 'Following up on invoices & tasks',
      desc: 'Awkward payment reminders, delayed milestone settlements, and waiting on client assets before you can actually begin.',
      quote: '"Can you send that invoice again as a PDF? Accounts payable is asking for it."',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No chips) */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-14">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#A1A5AD] mb-3">
            01 / The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12]">
            Your creative work is organised. <br />
            <span className="font-normal text-[#A1A5AD]">
              Why is managing your clients so messy?
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Project updates live in messages. Feedback gets buried. Invoices need repeated follow-ups. Clients ask questions you&apos;ve already answered.
          </p>
        </div>

        {/* Visual Storytelling: Chaos vs Clarity Comparison */}
        <div
          ref={visualRef}
          className="mb-14 rounded-2xl border border-[#2A2D33] bg-[#17191D] shadow-2xl overflow-hidden"
        >
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#0c0d10]">
            <Image
              src="/client_chaos_vs_calm.png"
              alt="Comparison showing client communication chaos on the left versus clarity with Frevio on the right"
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

        {/* 4 Problem Spotlight Cards */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon
            return (
              <SpotlightCard
                key={idx}
                className="p-6 sm:p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#A1A5AD]/60">
                      {prob.num}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {prob.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {prob.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A2D33]/60 bg-[#101113]/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <p className="text-xs font-mono italic text-[#A1A5AD]">
                    {prob.quote}
                  </p>
                </div>
              </SpotlightCard>
            )
          })}
        </div>

      </div>
    </section>
  )
}
