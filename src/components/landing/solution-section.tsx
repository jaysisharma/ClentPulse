'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Sparkles, ExternalLink,
  ShieldCheck, CreditCard, ArrowRight, ArrowUpRight,
  Check
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface Props {
  signupHref: string
}

export function SolutionSection({ signupHref }: Props) {
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
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
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

  return (
    <section
      ref={sectionRef}
      id="solutions"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-purple-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>The Frevio Solution</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            One workspace. <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              A better experience for every client.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Instead of spreading your projects across email, chat threads, and cloud drives, give each client one dedicated destination that answers their questions before they ask.
          </p>
        </div>

        {/* 3 Clear Capability Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Capability A: Keep every project clear */}
          <div className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">
                01 · Visibility
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Keep every project clear
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Clients see overall project health, active milestones, and what is currently being worked on without having to text you for updates.
              </p>
            </div>

            {/* Realistic UI Example A */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#A1A5AD] text-[11px]">
                <span>Brand Identity & Web</span>
                <span className="text-[#34D399]">Sprint 2 of 4</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#F5F5F3]">
                  <span>Discovery & Wireframes</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <div className="flex justify-between text-xs text-indigo-400">
                  <span>Visual Design & UI</span>
                  <span className="text-[10px] bg-indigo-500/15 px-1.5 py-0.5 rounded text-indigo-400">Active</span>
                </div>
                <div className="flex justify-between text-xs text-[#A1A5AD]">
                  <span>Frontend Engineering</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="pt-2 border-t border-[#2A2D33] flex justify-between text-[11px] text-[#A1A5AD]">
                <span>Progress: 68%</span>
                <span className="text-[#34D399]">On Schedule</span>
              </div>
            </div>
          </div>

          {/* Capability B: Share work and collect feedback (With Generated Visual) */}
          <div className="rounded-2xl border border-indigo-500/30 bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/60 transition-all hover:translate-y-[-2px] shadow-lg shadow-indigo-500/10">
            <div>
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                02 · Approvals
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Share work and collect feedback
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-4">
                Deliverables are easy to access, review, and approve with 1 click. Create a crystal-clear paper trail for revisions and sign-offs.
              </p>
            </div>

            {/* Embedded Visual: Deliverable Approval Graphic */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] overflow-hidden shadow-inner">
              <div className="relative w-full aspect-[16/10]">
                <Image
                  src="/deliverable_approval.png"
                  alt="Client deliverable review interface with illuminated Approved by Client stamp and Stripe milestone payment"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-3 bg-[#101113] flex items-center justify-between text-[11px] font-mono text-[#34D399]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  1-Click Immutable Sign-off
                </span>
                <span className="text-[#A1A5AD]">No PDF printing</span>
              </div>
            </div>
          </div>

          {/* Capability C: Keep project administration organised */}
          <div className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2">
                03 · Administration
              </div>
              <h3 className="text-lg font-medium text-[#F5F5F3] mb-2">
                Keep project administration organised
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed mb-6">
                Centralize agreements, invoices, kickoff checklists, and scope change orders so payment and paperwork never stall progress.
              </p>
            </div>

            {/* Realistic UI Example C */}
            <div className="rounded-xl border border-[#2A2D33] bg-[#101113] p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#A1A5AD]">
                <span>Invoicing & Scope</span>
                <span className="text-[#34D399]">Stripe Enabled</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#F5F5F3]">
                <span>Milestone 1 Deposit</span>
                <span className="text-[#34D399] font-medium">$3,500 Paid</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#A1A5AD]">
                <span>Scope Creep Shield #01</span>
                <span className="text-[#FBBF24]">Due on approval</span>
              </div>
              <div className="pt-2 border-t border-[#2A2D33] flex justify-between text-[11px] text-[#A1A5AD]">
                <span>Master Services Agreement</span>
                <span className="text-[#34D399]">✓ E-Signed</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
