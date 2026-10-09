'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, Play, Check, ShieldCheck,
  CreditCard, Sparkles, ExternalLink, Layers, Clock
} from 'lucide-react'
import { InteractiveParticleField } from '@/components/ui/interactive-particle-field'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroProps {
  signupHref: string
}

export function FrevioHero({ signupHref }: HeroProps) {
  const [signedOff, setSignedOff] = useState(false)
  const [activeTab, setActiveTab] = useState<'deliverable' | 'milestones' | 'invoices'>('deliverable')
  const containerRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaClusterRef = useRef<HTMLDivElement>(null)
  const card3dRef = useRef<HTMLDivElement>(null)
  const badge1Ref = useRef<HTMLDivElement>(null)

  // 1. GSAP Entrances
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9 },
        0.15
      )
        .fromTo(
          paragraphRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          ctaClusterRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.65 },
          '-=0.45'
        )
        .fromTo(
          card3dRef.current,
          { opacity: 0, y: 45, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
          '-=0.5'
        )

      if (badge1Ref.current) {
        gsap.to(badge1Ref.current, {
          y: -6,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // 2. Mouse Move 3D Tilt Physics for Hero Mockup
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!card3dRef.current) return
    const rect = card3dRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 8
    const rotateY = (x / rect.width) * 8

    gsap.to(card3dRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power1.out',
      transformPerspective: 1200,
    })
  }

  const handleMouseLeave = () => {
    if (!card3dRef.current) return
    gsap.to(card3dRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power2.out',
    })
  }

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-[#08090A] text-[#F3F4F6]"
    >
      {/* 21st.dev Interactive Particle Canvas Background */}
      <InteractiveParticleField className="absolute inset-0 w-full h-full" particleCount={55} />

      {/* Atmospheric Ambient Glows: Linear Indigo & Raycast Cyan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#5E6AD2]/15 via-[#38BDF8]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Monumental Editorial Typography (No chips) */}
          <div className="lg:col-span-6 xl:col-span-5 text-left">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#5E6AD2] mb-4 font-semibold">
              Client Workspace Platform
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.04em] text-white leading-[1.07]"
            >
              Your work, beautifully organised. <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#5E6AD2] via-[#818CF8] to-[#38BDF8]">
                Your clients, always in the loop.
              </span>
            </h1>

            <p
              ref={paragraphRef}
              className="mt-6 text-base sm:text-lg text-[#8A8F98] font-normal leading-relaxed text-balance"
            >
              One clear destination for clients to follow progress, review deliverables, and approve milestones with 1 click — so you spend less time answering messages and more time delivering great work.
            </p>

            {/* CTAs & Proof */}
            <div ref={ctaClusterRef} className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href={signupHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5E6AD2] hover:bg-[#6875E3] text-white h-12 px-7 text-sm font-semibold transition-all hover:scale-[1.02] shadow-[0_0_24px_rgba(94,106,210,0.35)] cursor-pointer"
                >
                  <span>Start free</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  href="#sandbox"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#F3F4F6] border border-white/[0.1] h-12 px-6 text-sm font-medium transition-all hover:border-[#5E6AD2]/50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#38BDF8] fill-current" />
                  <span>Explore interactive demo</span>
                </Link>
              </div>

              {/* Micro-Trust Highlights (Clean list, NO chip badges) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-[#8A8F98]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  2-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  Zero client login friction
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  Direct Stripe settlements
                </span>
              </div>

              {/* Studio Proof Avatars */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#08090A] bg-[#5E6AD2] text-white text-[10px] font-bold items-center justify-center">
                    AL
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#08090A] bg-[#38BDF8] text-black text-[10px] font-bold items-center justify-center">
                    MK
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#08090A] bg-[#10B981] text-white text-[10px] font-bold items-center justify-center">
                    RD
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#08090A] bg-[#23252A] text-white text-[10px] font-bold items-center justify-center">
                    +1k
                  </div>
                </div>
                <div className="text-xs text-[#8A8F98]">
                  Trusted by <span className="text-white font-medium">1,200+</span> independent freelancers & creative studios
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 100% Pure React/CSS Vector UI Mockup with 3D Tilt (Zero blurry images) */}
          <div
            className="lg:col-span-6 xl:col-span-7 relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={card3dRef}
              className="relative w-full rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#0E1013] shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_80px_rgba(94,106,210,0.18)] overflow-hidden text-left transition-shadow duration-300"
            >
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A0C0E] px-4 py-3 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-xs font-mono text-[#8A8F98] hidden sm:inline">
                    frevio.com/p/acme-brand
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Live Client Workspace</span>
                </div>
              </div>

              {/* Client Workspace Internal Chrome */}
              <div className="p-5 sm:p-6 bg-[#0E1013] space-y-5">
                {/* Workspace Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Acme Brand Identity & Web App
                    </div>
                    <div className="text-base sm:text-lg font-medium text-white mt-0.5">
                      Client Review Portal · Sprint 3
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A8F98]">
                    <span className="text-[#10B981]">● Active Sprint</span>
                    <span>· Due Oct 24</span>
                  </div>
                </div>

                {/* Sub-nav switcher */}
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab('deliverable')}
                    className={`pb-2 px-2 transition-colors border-b-2 -mb-2.5 cursor-pointer ${
                      activeTab === 'deliverable'
                        ? 'border-[#5E6AD2] text-white font-medium'
                        : 'border-transparent text-[#8A8F98] hover:text-white'
                    }`}
                  >
                    Deliverable Sign-off
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('milestones')}
                    className={`pb-2 px-2 transition-colors border-b-2 -mb-2.5 cursor-pointer ${
                      activeTab === 'milestones'
                        ? 'border-[#5E6AD2] text-white font-medium'
                        : 'border-transparent text-[#8A8F98] hover:text-white'
                    }`}
                  >
                    Sprint Milestones (3/4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`pb-2 px-2 transition-colors border-b-2 -mb-2.5 cursor-pointer ${
                      activeTab === 'invoices'
                        ? 'border-[#5E6AD2] text-white font-medium'
                        : 'border-transparent text-[#8A8F98] hover:text-white'
                    }`}
                  >
                    Invoices & Stripe ($4,500)
                  </button>
                </div>

                {/* TAB 1: Deliverable Sign-off (Interactive Hero Centerpiece) */}
                {activeTab === 'deliverable' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/[0.1] bg-[#121418] p-4 sm:p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-[#5E6AD2] mb-1 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Sprint 3 · Design Spec v2.4</span>
                          </div>
                          <div className="text-sm sm:text-base font-semibold text-white">
                            Checkout Redesign & Design Token System
                          </div>
                          <div className="text-xs text-[#8A8F98] mt-1">
                            Figma prototype embed · 42 artboards · Mobile & Desktop
                          </div>
                        </div>

                        {/* Interactive Approval Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setSignedOff(!signedOff)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer shadow-md ${
                            signedOff
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40'
                              : 'bg-[#5E6AD2] hover:bg-[#6875E3] text-white shadow-[#5E6AD2]/30 hover:scale-[1.02]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{signedOff ? 'Approved by Client' : 'Approve Deliverable'}</span>
                        </button>
                      </div>

                      {/* Vector Design Canvas Preview (Simulated High-Fidelity UI tokens) */}
                      <div className="rounded-lg border border-white/[0.08] bg-[#090A0C] p-4 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#8A8F98]">
                          <span>Component Spec: Checkout Modal</span>
                          <span className="text-[#38BDF8]">Figma Sync: Connected</span>
                        </div>

                        {/* Visual Tokens Preview */}
                        <div className="grid grid-cols-3 gap-2.5 pt-1">
                          <div className="p-2.5 rounded-md bg-[#16181D] border border-white/[0.08]">
                            <div className="text-[10px] text-[#8A8F98]">Primary Brand</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-3 h-3 rounded-full bg-[#5E6AD2]" />
                              <span className="text-white text-[11px]">#5E6AD2</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-md bg-[#16181D] border border-white/[0.08]">
                            <div className="text-[10px] text-[#8A8F98]">Accent Cyan</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-3 h-3 rounded-full bg-[#38BDF8]" />
                              <span className="text-white text-[11px]">#38BDF8</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-md bg-[#16181D] border border-white/[0.08]">
                            <div className="text-[10px] text-[#8A8F98]">Base Obsidian</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-3 h-3 rounded-full bg-[#08090A] border border-white/20" />
                              <span className="text-white text-[11px]">#08090A</span>
                            </div>
                          </div>
                        </div>

                        {/* Client Status Bar */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                          <span className="text-[#8A8F98]">Client reviewer: Sarah Lin (VP Product)</span>
                          <span className={signedOff ? 'text-[#10B981]' : 'text-[#8A8F98]'}>
                            {signedOff ? '✓ Signed Oct 9, 2:40 PM' : 'Awaiting sign-off'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Milestones */}
                {activeTab === 'milestones' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#121418] border border-white/[0.08] flex items-center justify-between text-[#10B981]">
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        1. Architecture & UX Wireframes
                      </span>
                      <span>✓ Completed Oct 1</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121418] border border-white/[0.08] flex items-center justify-between text-[#10B981]">
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        2. High-Fidelity UI Design System
                      </span>
                      <span>✓ Completed Oct 7</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#121418] border border-[#5E6AD2]/40 flex items-center justify-between text-[#5E6AD2]">
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        3. Checkout Staging & Stripe Integration
                      </span>
                      <span>⚡ Active (75%)</span>
                    </div>
                  </div>
                )}

                {/* TAB 3: Invoices */}
                {activeTab === 'invoices' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-[#121418] border border-white/[0.08] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">Sprint 3 Milestone Settlement</div>
                        <div className="text-[#8A8F98] text-[11px]">Invoice #INV-2026-03 · Stripe Direct</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-white">$4,500.00</div>
                        <div className="text-[#10B981] text-[11px]">✓ Settled upon approval</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mockup Footer: Live Stripe & Immutable Ledger Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#8A8F98]">
                  <div className="flex items-center gap-2 text-[#10B981]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cryptographic sign-off audit trail</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CreditCard className="w-3.5 h-3.5 text-[#5E6AD2]" />
                    <span>Stripe Connected (0% Platform Fee)</span>
                  </div>
                </div>

              </div>

              {/* Floating Ambient Badge */}
              <div
                ref={badge1Ref}
                className="hidden sm:flex absolute bottom-5 right-5 z-20 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#08090A]/95 border border-white/[0.12] shadow-2xl backdrop-blur-xl text-xs font-mono"
              >
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-[#F3F4F6]">1-Click Sign-off Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
