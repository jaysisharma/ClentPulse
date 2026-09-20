'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight, Terminal, FileCode, Sparkles, FolderKanban, Clock,
  CreditCard, Check
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

  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const commandCardRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)

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

  // GSAP Choreographed Entrance
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
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
            actionsRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.65 },
            '-=0.4'
          )
          .fromTo(
            commandCardRef.current,
            { opacity: 0, y: 20, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power4.out' },
            '-=0.4'
          )
          .fromTo(
            toolsRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
          )
          .fromTo(
            proofRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
          )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero-pin"
      ref={sectionRef}
      className="relative isolate min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-16 sm:px-8 md:pt-36 select-none sm:select-auto bg-white"
    >
      {/* ── 1. BACKGROUND HERO SKY IMAGE (Overads Signature) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-10 z-0 overflow-hidden">
        <Image
          src="/hero.png"
          alt="Sky clouds background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none select-none"
        />
      </div>

      {/* Luminous Light Overlay for Perfect Text Legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.40)_55%,rgba(255,255,255,0.10)_80%,transparent_100%)]"
      />

      {/* Seamless Bottom Gradient Fade into next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 bg-gradient-to-b from-transparent via-white/80 to-white"
      />

      {/* ── 2. FOREGROUND HERO CONTENT ── */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center mx-auto">

        {/* High-Intent Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 text-xs font-medium text-slate-800 mb-6 shadow-xs backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-tight text-slate-800 font-medium">Built for Freelancers & Independent Studios</span>
        </div>

        {/* Hero Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.025em] leading-[1.12] max-w-4xl text-balance text-slate-950"
        >
          Stop answering{' '}
          <span className="inline-block rounded-full bg-indigo-600 text-white px-3.5 sm:px-5 py-0.5 sm:py-1 font-normal shadow-sm">
            &ldquo;Any updates?&rdquo;
          </span>{' '}
          texts at 11 PM.
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 max-w-2xl text-balance text-sm font-light leading-relaxed text-slate-700 md:text-base"
        >
          Frevio gives your clients a single, passcode-locked dashboard to track project milestones, sign agreements, and pay invoices via Stripe. No client registrations required.
        </p>

        {/* Primary Action Button */}
        <div
          ref={actionsRef}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href={signupHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-8 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] shadow-lg shadow-slate-950/15 cursor-pointer"
          >
            <span>Start free</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Interactive Live Command Terminal Box */}
        <div ref={commandCardRef} className="mt-8 w-full max-w-xl sm:max-w-2xl">
          <Link
            href={signupHref}
            className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-2.5 pl-4 text-left shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-indigo-400 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.12)] ring-1 ring-slate-900/5"
          >
            <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-slate-950 transition-colors flex-shrink-0">
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

        {/* Integration Tools Strip */}
        <div ref={toolsRef} className="mt-12 flex flex-col items-center gap-3.5 px-6">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">
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

        {/* Proof Ribbon */}
        <div
          ref={proofRef}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600 font-light"
        >
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            40+ hours saved a month
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Set up in five minutes
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Free forever, no credit card
          </span>
        </div>

      </div>
    </section>
  )
}
