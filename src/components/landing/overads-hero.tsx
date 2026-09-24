'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight, Check, CheckCircle2, Lock, DollarSign, TrendingUp,
  FileCode, Sparkles, FolderKanban, Clock, CreditCard, Zap,
  LayoutDashboard, FolderOpen, Users, FileText, Wallet, Timer, Send,
  AlertCircle, ChevronRight, ArrowRight, Plus
} from 'lucide-react'
import gsap from 'gsap'

interface HeroProps {
  signupHref: string
}

export function OveradsHero({ signupHref }: HeroProps) {
  const [approvedState, setApprovedState] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const channelsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.1
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.75 },
          '-=0.45'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65 },
          '-=0.4'
        )
        .fromTo(
          mockupRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
          '-=0.35'
        )
        .fromTo(
          channelsRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <section
        id="hero-pin"
        ref={sectionRef}
        className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-5 pt-28 pb-16 sm:px-8 md:pt-32 bg-[#090A0F]"
      >
        {/* ── 1. BACKGROUND: LINEAR / VERCEL STYLE ENGINEERED DARK CANVAS ── */}
        
        {/* Subtle Engineered Geometric Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_25%,#000_50%,transparent_100%)]"
        />

        {/* Precision Micro Dot Matrix Texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_35%,transparent_100%)]"
        />

        {/* Top Primary Indigo / Violet Ambient Spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-44 left-1/2 -translate-x-1/2 h-[550px] w-[1000px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22)_0%,rgba(139,92,246,0.1)_35%,rgba(9,10,15,0)_70%)] blur-[90px] z-0"
        />

        {/* Mid-Canvas Ambient Accent Aura (behind showcase) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[40%] left-1/2 -translate-x-1/2 h-[420px] w-[900px] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08)_0%,rgba(99,102,241,0.07)_40%,transparent_70%)] blur-[100px] z-0"
        />

        {/* Top Glowing Horizon Beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent blur-xs z-0"
        />

        {/* Bottom Seamless Cascade into Next Dark Section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-[#090A0F]"
        />

        {/* ── 2. FOREGROUND HERO CONTENT ── */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <h1
            ref={titleRef}
            className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.025em] leading-[1.15] max-w-4xl text-balance text-white"
          >
            Stop answering{' '}
            <span className="font-serif italic font-normal text-amber-300">
              &ldquo;Any updates?&rdquo;
            </span>{' '}
            texts at 11 PM.
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 max-w-4xl text-sm font-light leading-relaxed text-white/85 sm:text-base md:text-lg"
          >
            <span className="md:whitespace-nowrap block">
              Frevio gives your clients a single, passcode-locked dashboard to track project milestones, sign agreements,
            </span>
            <span className="block mt-1">
              and pay invoices via Stripe. No client registrations required.
            </span>
          </p>

          <div ref={ctaRef} className="mt-8 flex items-center justify-center">
            <Link
              href={signupHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white font-medium text-slate-950 hover:bg-white/90 h-11 px-7 text-sm transition-all hover:scale-[1.02] shadow-xl cursor-pointer"
            >
              <span>Start free</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* ── 3. DASHBOARD WORKSPACE SHOWCASE (The Real Frevio Dashboard) ── */}
        <div
          ref={mockupRef}
          className="relative z-10 mt-14 w-full max-w-6xl xl:max-w-7xl mx-auto rounded-3xl border border-white/15 bg-white shadow-[0_0_120px_-20px_rgba(99,102,241,0.22),0_40px_100px_-25px_rgba(0,0,0,0.85)] ring-1 ring-white/10 overflow-hidden text-left"
        >
          {/* Top Window Title Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-3.5 select-none">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-[#ff5f56]" />
              <div className="size-3 rounded-full bg-[#ffbd2e]" />
              <div className="size-3 rounded-full bg-[#27c93f]" />
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1 text-xs text-slate-700 font-mono shadow-2xs">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>frevio.cloud/dashboard</span>
              <span className="text-emerald-700 font-sans text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                Live
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="hidden sm:inline font-medium">Creative Studio</span>
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Full App Workspace Layout: Sidebar + Main Dashboard */}
          <div className="flex bg-slate-50/50">
            
            {/* Left App Sidebar (Desktop only) */}
            <div className="hidden md:flex w-60 bg-white border-r border-slate-200/80 p-5 flex-col justify-between select-none flex-shrink-0">
              <div className="space-y-6">
                {/* Logo and Workspace Label */}
                <div className="flex items-center gap-3 px-2">
                  <div className="size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-sm text-slate-900 truncate">Frevio Studio</span>
                    <span className="block text-[11px] text-slate-400 font-mono">Pro Plan</span>
                  </div>
                </div>

                {/* Sidebar Navigation */}
                <div className="space-y-1.5 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50/80 text-indigo-900 rounded-xl font-semibold border border-indigo-100/60 shadow-2xs">
                    <LayoutDashboard className="size-4 text-indigo-600" />
                    <span>Dashboard</span>
                    <span className="ml-auto size-1.5 rounded-full bg-indigo-600" />
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                    <FolderOpen className="size-4 text-slate-400" />
                    <span>Projects</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                    <Users className="size-4 text-slate-400" />
                    <span>Clients</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                    <FileText className="size-4 text-slate-400" />
                    <span>Invoices</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                    <Timer className="size-4 text-slate-400" />
                    <span>Time Log</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-colors cursor-pointer">
                    <TrendingUp className="size-4 text-slate-400" />
                    <span>Earnings</span>
                  </div>
                </div>
              </div>

              {/* VS Code Extension Live Sync Badge */}
              <div className="space-y-3.5 pt-5 border-t border-slate-100">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>VS Code Live Pulse</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono leading-tight truncate">
                    auth-middleware.ts
                  </p>
                </div>

                <div className="flex items-center gap-2.5 px-1">
                  <div className="size-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    JS
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">Jay Sharma</div>
                    <div className="text-[11px] text-slate-400 truncate">Senior Engineer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 p-6 sm:p-8 lg:p-9 space-y-6 overflow-hidden">
              
              {/* Dashboard Greeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-slate-900">
                    Good Morning, Jay
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <span>3 active projects</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-amber-600 font-medium">2 need attention</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 select-none">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs">
                    <Timer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Log time</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 text-white px-4 py-2 text-xs font-semibold shadow-xs hover:bg-slate-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New project</span>
                  </div>
                </div>
              </div>

              {/* 4 Overads KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Outstanding */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Outstanding</span>
                    <div className="size-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <DollarSign className="size-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-light font-mono text-rose-600 tabular-nums">$4,850</div>
                  <div className="text-xs text-slate-500 truncate">1 overdue invoice</div>
                </div>

                {/* KPI 2: This Month */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">This Month</span>
                    <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Wallet className="size-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-light font-mono text-slate-950 tabular-nums">$12,300</div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                    <span>↑ $2,400</span> <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* KPI 3: Hours This Week */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hours / Wk</span>
                    <div className="size-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Timer className="size-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-light font-mono text-slate-950 tabular-nums">24h 10m</div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                    <span>↑ 4h 15m</span> <span className="text-slate-500 font-normal">more</span>
                  </div>
                </div>

                {/* KPI 4: Active Projects */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Active</span>
                    <div className="size-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <FolderOpen className="size-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-light font-mono text-slate-950 tabular-nums">3</div>
                  <div className="text-xs text-slate-500 truncate">of 4 total</div>
                </div>
              </div>

              {/* Main Two-Column Split: Needs Attention + Projects List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left (7 Cols): Needs Attention Checklist */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-600 uppercase tracking-wider text-[11px]">
                      <AlertCircle className="size-3.5" />
                      <span>Needs Attention</span>
                    </div>
                    <span className="text-xs text-slate-400">2 actions required</span>
                  </div>

                  {/* Attention Item 1 */}
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 hover:border-amber-300 transition-colors shadow-2xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                        <Send className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-900 truncate">Acme Website Redesign</h5>
                        <p className="text-xs text-slate-500 truncate">No update sent in 7+ days · Acme Corp</p>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-medium shadow-xs flex-shrink-0 cursor-pointer hover:bg-slate-800 transition-colors">
                      <span>Send update</span>
                      <ChevronRight className="size-3.5" />
                    </div>
                  </div>

                  {/* Attention Item 2: Interactive 1-Click Client Sign-off */}
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4 hover:border-indigo-300 transition-colors shadow-2xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-slate-900 truncate">Brand Identity Mockup Draft</h5>
                        <p className="text-xs text-indigo-900/70 truncate">Waiting on client approval · Northstar</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApprovedState(!approvedState)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                        approvedState
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                      }`}
                    >
                      {approvedState ? (
                        <>
                          <Check className="size-3.5 text-white" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          <span>1-Click Sign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right (5 Cols): Live Projects Mini List */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Active Projects</span>
                    <span className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">View all →</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-2xs overflow-hidden">
                    {/* Project Row 1 */}
                    <div className="flex items-center justify-between gap-2 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="size-2 rounded-full bg-indigo-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 truncate">Acme Redesign</span>
                          <span className="block text-[11px] text-slate-400 truncate">Acme Corp</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        On track
                      </span>
                    </div>

                    {/* Project Row 2 */}
                    <div className="flex items-center justify-between gap-2 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="size-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 truncate">Stripe Billing API</span>
                          <span className="block text-[11px] text-slate-400 truncate">Voxel Labs</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono flex-shrink-0">
                        $3,200 Paid
                      </span>
                    </div>

                    {/* Project Row 3 */}
                    <div className="flex items-center justify-between gap-2 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="size-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 truncate">Northstar Brand</span>
                          <span className="block text-[11px] text-slate-400 truncate">Northstar Co</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                        Update due
                      </span>
                    </div>

                    {/* Project Row 4 */}
                    <div className="flex items-center justify-between gap-2 p-3.5 hover:bg-slate-50/80 transition-colors">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="size-2 rounded-full bg-violet-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-900 truncate">SaaS Client Portal</span>
                          <span className="block text-[11px] text-slate-400 truncate">Acme Ventures</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 flex-shrink-0">
                        Milestone 3
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Strip: Recent Cash Flow / Paid Invoices Bar */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Weekly Revenue Velocity: </span>
                    <span className="text-slate-500">3 invoices settled via Stripe this week</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    +$5,600.00 MTD
                  </span>
                  <span className="text-[11px] text-indigo-600 font-sans hover:underline cursor-pointer">
                    View Invoices →
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── 4. BOTTOM CHANNELS STRIP (13 Platforms) ── */}
        <div
          ref={channelsRef}
          className="mt-14 flex flex-col items-center gap-4 px-6 relative z-10"
        >
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
            Works with every channel you already use
          </p>
          <ul
            aria-label="Platforms works with"
            className="mx-auto flex max-w-[16.25rem] flex-wrap items-center justify-center gap-x-5 gap-y-4 text-slate-400 sm:max-w-none sm:gap-x-6"
          >
            {/* LinkedIn */}
            <li title="LinkedIn" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </li>
            {/* X / Twitter */}
            <li title="X / Twitter" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </li>
            {/* Instagram */}
            <li title="Instagram" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </li>
            {/* Facebook */}
            <li title="Facebook" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </li>
            {/* Threads */}
            <li title="Threads" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.61c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
              </svg>
            </li>
            {/* Bluesky */}
            <li title="Bluesky" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
              </svg>
            </li>
            {/* Mastodon */}
            <li title="Mastodon" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
              </svg>
            </li>
            {/* Telegram */}
            <li title="Telegram" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </li>
            {/* Pinterest */}
            <li title="Pinterest" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
              </svg>
            </li>
            {/* YouTube */}
            <li title="YouTube" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </li>
            {/* TikTok */}
            <li title="TikTok" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </li>
            {/* Google Ads */}
            <li title="Google Ads" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998zm19.4643-6.0004L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644zM7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z" />
              </svg>
            </li>
            {/* Snapchat Ads */}
            <li title="Snapchat Ads" className="grid size-5 place-items-center hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
              </svg>
            </li>
          </ul>
        </div>
      </section>

      {/* ── 5. BELOW HERO PROOF METRICS RIBBON (Overads Signature) ── */}
      <div className="px-6 pb-4 pt-4 md:pb-6 bg-[#090A0F] border-b border-white/[0.08]">
        <ul className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-4 gap-y-1.5 text-center text-sm text-slate-400 sm:flex-row">
          <li className="inline-flex items-center gap-4">40+ hours saved a month</li>
          <li className="inline-flex items-center gap-4">
            <span aria-hidden="true" className="hidden text-slate-600 sm:inline">·</span>
            Set up in five minutes
          </li>
        </ul>
      </div>
    </>
  )
}
