'use client'

import { useEffect, useRef } from 'react'
import {
  GitHubIcon,
  FigmaIcon,
  GoogleDriveIcon,
  StripeIcon,
  GoogleCalendarIcon,
  VSCodeIcon,
} from '@/components/ui/brand-icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function IntegrationsSection() {
  const containerRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. Grid cards stagger
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 35, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            duration: 0.7,
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const tools = [
    {
      name: 'GitHub',
      role: 'Commits & PRs',
      desc: 'Syncs commit activity and pull request milestones to client timelines automatically.',
      icon: GitHubIcon,
      accent: 'bg-white/10 text-white border-white/15',
    },
    {
      name: 'Figma',
      role: 'Design updates',
      desc: 'Embeds interactive prototypes and live frames directly into client deliverables.',
      icon: FigmaIcon,
      accent: 'bg-white/10 border-white/15',
    },
    {
      name: 'Google Drive',
      role: 'Shared files',
      desc: 'Attaches large assets, zip bundles, and documents to project milestones.',
      icon: GoogleDriveIcon,
      accent: 'bg-white/10 border-white/15',
    },
    {
      name: 'Stripe',
      role: 'Payments',
      desc: 'Processes deposits, milestone invoices, and retainer payouts instantly.',
      icon: StripeIcon,
      accent: 'bg-[#635BFF]/15 border-[#635BFF]/30',
    },
    {
      name: 'Google Calendar',
      role: 'Deadlines',
      desc: 'Keeps project due dates and sprint reviews synced with client schedules.',
      icon: GoogleCalendarIcon,
      accent: 'bg-white/10 border-white/15',
    },
    {
      name: 'VS Code',
      role: 'Work activity (optional)',
      desc: 'Shows live presence when you are actively coding without invasive surveillance.',
      icon: VSCodeIcon,
      accent: 'bg-sky-500/10 border-sky-500/20',
    },
  ]

  return (
    <section
      ref={containerRef}
      id="integrations"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#07080D] border-t border-white/[0.08] text-white relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Integrations</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white leading-[1.08]">
            Works with the tools <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-200">you already use</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            Bring everything together. Connect your workflow and let Frevio keep your client updated automatically.
          </p>
        </div>

        {/* Interconnected Tools Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.name}
                className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-white/20 hover:bg-[#12141e] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2.5 ${tool.accent} border group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition-colors">{tool.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">{tool.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Connected
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
