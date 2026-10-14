'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Lock, Sparkles, CreditCard, Send, Plus } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WorkflowPipelineDiagram } from './landing-diagrams'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function FrevioWorkflow() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLDivElement>(null)
  const stepsGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header reveal
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

      // 2. Diagram reveal
      if (diagramRef.current) {
        gsap.fromTo(
          diagramRef.current,
          { scale: 0.95, opacity: 0, y: 30 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: diagramRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 3. Staggered 5-step cards
      if (stepsGridRef.current) {
        gsap.fromTo(
          stepsGridRef.current.children,
          { y: 40, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: stepsGridRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const visualSteps = [
    {
      num: '01',
      title: 'Create Project',
      desc: 'Set project name, deliverables, & deadline in 60s.',
      visual: (
        <div className="rounded-lg bg-black/40 border border-white/[0.08] p-3 text-left space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Project</span>
            <span className="text-emerald-400">Active</span>
          </div>
          <div className="text-white font-sans text-xs font-medium">Acme Web Redesign</div>
          <div className="text-slate-400 text-[10px]">Due Nov 30 · 4 Milestones</div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'Define Milestones',
      desc: 'Set deliverables and Stripe invoice amounts.',
      visual: (
        <div className="rounded-lg bg-black/40 border border-white/[0.08] p-3 text-left space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Milestones</span>
            <span className="text-indigo-400">75%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }} />
          </div>
          <div className="text-slate-300 text-[10px] flex justify-between">
            <span>Stage 3 of 4</span>
            <span className="text-emerald-400">$3,500</span>
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: 'Share Passcode',
      desc: 'Client gets private link. Zero signup required.',
      visual: (
        <div className="rounded-lg bg-black/40 border border-white/[0.08] p-3 text-left space-y-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Lock className="w-3 h-3" />
            <span>Passcode Link</span>
          </div>
          <div className="flex justify-center gap-1">
            {['8', '4', '2', '9'].map((n, i) => (
              <span key={i} className="size-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                {n}
              </span>
            ))}
          </div>
          <div className="text-center text-[10px] text-slate-400">1-click client entry</div>
        </div>
      ),
    },
    {
      num: '04',
      title: 'Post Updates',
      desc: 'Weekly recap delivered to portal & client email.',
      visual: (
        <div className="rounded-lg bg-black/40 border border-white/[0.08] p-3 text-left space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Update #4</span>
            <span className="text-emerald-400">Sent</span>
          </div>
          <div className="text-slate-300 text-[10px] line-clamp-2 font-sans">
            ✓ Staging checkout build live for client review
          </div>
          <div className="text-[10px] text-slate-500">Email digest auto-sent</div>
        </div>
      ),
    },
    {
      num: '05',
      title: 'Sign-off & Pay',
      desc: 'Client 1-click approves and pays via Stripe.',
      visual: (
        <div className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 p-3 text-left space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-emerald-400">
            <span>Approved</span>
            <span>Stripe</span>
          </div>
          <div className="text-white text-xs font-sans font-semibold">$3,500.00 Settled</div>
          <div className="text-emerald-400 text-[10px]">✓ Direct Bank Payout</div>
        </div>
      ),
    },
  ]

  return (
    <section ref={sectionRef} id="workflow" className="py-16 md:py-24 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How it works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            From project kickoff to final payout.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            A simple 5-step visual pipeline that keeps client work calm, transparent, and completely professional.
          </p>
        </div>

        {/* ── High-Fidelity Interactive Pipeline Diagram ── */}
        <div ref={diagramRef} className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0c0d14] p-5 sm:p-7 shadow-2xl overflow-x-auto will-change-transform">
          <WorkflowPipelineDiagram className="min-w-[620px] w-full max-w-4xl mx-auto" />
        </div>

        {/* ── Visual 5-Step Cards Grid ── */}
        <div ref={stepsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {visualSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.08] bg-[#0d0e14] p-4 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/20 transition-all group will-change-transform"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-indigo-400 mb-2">
                  <span>{step.num}</span>
                  <span className="text-slate-500 text-[10px]">STEP</span>
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Visual mini-mockup */}
              {step.visual}
            </div>
          ))}
        </div>

        {/* Working Demo Prompt */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            Want to see how this looks from both the freelancer and client perspective?
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white hover:text-indigo-300 transition-colors"
          >
            Launch interactive demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
