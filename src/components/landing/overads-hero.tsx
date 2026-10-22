'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, ArrowRight, Terminal, ShieldCheck, Zap, Radio, ChevronDown,
  Check, Lock, Sparkles, CheckCircle2, Clock, FileCode, CreditCard,
  ExternalLink, Download, FolderKanban, DollarSign, TrendingUp, Users,
  Play, Pause, RotateCcw
} from 'lucide-react'
import gsap from 'gsap'

const WORKFLOW_PROMPTS = [
  "Broadcast live coding status: 'Payment webhook refactor'...",
  "Draft this week's progress update for Acme Corp in 1-click...",
  "Convert 16.5 logged VS Code hours into a Stripe invoice...",
  "Send contract agreement for client sign-off with 50% deposit...",
]

interface HeroProps {
  signupHref: string
}

export function OveradsHero({ signupHref }: HeroProps) {
  const [promptIdx, setPromptIdx] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [approvedState, setApprovedState] = useState(false)
  const [demoPhase, setDemoPhase] = useState<0 | 1 | 2>(0)
  const [isDemoPlaying, setIsDemoPlaying] = useState(true)
  const [demoSeconds, setDemoSeconds] = useState(0)
  const [demoView, setDemoView] = useState<'walkthrough' | 'workspace'>('walkthrough')

  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const commandCardRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const trustRibbonRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  // Flank Cards & Spotlight Refs
  const leftFlankRef = useRef<HTMLDivElement>(null)
  const rightFlankRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const auraGlowRef = useRef<HTMLDivElement>(null)

  // Rotating workflow prompt interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      const timer = setTimeout(() => {
        setPromptIdx((prev) => (prev + 1) % WORKFLOW_PROMPTS.length)
        setIsFading(false)
      }, 240)
      return () => clearTimeout(timer)
    }, 4200)

    return () => clearInterval(interval)
  }, [])

  // 30-Second Demo Video/Simulation Timer
  useEffect(() => {
    if (!isDemoPlaying || demoView !== 'walkthrough') return

    const interval = setInterval(() => {
      setDemoSeconds((prev) => {
        const next = (prev + 1) % 30
        if (next < 10) setDemoPhase(0)
        else if (next < 20) setDemoPhase(1)
        else setDemoPhase(2)
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isDemoPlaying, demoView])

  // Interactive mouse spotlight & parallax tracker
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 250
    const y = e.clientY - rect.top - 250

    if (spotlightRef.current) {
      gsap.to(spotlightRef.current, {
        x,
        y,
        duration: 0.7,
        ease: 'power2.out',
      })
    }

    if (leftFlankRef.current) {
      const offsetX = (e.clientX / window.innerWidth - 0.5) * -16
      const offsetY = (e.clientY / window.innerHeight - 0.5) * -16
      gsap.to(leftFlankRef.current, { x: offsetX, y: offsetY, duration: 0.8, ease: 'power1.out' })
    }

    if (rightFlankRef.current) {
      const offsetX = (e.clientX / window.innerWidth - 0.5) * 16
      const offsetY = (e.clientY / window.innerHeight - 0.5) * 16
      gsap.to(rightFlankRef.current, { x: offsetX, y: offsetY, duration: 0.8, ease: 'power1.out' })
    }
  }, [])

  // GSAP Choreographed Entrance & Loops
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      // 1. Gentle breathing aura glow behind title
      if (!prefersReducedMotion && auraGlowRef.current) {
        gsap.to(auraGlowRef.current, {
          scale: 1.15,
          opacity: 0.85,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // 2. Floating Flank Cards Bobbing Physics
      if (!prefersReducedMotion) {
        if (leftFlankRef.current) {
          gsap.to(leftFlankRef.current, {
            y: '-=12',
            duration: 4.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        }
        if (rightFlankRef.current) {
          gsap.to(rightFlankRef.current, {
            y: '+=12',
            duration: 4.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.6,
          })
        }
      }

      // 3. Main Content Staggered Entrance Reveal
      if (!prefersReducedMotion) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.fromTo(
          badgeRef.current,
          { opacity: 0, y: -16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.5)' },
          0.1
        )
          .fromTo(
            titleRef.current,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.4'
          )
          .fromTo(
            subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7 },
            '-=0.5'
          )
          .fromTo(
            commandCardRef.current,
            { opacity: 0, y: 22, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power4.out' },
            '-=0.45'
          )
          .fromTo(
            actionsRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.65 },
            '-=0.4'
          )
          .fromTo(
            trustRibbonRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
          )
          .fromTo(
            mockupRef.current,
            { opacity: 0, y: 40, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' },
            '-=0.4'
          )
          .fromTo(
            [leftFlankRef.current, rightFlankRef.current],
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.7, stagger: 0.2 },
            '-=0.6'
          )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative isolate min-h-screen flex flex-col items-center justify-start overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:pt-28 select-none sm:select-auto bg-[#08090a]"
    >
      {/* ── 1. UNIFIED AMBIENT LIGHTING BACKGROUND (Clean luxury mesh) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Primary Ambient Aura (Centered behind typography) */}
        <div
          ref={auraGlowRef}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[650px] w-[850px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22)_0%,rgba(147,51,234,0.14)_35%,rgba(16,185,129,0.06)_60%,transparent_75%)] blur-3xl opacity-75"
        />

        {/* Top Horizon Accent Glow Arch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[320px] w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(129,140,248,0.25),rgba(99,102,241,0.1)_40%,transparent_70%)]" />

        {/* Top Laser Horizon Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 max-w-4xl bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />

        {/* Interactive Mouse Follower Spotlight */}
        <div
          ref={spotlightRef}
          className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,rgba(168,85,247,0.08)_40%,transparent_70%)] blur-2xl transition-opacity duration-300"
        />

        {/* Full-Cover Seamless Matrix Grid */}
        <div
          className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_85%_70%_at_50%_40%,#000_20%,transparent_85%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Micro Texture Matrix Dots */}
        <div
          className="absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_30%,transparent_85%)]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Seamless Bottom Section Transition */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#08090a] via-[#08090a]/90 to-transparent" />
      </div>

      {/* ── 2. FLOATING FLANK PARALLAX CARDS (Desktop Viewports) ── */}
      {/* Left Flank Card: Live VS Code Dev Presence */}
      <div
        ref={leftFlankRef}
        className="hidden 2xl:flex absolute left-8 top-72 z-20 w-72 flex-col gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#0e1017]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-emerald-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>VS Code Live Pulse</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">3.4h today</span>
        </div>
        <div className="text-xs font-medium text-white flex items-center gap-1.5 truncate">
          <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="truncate">auth-middleware.ts</span>
        </div>
        <p className="text-xs text-slate-400 leading-snug">
          Refactoring Stripe webhook idempotency keys & client portal.
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-emerald-400/90 pt-2 border-t border-white/5 font-mono">
          <span>Auto-synced to portal</span>
          <span>4m ago</span>
        </div>
      </div>

      {/* Right Flank Card: Instant Stripe Settlement */}
      <div
        ref={rightFlankRef}
        className="hidden 2xl:flex absolute right-8 top-72 z-20 w-72 flex-col gap-2.5 rounded-2xl border border-indigo-500/30 bg-[#0e1017]/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-indigo-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Stripe Payout</span>
          </div>
          <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
            Paid
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-white tracking-tight">$4,800.00</span>
          <span className="text-xs text-slate-400">USD</span>
        </div>
        <p className="text-xs text-slate-400 leading-snug">
          Milestone 2/4 deliverable approved by Acme Studio.
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/5 font-mono">
          <span>Direct Stripe Payout</span>
          <span className="text-emerald-400 font-semibold">Settled</span>
        </div>
      </div>

      {/* ── 3. FOREGROUND MAIN HERO CONTENT ── */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center mx-auto">
        
        {/* High-Intent Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-tight text-emerald-200">Built for Freelancers & Independent Studios</span>
        </div>

        {/* Hero Title (Overads.io light uppercase signature) */}
        <h1
          ref={titleRef}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light uppercase tracking-[-0.02em] leading-[1.02] max-w-4xl text-balance text-white"
        >
          <span className="block text-slate-200">Your VS Code posts</span>
          <span className="block text-white">the status update.</span>
          <span className="block text-indigo-400">Approved milestones become paid invoices.</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 max-w-2xl text-balance text-sm font-light leading-relaxed text-slate-300 md:text-base"
        >
          Your editor tracks the work. Clients review progress in one calm link without passwords. Approved milestones trigger Stripe invoices straight to your bank. Free for your first 2 active projects.
        </p>

        {/* Interactive Live Command Terminal Box */}
        <div ref={commandCardRef} className="mt-8 w-full max-w-xl sm:max-w-2xl">
          <Link
            href={signupHref}
            className="group flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-[#0e1017]/80 p-2.5 pl-4 text-left shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 hover:border-indigo-500/40 hover:bg-[#12141f]/90 ring-1 ring-white/5"
          >
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors flex-shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>

            <div className="flex min-w-0 flex-1 items-center overflow-hidden py-1 text-xs sm:text-sm text-slate-200 h-8">
              <span
                className={`truncate transition-all duration-300 font-mono ${
                  isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              >
                {WORKFLOW_PROMPTS[promptIdx]}
              </span>
            </div>

            <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-900 transition-transform group-hover:scale-105 group-hover:bg-slate-100 shadow-md">
              <ArrowUpRight className="size-4" />
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div
          ref={actionsRef}
          className="mt-8 flex flex-col items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link
            href={signupHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(255,255,255,0.35)] cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Core Integration Flow Strip */}
        <div className="mt-12 flex flex-col items-center gap-4 px-6">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
            Built-in native workflow
          </p>
          <ul className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-300 text-xs font-mono">
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-400" /> VS Code</li>
            <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-indigo-400" /> GitHub</li>
            <li className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Stripe Connect</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Client Portal</li>
          </ul>
        </div>

      </div>

      {/* ── 4. 30-SECOND WORKFLOW DEMO & WORKSPACE SHOWCASE (Above the fold) ── */}
      <div
        ref={mockupRef}
        className="relative z-10 mt-12 w-full max-w-5xl mx-auto rounded-2xl border border-white/15 bg-[#0b0d13]/95 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden"
      >
        {/* Top Window Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#080a0f]/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-[#ff5f56]/80" />
            <div className="size-3 rounded-full bg-[#ffbd2e]/80" />
            <div className="size-3 rounded-full bg-[#27c93f]/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
              frevio.app · 30-second workflow
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 text-xs">
            <button
              type="button"
              onClick={() => setDemoView('walkthrough')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                demoView === 'walkthrough'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>30s Demo Flow</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoView('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                demoView === 'workspace'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderKanban className="w-3 h-3" />
              <span>Studio View</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="hidden md:inline">No Frevio fees</span>
            <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* 30-SECOND WORKFLOW WALKTHROUGH VIEW */}
        {demoView === 'walkthrough' ? (
          <div className="p-5 sm:p-7 space-y-6 bg-gradient-to-b from-[#0b0d13] to-[#08090d]">
            {/* Scrubber & Phase Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                  className="size-9 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                  aria-label={isDemoPlaying ? 'Pause 30-second demo' : 'Play 30-second demo'}
                >
                  {isDemoPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoSeconds(0)
                    setDemoPhase(0)
                  }}
                  className="size-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                  aria-label="Restart 30-second demo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="font-mono text-xs text-slate-300 ml-1">
                  <span className="text-emerald-400 font-semibold">0:{demoSeconds.toString().padStart(2, '0')}</span>
                  <span className="text-slate-500"> / 0:30</span>
                </div>
              </div>

              {/* Phase Switch Pills */}
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDemoSeconds(0)
                    setDemoPhase(0)
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    demoPhase === 0
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400">00-10s</span>
                  <span className="font-medium">1. Editor Pulse</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoSeconds(10)
                    setDemoPhase(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    demoPhase === 1
                      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20'
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400">10-20s</span>
                  <span className="font-medium">2. Client Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoSeconds(20)
                    setDemoPhase(2)
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    demoPhase === 2
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20'
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400">20-30s</span>
                  <span className="font-medium">3. Stripe Paid</span>
                </button>
              </div>
            </div>

            {/* Timed Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400 transition-all duration-300 ease-linear"
                style={{ width: `${((demoSeconds + 1) / 30) * 100}%` }}
              />
            </div>

            {/* PHASE 0: VS CODE PULSE */}
            {demoPhase === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5">
                <div className="md:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Step 1: Editor Telemetry</span>
                  </div>
                  <h3 className="text-xl font-light text-white tracking-tight">
                    Your code logs the work. You never open a timesheet.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    VS Code extension transmits heartbeats while you write code. Inactive periods auto-pause after 5 minutes so no phantom hours are ever recorded.
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-2 border-t border-white/5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>3.4h logged today · Staged for Milestone 2</span>
                  </div>
                </div>

                <div className="md:col-span-7 rounded-lg border border-white/10 bg-[#07080c] p-4 font-mono text-xs text-slate-300 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 text-white">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      src/lib/stripe-webhook.ts
                    </span>
                    <span className="text-emerald-400">VS Code Connected</span>
                  </div>
                  <div className="text-slate-400 text-[11px] space-y-1">
                    <p className="text-emerald-300">✓ git commit -m &quot;feat(stripe): verified payout webhook handlers&quot;</p>
                    <p className="text-slate-300">→ Telemetry event: 42 mins focused coding</p>
                    <p className="text-slate-300">→ Progress synced to Acme Studio client portal</p>
                    <p className="text-indigo-400">→ Milestone 2 reached: 100% complete</p>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 1: CLIENT PORTAL REVIEW */}
            {demoPhase === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-5">
                <div className="md:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Step 2: Password-Free Portal</span>
                  </div>
                  <h3 className="text-xl font-light text-white tracking-tight">
                    One clean link. Instant milestone review.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clients never register an account or remember a password. They open their private secure link, test deliverables, and approve with a single click.
                  </p>
                  <div className="text-[11px] font-mono text-indigo-300 flex items-center gap-2 pt-2 border-t border-white/5">
                    <span>100% password-free · Tokenized link security</span>
                  </div>
                </div>

                <div className="md:col-span-7 rounded-lg border border-white/10 bg-[#07080c] p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-white">Milestone 2: Stripe Billing Engine</div>
                      <div className="text-[11px] text-slate-400">Acme Studio · Review staging URL</div>
                    </div>
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Ready for sign-off
                    </span>
                  </div>
                  <div className="rounded border border-white/5 bg-white/[0.02] p-2.5 text-xs text-slate-300 flex items-center justify-between">
                    <span>Deliverable staging: https://staging.acmestudio.app</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setApprovedState(!approvedState)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{approvedState ? 'Approved ✓' : 'Client Approves Milestone'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 2: STRIPE SETTLEMENT */}
            {demoPhase === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-amber-500/20 bg-amber-950/10 p-5">
                <div className="md:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Step 3: Direct Stripe Settlement</span>
                  </div>
                  <h3 className="text-xl font-light text-white tracking-tight">
                    Milestone approved. Paid straight to your bank.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Client sign-off generates the final invoice automatically. Stripe transfers funds directly to your connected bank account with zero Frevio transaction fees.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2 pt-2 border-t border-white/5">
                    <span>Direct Stripe payout · No Frevio cuts</span>
                  </div>
                </div>

                <div className="md:col-span-7 rounded-lg border border-white/10 bg-[#07080c] p-4 font-mono text-xs text-slate-300 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-white font-semibold">Invoice #INV-2026-084</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                      PAID ✓
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400">Total Settled</span>
                    <span className="text-2xl font-bold text-white">$4,800.00 USD</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-white/5">
                    <p className="flex justify-between">
                      <span>Frevio Platform Fee</span>
                      <span className="text-emerald-400 font-semibold">$0.00 (0%)</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Payout Target</span>
                      <span className="text-slate-300">Stripe Connected Bank</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* WORKSPACE VIEW (Original Project Explorer) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-gradient-to-b from-transparent to-black/40">
            {/* Left Summary Panel (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Workspace
              </div>

              {/* Metric 1: Active Projects */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Active Projects</span>
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">08</span>
                  <span className="text-xs text-emerald-400 font-medium">+2 this month</span>
                </div>
              </div>

              {/* Metric 2: Outstanding Invoices */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Outstanding</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">$2,400</span>
                  <span className="text-xs text-slate-400">1 invoice due</span>
                </div>
              </div>

              {/* Quick Extension Status Pill */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center gap-3">
                <div className="size-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                <div className="text-xs">
                  <span className="text-white font-medium">VS Code Live Sync: </span>
                  <span className="text-emerald-300 font-mono">auth-middleware.ts</span>
                </div>
              </div>
            </div>

            {/* Right Live Projects & Settlement List (8 Cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <span>Recent Projects</span>
                <Link href={signupHref} className="text-indigo-400 hover:text-indigo-300 transition-colors lowercase font-normal text-xs">
                  view all →
                </Link>
              </div>

              {/* Project Row 1: Website Redesign (Acme Studio) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Website Redesign</h4>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">Acme Studio</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Milestone 2 of 4 · Database & Stripe Webhooks
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden hidden md:block">
                    <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-indigo-500" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    In progress
                  </span>
                </div>
              </div>

              {/* Project Row 2: Brand Identity (Northstar) - 1-Click Interactive Sign-off */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-4 hover:border-indigo-500/40 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Brand Identity & Design System</h4>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">Northstar</span>
                  </div>
                  <p className="text-xs text-indigo-200/80">
                    Weekly Milestone Digest #3 ready for staging sign-off
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setApprovedState(!approvedState)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      approvedState
                        ? 'bg-emerald-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                        : 'bg-white text-slate-950 hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95'
                    }`}
                  >
                    {approvedState ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        <span>Deliverable Approved ✓</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                        </span>
                        <span>Try 1-Click Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Project Row 3: API Architecture (Voxel Labs) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">Stripe Checkout & Billing Engine</h4>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400">Voxel Labs</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Invoice #INV-2026-084 · $3,200.00 USD
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    ✓ Paid (Stripe)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. CORE VALUE STRIP (Verified product facts) ── */}
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-400 font-mono text-center px-4">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live VS Code sync
        </span>
        <span className="hidden sm:inline text-white/20">·</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Direct Stripe payouts
        </span>
        <span className="hidden sm:inline text-white/20">·</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Free for 2 active projects
        </span>
      </div>

    </section>
  )
}
