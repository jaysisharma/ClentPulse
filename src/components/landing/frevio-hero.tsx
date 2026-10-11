'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Play, Check, ShieldCheck,
  CreditCard, Sparkles, Layers, Clock,
  CheckCircle2, Eye, FileCheck
} from 'lucide-react'
import { InteractiveParticleField } from '@/components/ui/interactive-particle-field'
import gsap from 'gsap'

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [signedOff, setSignedOff] = useState(false)
  const [activeTab, setActiveTab] = useState<'deliverables' | 'milestones' | 'invoices'>('deliverables')

  const containerRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaClusterRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const floatingLeftRef = useRef<HTMLDivElement>(null)
  const floatingRightRef = useRef<HTMLDivElement>(null)

  // 1. GSAP Entrances & Gentle Floating Animation
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.1
      )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          paragraphRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=0.5'
        )
        .fromTo(
          ctaClusterRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.45'
        )
        .fromTo(
          stageRef.current,
          { opacity: 0, y: 45, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=0.4'
        )

      // Floating real-time event cards
      if (floatingLeftRef.current) {
        gsap.to(floatingLeftRef.current, {
          y: -7,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
      if (floatingRightRef.current) {
        gsap.to(floatingRightRef.current, {
          y: 7,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4,
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // 2. Interactive 3D Perspective Tilt Physics for Center Stage
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 5
    const rotateY = (x / rect.width) * 5

    gsap.to(stageRef.current, {
      rotateX,
      rotateY,
      duration: 0.45,
      ease: 'power1.out',
      transformPerspective: 1400,
    })
  }

  const handleMouseLeave = () => {
    if (!stageRef.current) return
    gsap.to(stageRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power2.out',
    })
  }

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[#08090A] text-[#F3F4F6]"
    >
      {/* 21st.dev Interactive Canvas Particle Background (Monochrome) */}
      <InteractiveParticleField className="absolute inset-0 w-full h-full pointer-events-none" particleCount={40} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* ── 01. Clean Editorial Category Tag (No chip, no pill border) ── */}
        <div ref={eyebrowRef} className="text-xs font-mono uppercase tracking-[0.22em] text-slate-400 mb-4 sm:mb-5">
          Client Workspace Platform
        </div>

        {/* ── 02. Monumental Headline (Solid, no gradient) ── */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-light tracking-[-0.04em] text-white leading-[1.05] max-w-5xl mx-auto text-balance"
        >
          Your work, beautifully organised. <br className="hidden sm:inline" />
          <span className="text-slate-400">Your clients, always in the loop.</span>
        </h1>

        {/* ── 03. Subtitle (Solid crisp text) ── */}
        <p
          ref={paragraphRef}
          className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-slate-400 font-normal max-w-2xl sm:max-w-3xl mx-auto leading-relaxed text-balance"
        >
          One dedicated destination for milestone progress, 1-click deliverable sign-offs, and direct Stripe payments — with zero client login friction.
        </p>

        {/* ── 04. Dual Action Buttons & Micro-Trust (No chips, no gradient) ── */}
        <div ref={ctaClusterRef} className="mt-8 sm:mt-10 flex flex-col items-center gap-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link
              href={signupHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 h-12 px-8 text-sm font-semibold transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Start free trial</span>
              <ArrowRight className="w-4 h-4 text-slate-900" />
            </Link>

            <Link
              href="#sandbox"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.1] h-12 px-7 text-sm font-medium transition-all hover:border-white/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-slate-300 fill-current" />
              <span>Explore interactive portal</span>
            </Link>
          </div>

          {/* Micro-trust proof list (Clean typography) */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Zero client login friction
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Instant Stripe settlements
            </span>
          </div>
        </div>

        {/* ── 05. Monumental Centerpiece Stage (Clean hairline borders, no gradient glow) ── */}
        <div
          className="mt-14 sm:mt-18 lg:mt-20 relative max-w-5xl xl:max-w-6xl mx-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* ── Floating Event Card: Real-time Deliverable Approval (Left) ── */}
          <div
            ref={floatingLeftRef}
            className="hidden lg:flex absolute -left-6 xl:-left-12 top-24 z-30 flex-col gap-1 p-4 rounded-xl bg-[#0E1013] border border-white/[0.1] shadow-2xl text-left w-64"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">1-Click Sign-off</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">14s ago</span>
            </div>
            <div className="text-xs font-semibold text-white mt-1">Design Token Spec v2.4</div>
            <div className="text-[11px] text-slate-400">Sarah Lin (VP Product) approved without logging in.</div>
          </div>

          {/* ── Floating Event Card: Direct Stripe Settlement (Right) ── */}
          <div
            ref={floatingRightRef}
            className="hidden lg:flex absolute -right-6 xl:-right-12 bottom-20 z-30 flex-col gap-1 p-4 rounded-xl bg-[#0E1013] border border-white/[0.1] shadow-2xl text-left w-64"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold">Stripe Settled</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Just now</span>
            </div>
            <div className="text-xs font-semibold text-white mt-1">$4,500.00 Deposited</div>
            <div className="text-[11px] text-slate-400">Cleared directly into bank account · 0% fee.</div>
          </div>

          {/* ── Main Stage Browser Mockup ── */}
          <div
            ref={stageRef}
            className="relative w-full rounded-2xl border border-white/[0.1] bg-[#0A0C0F] shadow-2xl overflow-hidden text-left transition-all duration-300"
          >
            {/* Browser Header Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0E1013] px-4 py-3 select-none">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                <span className="ml-2 text-xs font-mono text-slate-500 hidden sm:inline">
                  frevio.cloud/p/acme-brand
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Live Client Workspace</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Eye className="w-3 h-3" />
                  <span>Client View</span>
                </div>
              </div>
            </div>

            {/* Workspace Inside Canvas */}
            <div className="p-5 sm:p-7 bg-[#0A0C0F] space-y-6">
              
              {/* Project Headline Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-indigo-400 font-medium">Sprint 3 of 4</span>
                    <span className="text-xs font-mono text-slate-500">·</span>
                    <span className="text-xs font-mono text-slate-400">Target Launch: Oct 28</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-light uppercase tracking-tight text-white mt-1.5">
                    Acme Digital Platform & Brand System
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Prepared for Sarah Lin & the Acme Product Leadership team.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0A0C0F]">
                      JS
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0A0C0F]">
                      SL
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Active Collaborators</span>
                </div>
              </div>

              {/* Sub-nav Tab Switcher (No chips) */}
              <div className="flex items-center gap-1 sm:gap-2 border-b border-white/[0.08] pb-1 text-xs font-mono overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('deliverables')}
                  className={`pb-2.5 px-3 transition-colors border-b-2 -mb-1 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'deliverables'
                      ? 'border-indigo-400 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deliverable Sign-offs</span>
                  <span className="text-slate-500 text-[11px]">(1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('milestones')}
                  className={`pb-2.5 px-3 transition-colors border-b-2 -mb-1 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'milestones'
                      ? 'border-indigo-400 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Milestone Roadmap</span>
                  <span className="text-slate-500 text-[11px]">(3/4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-2.5 px-3 transition-colors border-b-2 -mb-1 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'invoices'
                      ? 'border-indigo-400 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Invoices & Settlement</span>
                  <span className="text-slate-500 text-[11px]">($4.5k)</span>
                </button>
              </div>

              {/* ── TAB 1: Deliverables & 1-Click Sign-off ── */}
              {activeTab === 'deliverables' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/[0.08] bg-[#111317] p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-indigo-400 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sprint 3 · Ready for Sign-off</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                          Design Token Architecture & Component Library v2.4
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Complete Figma interactive prototype with 42 responsive components and dark mode tokens.
                        </p>
                      </div>

                      {/* Interactive Sign-off Button (Clean, no chip pill) */}
                      <button
                        type="button"
                        onClick={() => setSignedOff(!signedOff)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer self-start sm:self-auto flex-shrink-0 ${
                          signedOff
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white text-slate-950 hover:bg-slate-100 hover:scale-[1.01]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{signedOff ? '✓ Approved by Sarah Lin' : 'Approve Deliverable (1-Click)'}</span>
                      </button>
                    </div>

                    {/* Vector Spec Preview Surface */}
                    <div className="rounded-lg border border-white/[0.08] bg-[#08090B] p-4 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Interactive Token Registry</span>
                        <span className="text-sky-400">Figma Sync: Active</span>
                      </div>

                      {/* Token Swatches */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-3 rounded-lg bg-[#14171C] border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Primary Brand</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-3 h-3 rounded-sm bg-[#5E6AD2]" />
                            <span className="text-white text-xs font-semibold">#5E6AD2</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#14171C] border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Accent Violet</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-3 h-3 rounded-sm bg-[#A855F7]" />
                            <span className="text-white text-xs font-semibold">#A855F7</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#14171C] border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Electric Cyan</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-3 h-3 rounded-sm bg-[#38BDF8]" />
                            <span className="text-white text-xs font-semibold">#38BDF8</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#14171C] border border-white/[0.08]">
                          <div className="text-[10px] text-slate-400">Deep Obsidian</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-3 h-3 rounded-sm bg-[#08090A] border border-white/20" />
                            <span className="text-white text-xs font-semibold">#08090A</span>
                          </div>
                        </div>
                      </div>

                      {/* Sign-off Audit Trace */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Assigned Client Reviewer: Sarah Lin</span>
                        <span className={signedOff ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                          {signedOff ? '● Sign-off recorded on immutable audit trail' : '● Awaiting 1-click client sign-off'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: Milestones Roadmap ── */}
              {activeTab === 'milestones' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>1. Brand Positioning & Creative Discovery</span>
                    </span>
                    <span>✓ Completed Oct 4</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>2. High-Fidelity UI System & Token Specs</span>
                    </span>
                    <span>✓ Completed Oct 12</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between text-indigo-400">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>3. Next.js Client Portal Production Staging</span>
                    </span>
                    <span>Active (85% Progress)</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>4. Production Deployment & Domain Handoff</span>
                    </span>
                    <span>Scheduled for Oct 28</span>
                  </div>
                </div>
              )}

              {/* ── TAB 3: Invoices & Direct Stripe Settlement ── */}
              {activeTab === 'invoices' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">Sprint 3 Milestone Settlement</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">Invoice #INV-2026-03 · Stripe Direct</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white font-mono">$4,500.00</div>
                      <div className="text-emerald-400 text-[11px]">✓ Settled directly to Stripe</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#111317] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">Upfront Kickoff Deposit</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">Invoice #INV-2026-01 · Settled at start</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-white font-mono">$3,000.00</div>
                      <div className="text-emerald-400 text-[11px]">✓ Paid Sept 28</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Footer Bar */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audited Deliverable Sign-off Ledger</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Stripe Instant Payouts (0% Platform Cut)</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
