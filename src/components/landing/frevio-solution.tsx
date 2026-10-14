'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  CheckCircle2, Clock, Sparkles, CreditCard,
  Layers, FileCheck
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function FrevioSolution() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const bentoGridRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header scroll entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 2. Bento cards staggered reveal on scroll
      if (bentoGridRef.current) {
        gsap.fromTo(
          bentoGridRef.current.children,
          {
            y: 50,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bentoGridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 3. Milestone progress bar animate on scroll
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { width: '0%' },
          {
            width: '75%',
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: progressBarRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="solution" className="py-16 md:py-24 px-4 sm:px-6 bg-[#0a0b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Solution</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Everything your client needs. One clear place.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            See how Frevio transforms everyday client deliverables, milestone tracking, and invoicing into clear visual moments.
          </p>
        </div>

        {/* ── Visual Bento Showcase ── */}
        <div ref={bentoGridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1 (Large - 7 cols): 1-Click Deliverable Approval & Stamp */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0d0e14] p-6 sm:p-7 flex flex-col justify-between shadow-xl overflow-hidden relative group will-change-transform">
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <FileCheck className="w-4 h-4" />
                <span>Deliverable Sign-Off</span>
              </div>
              <h3 className="text-2xl font-normal text-white">
                1-Click Approvals with an immutable audit trail
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed max-w-xl">
                Clients inspect Figma designs, documents, or staging URLs and approve with one click — or request targeted adjustments with precise notes.
              </p>
            </div>

            {/* Visual Image Asset: Deliverable Approval */}
            <div className="rounded-xl border border-white/[0.1] overflow-hidden bg-[#07080c] relative aspect-[16/9] shadow-2xl">
              <img
                src="/deliverable_approval.png"
                alt="Client Deliverable Review with Figma prototype and luminous Approved By Client stamp"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Client approved Oct 26, 10:45 AM
              </span>
              <span className="text-indigo-400">Zero scope creep</span>
            </div>
          </div>

          {/* Card 2 (5 cols): Milestone Roadmap */}
          <div className="lg:col-span-5 rounded-2xl border border-white/[0.1] bg-[#0d0e14] p-6 sm:p-7 flex flex-col justify-between shadow-xl will-change-transform">
            <div className="space-y-2 mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
                <Layers className="w-4 h-4" />
                <span>Progress Roadmap</span>
              </div>
              <h3 className="text-2xl font-normal text-white">
                Real-Time Project Progress
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Break work into clear phases. Clients always see what is done and what is coming next without asking.
              </p>
            </div>

            {/* Visual Milestone Card Mockup */}
            <div className="rounded-xl border border-white/[0.08] bg-[#08090d] p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Sprint 3 Progress</span>
                <span className="font-mono text-emerald-400 font-medium">75% Complete</span>
              </div>

              {/* Glowing progress line that animates on scroll */}
              <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                  style={{ width: '75%' }}
                />
              </div>

              {/* Milestones List */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Discovery &amp; User Journeys
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Oct 12</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                  <span className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    High-Fidelity Figma Wireframes
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Oct 28</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs">
                  <span className="flex items-center gap-2 text-indigo-200">
                    <span className="size-2 rounded-full bg-indigo-400 animate-pulse" />
                    Production UI Development
                  </span>
                  <span className="font-mono text-[11px] text-indigo-300">In Progress</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-mono text-slate-400">
              Automatic status notifications sent on completion
            </div>
          </div>

          {/* Card 3 (5 cols): Connected Stripe Invoicing */}
          <div className="lg:col-span-5 rounded-2xl border border-white/[0.1] bg-[#0d0e14] p-6 sm:p-7 flex flex-col justify-between shadow-xl will-change-transform">
            <div className="space-y-2 mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400">
                <CreditCard className="w-4 h-4" />
                <span>Integrated Billing</span>
              </div>
              <h3 className="text-2xl font-normal text-white">
                Invoices Tied to Delivery
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Connect invoices directly to signed-off milestones. Clients settle payments online via Stripe in seconds.
              </p>
            </div>

            {/* Visual Stripe Invoice Mockup */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Milestone Invoice #F4198</span>
                  <div className="text-2xl font-mono font-medium text-white mt-0.5">$3,500.00</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                  PAID via Stripe
                </span>
              </div>

              <div className="pt-2 text-xs text-slate-300 space-y-1.5 border-t border-white/[0.06]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment method:</span>
                  <span className="font-mono text-slate-200">Apple Pay (•••• 9012)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settled timestamp:</span>
                  <span className="font-mono text-slate-200">Oct 26, 10:46 AM</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-mono text-slate-400">
              No chasing checks or awkward payment follow-up emails
            </div>
          </div>

          {/* Card 4 (Large - 7 cols): Weekly Async Status Updates */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0d0e14] p-6 sm:p-7 flex flex-col justify-between shadow-xl will-change-transform">
            <div className="space-y-2 mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
                <Clock className="w-4 h-4" />
                <span>Async Communication</span>
              </div>
              <h3 className="text-2xl font-normal text-white">
                Share progress without repeating yourself
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Post one structured recap to the client portal. Frevio automatically formats and delivers it so you never rewrite the same update across multiple chats.
              </p>
            </div>

            {/* Visual Weekly Broadcast Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#08090d] p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold">
                    W4
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Weekly Progress Broadcast</div>
                    <div className="text-[10px] text-slate-400 font-mono">Sent to Acme Stakeholders · Oct 24</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Delivered
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 font-light">
                <p className="flex items-baseline gap-2">
                  <span className="text-indigo-400 font-mono">→</span>
                  <span><strong>Shipped:</strong> Final checkout responsive breakpoints deployed to staging.</span>
                </p>
                <p className="flex items-baseline gap-2">
                  <span className="text-indigo-400 font-mono">→</span>
                  <span><strong>In Review:</strong> Figma design token exports attached for client design team.</span>
                </p>
                <p className="flex items-baseline gap-2">
                  <span className="text-indigo-400 font-mono">→</span>
                  <span><strong>Next milestone:</strong> Production release scheduled for Monday 10:00 AM.</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Clients receive clean email digest</span>
              <span className="text-indigo-400">Zero phone tag</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
