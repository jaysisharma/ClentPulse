'use client'

import { useEffect, useRef } from 'react'
import { Zap, Radio, Check, MessageSquare, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function OveradsBentoGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const percentRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. Bento cards stagger entrance
      gsap.fromTo(
        '.bento-tile',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bento-tile-grid',
            start: 'top 85%',
            once: true,
          },
        }
      )

      // 3. Counter 0% -> 94%
      if (percentRef.current) {
        const counter = { val: 0 }
        gsap.to(counter, {
          val: 94,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: percentRef.current,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (percentRef.current) {
              percentRef.current.textContent = `${Math.round(counter.val)}%`
            }
          },
        })
      }

      // 4. Counter 0.0 hrs -> 18.2 hrs
      if (hoursRef.current) {
        const counter = { val: 0 }
        gsap.to(counter, {
          val: 18.2,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: hoursRef.current,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            if (hoursRef.current) {
              hoursRef.current.textContent = `${counter.val.toFixed(1)} hrs`
            }
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="bento" className="w-full py-20 md:py-28 bg-[#08090a] text-white">
      <div className="mx-auto w-full max-w-6xl px-6">

        {/* Section Header */}
        <div ref={headerRef} className="mb-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>Workflow Signals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-white leading-tight">
            When clients need updates, does it turn into chaos?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-400">
            Frevio answers the client before they have to ask. Live coding pulses, weekly bullet digests, and zero-effort sign-offs replace endless WhatsApp messages.
          </p>
        </div>

        {/* Bento Grid (overads style) */}
        <div className="bento-tile-grid grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

          {/* Bento 1: 94% Stat (Col 4) */}
          <div className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f15] p-7 sm:p-8 md:col-span-4 min-h-[300px] shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Response Speed</span>
              <div ref={percentRef} className="text-4xl sm:text-5xl font-light tracking-tight text-white mt-4 font-mono">94%</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-200">Faster client approvals</div>
              <p className="text-xs leading-relaxed text-slate-400">
                Deliverables reviewed and approved in hours instead of days when clients have a single clean link instead of buried email attachments.
              </p>
            </div>
          </div>

          {/* Bento 2: Deliverable In Review (Col 8) */}
          <div className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f15] p-7 sm:p-8 md:col-span-8 min-h-[300px] shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Client Interaction</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                Approved in 14 mins
              </span>
            </div>

            <div className="my-4 space-y-1.5">
              <div className="text-lg sm:text-xl font-medium text-white tracking-tight">
                &ldquo;Payment Webhooks & Custom Domain Deployment&rdquo;
              </div>
              <div className="text-xs text-slate-400">
                Delivered by you · Reviewed by Sarah (Acme) with message: <span className="text-emerald-300 font-medium">&ldquo;Approved! Ready for launch.&rdquo;</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
              <span className="text-[11px] text-slate-500">Automated steps:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 border border-white/5">
                <Check className="w-3 h-3 text-emerald-400" /> Resend notification sent
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 border border-white/5">
                <Check className="w-3 h-3 text-emerald-400" /> Milestone 3 marked done
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 border border-white/5">
                <Check className="w-3 h-3 text-emerald-400" /> Final Stripe invoice generated
              </span>
            </div>
          </div>

          {/* Bento 3: Client Quote (Col 4) */}
          <div className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f15] p-7 sm:p-8 md:col-span-4 min-h-[260px] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Client Feedback</span>
            <blockquote className="my-4 text-sm sm:text-base leading-relaxed text-slate-300 font-light">
              &ldquo;Seeing the live green badge that my engineer was actively working gave me total peace of mind. Paid the invoice immediately.&rdquo;
            </blockquote>
            <div className="pt-3 border-t border-white/5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
                MD
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Marcus Davies</div>
                <div className="text-[10px] text-slate-400">Client @ Zenith Labs</div>
              </div>
            </div>
          </div>

          {/* Bento 4: Hours Metric (Col 5) */}
          <div className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f15] p-7 sm:p-8 md:col-span-5 min-h-[260px] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Time Consolidation</span>
            <div className="my-4 space-y-1">
              <div ref={hoursRef} className="text-3xl sm:text-4xl font-light text-white font-mono">18.2 hrs</div>
              <div className="text-xs text-emerald-400 font-medium">+100% billable accuracy</div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Heartbeats auto-merge consecutive coding sprints into rounded, itemized intervals. You never lose billable hours when focused in the zone.
            </p>
          </div>

          {/* Bento 5: 3-Step Flow (Col 3) */}
          <div className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f15] p-7 sm:p-8 md:col-span-3 min-h-[260px] shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">The Whole Loop</span>
            <ol className="my-4 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">1</span>
                <span>Code in VS Code</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">2</span>
                <span>Client checks status</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">3</span>
                <span>Approve deliverable</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Auto-paid via Stripe</span>
              </li>
            </ol>
            <div className="text-[10px] text-slate-500">Zero manual spreadsheets</div>
          </div>

        </div>

      </div>
    </section>
  )
}
