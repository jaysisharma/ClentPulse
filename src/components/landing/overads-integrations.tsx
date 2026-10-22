'use client'

import { useEffect, useRef } from 'react'
import { Terminal, Shield, CreditCard, Mail, Globe, Radio, Database, Check } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function OveradsIntegrations() {
  const sectionRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const node1Ref = useRef<HTMLDivElement>(null)
  const arrow1Ref = useRef<HTMLDivElement>(null)
  const node2Ref = useRef<HTMLDivElement>(null)
  const arrow2Ref = useRef<HTMLDivElement>(null)
  const node3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Container entrance
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. Left column text entrance
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 3. Sequential pipeline illumination
      const pipelineTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.pipeline-board',
          start: 'top 85%',
          once: true,
        },
      })

      pipelineTl
        .from(node1Ref.current, {
          scale: 0.85,
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'back.out(1.5)',
        })
        .from(
          arrow1Ref.current,
          {
            opacity: 0,
            x: -10,
            duration: 0.4,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .from(
          node2Ref.current,
          {
            scale: 0.85,
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'back.out(1.6)',
          },
          '-=0.2'
        )
        .from(
          arrow2Ref.current,
          {
            opacity: 0,
            x: -10,
            duration: 0.4,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .from(
          node3Ref.current ? node3Ref.current.children : [],
          {
            opacity: 0,
            x: 20,
            stagger: 0.12,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.2'
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="integrations" className="py-24 lg:py-32 px-6 bg-[#07080b] border-t border-white/[0.04]">
      <div ref={containerRef} className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-[#0c0d14] border border-white/[0.08] shadow-2xl p-7 sm:p-12 md:p-14">

        <div className="grid gap-12 lg:grid-cols-12 items-center">

          {/* Left Column: Description */}
          <div ref={leftColRef} className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
              <span>Connected Toolchain</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-[-0.02em] text-white leading-[0.98]">
              Plugs into the tools you already use daily.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-400 font-light">
              Connect Google Drive, Calendar, GitHub, Figma, or your VS Code editor. Your active work status, shared assets, and milestone invoices stay synchronized effortlessly.
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Connect</dt>
                <dd className="mt-1 text-xs text-white font-medium">1-command token setup</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Real-time</dt>
                <dd className="mt-1 text-xs text-white font-medium">Sub-second WebSocket</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Security</dt>
                <dd className="mt-1 text-xs text-white font-medium">SHA-256 hashed keys</dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Connected SVG Pipeline Diagram */}
          <div className="pipeline-board lg:col-span-7 rounded-2xl border border-white/10 bg-[#07080c] p-6 sm:p-8 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">

              {/* Node 1: Workstation */}
              <div ref={node1Ref} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center w-full sm:w-36 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white">VS Code & CLI</div>
                <div className="text-[10px] text-slate-400">Heartbeat pulses</div>
              </div>

              {/* Connecting Line / Arrow */}
              <div ref={arrow1Ref} className="text-slate-500 font-mono text-xs hidden sm:block">
                ──►
              </div>

              {/* Node 2: Core Hub */}
              <div ref={node2Ref} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-center w-full sm:w-44 shadow-lg ring-1 ring-indigo-500/20">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  F
                </div>
                <div className="text-xs font-bold text-white">Frevio Engine</div>
                <div className="text-[10px] text-indigo-300">Time consolidation & presence</div>
              </div>

              {/* Connecting Line / Arrow */}
              <div ref={arrow2Ref} className="text-slate-500 font-mono text-xs hidden sm:block">
                ──►
              </div>

              {/* Node 3: Outputs */}
              <div ref={node3Ref} className="flex flex-col gap-2 w-full sm:w-44">
                <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stripe Connect</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Client Status Hub</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resend Alerts</span>
                </div>
              </div>

            </div>

            {/* Bottom Status Ticker */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
              <span>Encrypted end-to-end</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
