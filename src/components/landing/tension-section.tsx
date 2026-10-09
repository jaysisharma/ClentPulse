'use client'

import React, { useEffect, useRef } from 'react'
import {
  MessageSquare, FileSearch, CheckSquare, Receipt,
  AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react'
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
          { opacity: 0, y: 40, scale: 0.97 },
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
      id="overview"
      className="py-20 md:py-32 bg-[#08090A] border-t border-white/[0.08] text-[#F3F4F6]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No chips) */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8A8F98] mb-3">
            01 / The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.035em] text-white leading-[1.12]">
            Your creative work is organised. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#8A8F98] via-[#D1D5DB] to-white">
              Why is managing your clients so messy?
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#8A8F98] font-normal leading-relaxed max-w-xl mx-auto">
            Project updates live in messages. Feedback gets buried. Invoices need repeated follow-ups. Clients ask questions you&apos;ve already answered.
          </p>
        </div>

        {/* 100% Pure React/CSS Vector UI Comparative Arena (Replacing blurry image) */}
        <div
          ref={visualRef}
          className="mb-16 rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0E1013] shadow-[0_20px_70px_rgba(0,0,0,0.7)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* Left Side: The Scattered Reality (Before) */}
            <div className="p-6 sm:p-8 bg-[#0B0C0E]/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Without Frevio · Disconnected Chaos</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400/80">5 Apps & Endless Threads</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Fake Messy Notification 1 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-rose-500/20 text-rose-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8A8F98]">
                      <span>WhatsApp · 11:42 PM</span>
                      <span className="text-rose-400 font-semibold">Unread</span>
                    </div>
                    <p className="text-white font-sans text-xs">
                      &ldquo;Hey, quick check-in: where are we on the checkout design? Also can we change the whole palette?&rdquo;
                    </p>
                  </div>

                  {/* Fake Messy Notification 2 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-amber-500/20 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8A8F98]">
                      <span>Slack Direct Message</span>
                      <span className="text-amber-400">File link 404</span>
                    </div>
                    <p className="text-white font-sans text-xs">
                      &ldquo;Can you resend the Figma link from Tuesday? It says access requested.&rdquo;
                    </p>
                  </div>

                  {/* Fake Messy Notification 3 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#8A8F98]">
                      <span>Email Thread (14 messages)</span>
                      <span className="text-rose-400">Overdue</span>
                    </div>
                    <p className="text-white font-sans text-xs">
                      &ldquo;Accounts payable is asking for the invoice PDF again with their updated address.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-rose-400">
                <span>Result: Unpaid revisions & lost context</span>
                <span>Hours lost weekly</span>
              </div>
            </div>

            {/* Right Side: The Frevio Calm (After) */}
            <div className="p-6 sm:p-8 bg-[#0E1013] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>With Frevio · 1 Dedicated Client Link</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38BDF8]">frevio.com/p/acme</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Clean Frevio Card 1 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#10B981]/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#38BDF8]">Sprint 3 Deliverable</span>
                      <span className="text-[#10B981] font-semibold">✓ 1-Click Approved</span>
                    </div>
                    <div className="text-white font-sans font-medium text-xs">
                      Checkout Redesign & Design Token System
                    </div>
                    <div className="text-[11px] text-[#8A8F98]">
                      Client signed Oct 9 · Milestone settlement unlocked
                    </div>
                  </div>

                  {/* Clean Frevio Card 2 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-[#5E6AD2]/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#5E6AD2]">Scope Creep Shield</span>
                      <span className="text-[#10B981]">+$750.00 Authorized</span>
                    </div>
                    <div className="text-white font-sans font-medium text-xs">
                      Apple Pay Checkout Change Order #02
                    </div>
                    <div className="text-[11px] text-[#8A8F98]">
                      Scope changes turned into paid add-ons automatically
                    </div>
                  </div>

                  {/* Clean Frevio Card 3 */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-white font-sans font-medium text-xs">
                        Invoice #INV-2026-03 ($4,500.00)
                      </div>
                      <div className="text-[11px] text-[#8A8F98]">
                        Stripe Direct · Paid via Apple Pay
                      </div>
                    </div>
                    <div className="text-[#10B981] font-mono text-xs font-semibold">
                      ✓ Settled
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#10B981]">
                <span>Result: Zero status meetings needed</span>
                <span>Immediate client trust</span>
              </div>
            </div>

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
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#5E6AD2] group-hover:border-[#5E6AD2]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#8A8F98]/70">
                      {prob.num}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                    {prob.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed">
                    {prob.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] bg-black/40 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <p className="text-xs font-mono italic text-[#8A8F98]">
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
