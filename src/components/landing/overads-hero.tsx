'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, ArrowRight, Terminal, ShieldCheck, Zap, Radio, ChevronDown,
  Check, Lock, Sparkles, CheckCircle2, Clock, FileCode, CreditCard,
  ExternalLink, Download, FolderKanban, DollarSign, TrendingUp, Users
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
      className="relative isolate min-h-screen flex flex-col items-center justify-start overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:pt-28 select-none sm:select-auto bg-gradient-to-b from-white via-slate-50 to-white"
    >
      {/* ── 1. UNIFIED AMBIENT LIGHTING BACKGROUND (Luminous Light Mode) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Primary Ambient Aura */}
        <div
          ref={auraGlowRef}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[650px] w-[850px] max-w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.09)_0%,rgba(147,51,234,0.05)_35%,rgba(16,185,129,0.03)_60%,transparent_75%)] blur-3xl opacity-80"
        />

        {/* Top Horizon Accent Glow Arch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[320px] w-full max-w-5xl bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),rgba(147,51,234,0.03)_40%,transparent_70%)]" />

        {/* Top Laser Horizon Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 max-w-4xl bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        {/* Interactive Mouse Follower Spotlight */}
        <div
          ref={spotlightRef}
          className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,rgba(168,85,247,0.03)_40%,transparent_70%)] blur-2xl transition-opacity duration-300"
        />

        {/* Full-Cover Seamless Matrix Grid (Light) */}
        <div
          className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_85%_70%_at_50%_40%,#000_20%,transparent_85%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Micro Texture Matrix Dots */}
        <div
          className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_30%,transparent_85%)]"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Seamless Bottom Section Transition */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* ── 2. FLOATING FLANK PARALLAX CARDS (Light Mode Luxury) ── */}
      {/* Left Flank Card: Live VS Code Dev Presence */}
      <div
        ref={leftFlankRef}
        className="hidden 2xl:flex absolute left-8 top-72 z-20 w-72 flex-col gap-2.5 rounded-2xl border border-emerald-200 bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-emerald-500/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>VS Code Live Pulse</span>
          </div>
          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">3.4h today</span>
        </div>
        <div className="text-xs font-medium text-slate-900 flex items-center gap-1.5 truncate">
          <FileCode className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="truncate">auth-middleware.ts</span>
        </div>
        <p className="text-xs text-slate-600 leading-snug">
          Refactoring Stripe webhook idempotency keys & client portal.
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-emerald-700 pt-2 border-t border-slate-100 font-mono">
          <span>Auto-synced to portal</span>
          <span>4m ago</span>
        </div>
      </div>

      {/* Right Flank Card: Instant Stripe Settlement */}
      <div
        ref={rightFlankRef}
        className="hidden 2xl:flex absolute right-8 top-72 z-20 w-72 flex-col gap-2.5 rounded-2xl border border-indigo-200 bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-indigo-500/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Stripe Instant Settlement</span>
          </div>
          <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
            Paid
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-950 tracking-tight">$4,800.00</span>
          <span className="text-xs text-slate-500">USD</span>
        </div>
        <p className="text-xs text-slate-600 leading-snug">
          Milestone 2/4 deliverable approved by Acme Studio.
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-mono">
          <span>Direct to Bank (Instant)</span>
          <span className="text-emerald-700 font-semibold">Settled</span>
        </div>
      </div>

      {/* ── 3. FOREGROUND MAIN HERO CONTENT ── */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center mx-auto">
        
        {/* High-Intent Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-800 mb-6 shadow-2xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-tight text-emerald-800 font-medium">Built for Freelancers & Independent Studios</span>
        </div>

        {/* Hero Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.025em] leading-[1.05] max-w-4xl text-balance text-slate-950"
        >
          Stop answering <span className="text-indigo-600 font-normal">&ldquo;Any updates?&rdquo;</span> texts at 11 PM.
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 max-w-2xl text-balance text-sm font-light leading-relaxed text-slate-600 md:text-base"
        >
          Frevio gives your clients a single, passcode-locked dashboard to track project milestones, sign agreements, and pay invoices via Stripe. No client registrations required.
        </p>

        {/* Interactive Live Command Terminal Box */}
        <div ref={commandCardRef} className="mt-8 w-full max-w-xl sm:max-w-2xl">
          <Link
            href={signupHref}
            className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pl-4 text-left shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-indigo-400 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.12)] ring-1 ring-slate-900/5"
          >
            <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors flex-shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>

            <div className="flex min-w-0 flex-1 items-center overflow-hidden py-1 text-xs sm:text-sm text-slate-800 h-8">
              <span
                className={`truncate transition-all duration-300 font-mono ${
                  isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              >
                {WORKFLOW_PROMPTS[promptIdx]}
              </span>
            </div>

            <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition-transform group-hover:scale-105 group-hover:bg-indigo-600 shadow-sm">
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-md cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Integration Tools Strip */}
        <div className="mt-12 flex flex-col items-center gap-4 px-6">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">
            Works with every tool you already use
          </p>
          <ul className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-700 text-xs font-mono">
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-600" /> VS Code</li>
            <li className="flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5 text-indigo-600" /> GitHub</li>
            <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-600" /> Figma</li>
            <li className="flex items-center gap-1.5"><FolderKanban className="w-3.5 h-3.5 text-amber-600" /> Google Drive</li>
            <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" /> Google Calendar</li>
            <li className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Stripe</li>
          </ul>
        </div>

      </div>

      {/* ── 4. CLEAN, HIGH-LEGIBILITY WORKSPACE SHOWCASE ── */}
      <div
        ref={mockupRef}
        className="relative z-10 mt-12 w-full max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.10)] ring-1 ring-slate-900/5 overflow-hidden"
      >
        {/* Top Window Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-[#ff5f56]" />
            <div className="size-3 rounded-full bg-[#ffbd2e]" />
            <div className="size-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1 text-xs text-slate-700 font-mono shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>frevio.app/workspace</span>
            <span className="text-emerald-700 font-sans text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
              Live
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="hidden sm:inline font-medium">Studio Workspace</span>
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Workspace Layout: Left Quick Metrics + Right Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-gradient-to-b from-transparent to-slate-50/50">
          
          {/* Left Summary Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Workspace
            </div>

            {/* Metric 1: Active Projects */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Projects</span>
                <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-950">08</span>
                <span className="text-xs text-emerald-700 font-medium">+2 this month</span>
              </div>
            </div>

            {/* Metric 2: Outstanding Invoices */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Outstanding</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-950">$2,400</span>
                <span className="text-xs text-slate-500">1 invoice due</span>
              </div>
            </div>

            {/* Quick Extension Status Pill */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              <div className="text-xs">
                <span className="text-slate-900 font-medium">VS Code Live Sync: </span>
                <span className="text-emerald-800 font-mono">auth-middleware.ts</span>
              </div>
            </div>
          </div>

          {/* Right Live Projects & Settlement List (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Recent Projects</span>
              <Link href={signupHref} className="text-indigo-600 hover:text-indigo-800 transition-colors lowercase font-normal text-xs">
                view all →
              </Link>
            </div>

            {/* Project Row 1: Website Redesign (Acme Studio) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 shadow-2xs transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Website Redesign</h4>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Acme Studio</span>
                </div>
                <p className="text-xs text-slate-600">
                  Milestone 2 of 4 · Database & Stripe Webhooks
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden hidden md:block">
                  <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-indigo-600" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  In progress
                </span>
              </div>
            </div>

            {/* Project Row 2: Brand Identity (Northstar) - 1-Click Interactive Sign-off */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 hover:border-indigo-300 shadow-2xs transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Brand Identity & Design System</h4>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Northstar</span>
                </div>
                <p className="text-xs text-indigo-900/80">
                  AI Weekly Digest #3 ready for staging sign-off
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setApprovedState(!approvedState)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    approvedState
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {approvedState ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Deliverable Approved</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                      <span>1-Click Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Project Row 3: API Architecture (Voxel Labs) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 shadow-2xs transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Stripe Checkout & Billing Engine</h4>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Voxel Labs</span>
                </div>
                <p className="text-xs text-slate-600">
                  Invoice #INV-2026-084 · $3,200.00 USD
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  ✓ Paid (Instant)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── 5. TRUST METRIC ROW (Overads.io signature) ── */}
      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-600 font-mono text-center px-4">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          40+ hours saved a month
        </span>
        <span className="hidden sm:inline text-slate-300">·</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          Set up in five minutes
        </span>
        <span className="hidden sm:inline text-slate-300">·</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          Free for your first 2 active clients
        </span>
      </div>

    </section>
  )
}
