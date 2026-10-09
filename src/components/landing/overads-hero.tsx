'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUpRight, Play, Check, Sparkles, CheckCircle2,
  Clock, CreditCard, Shield, ExternalLink
} from 'lucide-react'
import { HaikeiLayeredWaves, HaikeiDotMatrix, HaikeiBlobAura } from '@/components/ui/haikei-backgrounds'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HeroProps {
  signupHref: string
}

export function OveradsHero({ signupHref }: HeroProps) {
  const [approvedState, setApprovedState] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const floatingBadge1Ref = useRef<HTMLDivElement>(null)
  const floatingBadge2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // 1. Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9 },
        0.1
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.55'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65 },
          '-=0.45'
        )
        .fromTo(
          showcaseRef.current,
          { opacity: 0, y: 60, scale: 0.94, rotateX: 8 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'power2.out' },
          '-=0.4'
        )

      // 2. ScrollTrigger 3D tilt & smooth levitation
      if (showcaseRef.current) {
        gsap.to(showcaseRef.current, {
          y: -25,
          scale: 1.01,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }

      // 3. Gentle floating badge animations
      if (floatingBadge1Ref.current) {
        gsap.to(floatingBadge1Ref.current, {
          y: -10,
          repeat: -1,
          yoyo: true,
          duration: 2.8,
          ease: 'sine.inOut',
        })
      }
      if (floatingBadge2Ref.current) {
        gsap.to(floatingBadge2Ref.current, {
          y: 10,
          repeat: -1,
          yoyo: true,
          duration: 3.2,
          ease: 'sine.inOut',
          delay: 0.5,
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="overview"
      ref={containerRef}
      className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden bg-[#101113] text-[#F5F5F3]"
      style={{ perspective: 1200 }}
    >
      {/* Haikei Ambient Background Elements */}
      <HaikeiBlobAura className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[850px]" opacity={0.16} />
      <HaikeiDotMatrix className="absolute inset-0 w-full h-full" opacity={0.07} />
      <HaikeiLayeredWaves className="absolute bottom-0 inset-x-0 w-full h-[320px]" opacity={0.06} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
          <span>The Client Workspace for Independent Professionals</span>
        </div>

        {/* Editorial Hero Heading */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.12] max-w-4xl mx-auto"
        >
          Your work, beautifully organised. <br />
          <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">
            Your clients, always in the loop.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p
          ref={subtitleRef}
          className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[#A1A5AD] font-normal leading-relaxed max-w-2xl mx-auto text-balance"
        >
          One simple workspace for clients to follow progress, review deliverables, and manage project updates — so you can spend less time chasing messages and more time doing your best work.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link
            href={signupHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white h-11 px-7 text-sm font-semibold transition-all hover:scale-[1.03] shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </Link>

          <Link
            href="/demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#17191D] hover:bg-[#1E2126] text-[#F5F5F3] border border-[#2A2D33] h-11 px-6 text-sm font-medium transition-all hover:border-indigo-500/50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-purple-400 fill-current" />
            <span>Explore the demo</span>
          </Link>
        </div>

        {/* Reassurance statement */}
        <p className="mt-3.5 text-xs text-[#A1A5AD]/80 font-mono">
          Set up your first client workspace in minutes · No credit card required
        </p>

        {/* ── CINEMATIC PRODUCT SHOWCASE WITH GENERATED VISUAL & LIVE CONTROLS ── */}
        <div
          ref={showcaseRef}
          className="relative mt-14 max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-[#2A2D33] bg-[#17191D] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(99,102,241,0.22)] overflow-hidden text-left ring-1 ring-white/10"
        >
          
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between border-b border-[#2A2D33] bg-[#101113] px-4 py-3 select-none">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs font-mono text-[#A1A5AD] hidden sm:inline">
                frevio.cloud/p/acme-brand-experience
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-[11px] font-medium font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                Live Client Portal
              </span>
            </div>
          </div>

          {/* Generated Product UI Graphic */}
          <div className="relative w-full aspect-[16/9] bg-[#0c0d10] overflow-hidden group">
            <Image
              src="/hero_client_portal.png"
              alt="Frevio Client Portal Interface showing Acme Corp Brand Experience with milestones, 1-Click Approve deliverable card, and Stripe deposit settlement"
              fill
              priority
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
            />

            {/* Subtle Gradient Vignette to ground the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101113] via-transparent to-transparent opacity-40 pointer-events-none" />

            {/* Floating Live Badge 1: 1-Click Sign-off */}
            <div
              ref={floatingBadge1Ref}
              className="hidden md:flex absolute bottom-8 left-8 z-20 items-center gap-3 p-3.5 rounded-xl bg-[#101113]/90 backdrop-blur-md border border-[#34D399]/30 shadow-xl"
            >
              <div className="p-2 rounded-lg bg-[#34D399]/15 text-[#34D399]">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-[#F5F5F3]">1-Click Client Sign-off</div>
                <div className="text-[11px] text-[#A1A5AD] font-mono">Homepage UI v2.4 Approved</div>
              </div>
            </div>

            {/* Floating Live Badge 2: Stripe Deposit Settled */}
            <div
              ref={floatingBadge2Ref}
              className="hidden md:flex absolute top-8 right-8 z-20 items-center gap-3 p-3.5 rounded-xl bg-[#101113]/90 backdrop-blur-md border border-indigo-500/30 shadow-xl"
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

          {/* Interactive Footer Controls Strip */}
          <div className="p-4 sm:p-5 bg-[#17191D] border-t border-[#2A2D33] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A5AD]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="text-[#F5F5F3] font-medium">Interactive Demonstration:</span>
              <span>Clients see progress in real time without creating accounts.</span>
            </div>
            
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              <span>Test live portal demo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
