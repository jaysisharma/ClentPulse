'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Play, Check, CreditCard } from 'lucide-react'
import { InteractiveParticleField } from '@/components/ui/interactive-particle-field'
import { HaikeiBlobAura } from '@/components/ui/haikei-backgrounds'
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
  const containerRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaClusterRef = useRef<HTMLDivElement>(null)
  const card3dRef = useRef<HTMLDivElement>(null)
  const badge1Ref = useRef<HTMLDivElement>(null)
  const badge2Ref = useRef<HTMLDivElement>(null)

  // 1. GSAP Entrances and ScrollTrigger 3D float
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
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
          '-=0.5'
        )

      // Floating ambient badges
      if (badge1Ref.current) {
        gsap.to(badge1Ref.current, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }
      if (badge2Ref.current) {
        gsap.to(badge2Ref.current, {
          y: 8,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4,
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
    const rotateX = -(y / rect.height) * 10
    const rotateY = (x / rect.width) * 10

    gsap.to(card3dRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power1.out',
      transformPerspective: 1000,
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
      className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-[#101113] text-[#F5F5F3]"
    >
      {/* 21st.dev Interactive Particle Canvas Background */}
      <InteractiveParticleField className="absolute inset-0 w-full h-full" particleCount={50} />

      {/* Atmospheric Ambient Glows */}
      <HaikeiBlobAura
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none"
        opacity={0.16}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Monumental Editorial Typography (No chips) */}
          <div className="lg:col-span-6 xl:col-span-5 text-left">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 mb-4 font-semibold">
              Client Workspace Platform
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.04em] text-[#F5F5F3] leading-[1.07]"
            >
              Your work, beautifully organised. <br />
              <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
                Your clients, always in the loop.
              </span>
            </h1>

            <p
              ref={paragraphRef}
              className="mt-6 text-base sm:text-lg text-[#A1A5AD] font-normal leading-relaxed text-balance"
            >
              One clear destination for clients to follow progress, review deliverables, and approve milestones with 1 click — so you spend less time answering messages and more time delivering great work.
            </p>

            {/* CTAs & Proof */}
            <div ref={ctaClusterRef} className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href={signupHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white h-12 px-7 text-sm font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <span>Start free</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  href="#sandbox"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] hover:bg-[#1E2126] text-[#F5F5F3] border border-[#2A2D33] h-12 px-6 text-sm font-medium transition-all hover:border-indigo-500/50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-purple-400 fill-current" />
                  <span>Explore interactive demo</span>
                </Link>
              </div>

              {/* Micro-Trust Highlights (Clean list, no chip badges) */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-mono text-[#A1A5AD]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  2-minute setup
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  Zero client login friction
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  Stripe payouts direct
                </span>
              </div>

              {/* Studio Proof Avatars */}
              <div className="pt-4 border-t border-[#2A2D33]/60 flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#101113] bg-indigo-600 text-white text-[10px] font-bold items-center justify-center">
                    AL
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#101113] bg-purple-600 text-white text-[10px] font-bold items-center justify-center">
                    MK
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#101113] bg-teal-600 text-white text-[10px] font-bold items-center justify-center">
                    RD
                  </div>
                  <div className="inline-flex h-7 w-7 rounded-full ring-2 ring-[#101113] bg-[#2A2D33] text-white text-[10px] font-bold items-center justify-center">
                    +1k
                  </div>
                </div>
                <div className="text-xs text-[#A1A5AD]">
                  Trusted by <span className="text-[#F5F5F3] font-medium">1,200+</span> independent freelancers & creative studios
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Client Portal Viewport */}
          <div
            className="lg:col-span-6 xl:col-span-7 relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={card3dRef}
              className="relative w-full rounded-2xl sm:rounded-3xl border border-[#2A2D33] bg-[#17191D] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.85),0_0_90px_-25px_rgba(99,102,241,0.25)] overflow-hidden text-left ring-1 ring-white/10 transition-shadow duration-300"
            >
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between border-b border-[#2A2D33] bg-[#101113] px-4 py-3 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-xs font-mono text-[#A1A5AD] hidden sm:inline">
                    frevio.cloud/p/acme-brand
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#34D399]">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                  <span>Live Client View</span>
                </div>
              </div>

              {/* Product UI Graphic Showcase */}
              <div className="relative w-full aspect-[16/10] bg-[#0c0d10] overflow-hidden group">
                <Image
                  src="/hero_client_portal.png"
                  alt="Frevio Client Portal Interface showcasing Acme Corp Brand Experience"
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#101113] via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Interactive Floating Badge 1: 1-Click Sign-off */}
                <div
                  ref={badge1Ref}
                  onClick={() => setSignedOff(!signedOff)}
                  className="hidden sm:flex absolute bottom-6 left-6 z-20 items-center gap-3 p-3 rounded-xl bg-[#101113]/92 backdrop-blur-md border border-[#34D399]/30 shadow-xl cursor-pointer hover:border-[#34D399]/60 transition-colors"
                >
                  <div className={`p-2 rounded-lg transition-colors ${signedOff ? 'bg-[#34D399] text-[#101113]' : 'bg-[#34D399]/15 text-[#34D399]'}`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-[#F5F5F3]">
                      {signedOff ? 'Sign-off Confirmed ✓' : '1-Click Client Sign-off'}
                    </div>
                    <div className="text-[11px] text-[#A1A5AD] font-mono">
                      {signedOff ? 'Audit timestamp logged' : 'Click to test sign-off'}
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2: Stripe Payout */}
                <div
                  ref={badge2Ref}
                  className="hidden sm:flex absolute top-6 right-6 z-20 items-center gap-3 p-3 rounded-xl bg-[#101113]/92 backdrop-blur-md border border-indigo-500/30 shadow-xl"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-[#F5F5F3]">Stripe Settlement</div>
                    <div className="text-[11px] text-[#34D399] font-mono">$4,500 Paid directly</div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="p-3.5 sm:p-4 bg-[#17191D] border-t border-[#2A2D33] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#A1A5AD]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span className="text-[#F5F5F3] font-medium">Interactive Demo:</span>
                  <span>Clients follow milestones with zero login friction.</span>
                </div>
                
                <Link
                  href="#sandbox"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex-shrink-0"
                >
                  <span>Test portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
