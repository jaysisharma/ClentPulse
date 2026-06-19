'use client'

import { useEffect, useRef } from 'react'
import {
  Clock, Folder, FileText, Users, TrendingUp, Search, Bell,
  Plus, AlertCircle, Timer, CheckCircle2, Send,
  DollarSign, ChevronRight
} from 'lucide-react'

export function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0

    // Write scroll-driven styles straight to the DOM (no React re-render per
    // frame) and with NO CSS transition — the scroll position itself provides
    // the continuity, so the mockup tracks the scroll 1:1 instead of lerping
    // toward a moving target (the source of the lag).
    const apply = (p: number) => {
      const container = containerRef.current
      if (!container) return
      container.style.width = `${80 + p * 20}vw`        // 80vw → 100vw
      container.style.height = `${65 + p * 35}vh`       // 65vh → 100vh
      container.style.paddingTop = `${48 - p * 48}px`   // 48px → 0
      container.style.transform = `translateX(-50%) scale(${0.95 + p * 0.05})`
      container.style.opacity = `${0.85 + p * 0.15}`
      if (cardRef.current) cardRef.current.style.borderRadius = `${24 - p * 24}px`
      if (glowRef.current) glowRef.current.style.opacity = `${1 - p}`
    }

    const update = () => {
      raf = 0
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const vh = window.innerHeight
      const absoluteTop = rect.top + window.scrollY
      // Starts when the top enters the viewport bottom, completes near center.
      const startScroll = absoluteTop - vh
      const endScroll = absoluteTop - vh * 0.45
      const p = Math.max(0, Math.min(1, (window.scrollY - startScroll) / (endScroll - startScroll)))
      apply(p)
    }

    // Coalesce scroll/resize bursts into one update per animation frame.
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative origin-top z-30"
      style={{
        width: '80vw',
        height: '65vh',
        paddingTop: '48px',
        left: '50%',
        transform: 'translateX(-50%) scale(0.95)',
        opacity: 0.85,
        willChange: 'width, height, transform',
      }}
    >
      {/* Ambient Glow behind Mockup (fade out when full screen) */}
      <div
        ref={glowRef}
        className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl -z-10 rounded-3xl pointer-events-none"
        style={{ opacity: 1 }}
      />

      <div
        ref={cardRef}
        className="bg-slate-900 text-white overflow-hidden border border-slate-800 shadow-2xl p-1 bg-gradient-to-b from-slate-800 to-slate-950 flex flex-col h-full w-full"
        style={{ borderRadius: '24px' }}
      >
        {/* Header bar */}
        <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="font-mono text-[9px] bg-slate-950 px-3 py-1 rounded text-slate-500 select-none">
            frevio.cloud/dashboard
          </div>
        </div>

        {/* App Layout Simulation */}
        <div className="bg-slate-950 flex flex-1 text-left overflow-hidden">

          {/* Sidebar (Desktop only) */}
          <div className="hidden md:flex w-52 bg-slate-900 border-r border-slate-800/60 p-4 flex-col justify-between select-none flex-shrink-0">
            <div className="space-y-6">
              {/* Logo and Workspace */}
              <div className="flex items-center gap-2 px-2">
                <img src="/logo.svg" alt="Frevio" className="w-5 h-5" />
                <span className="font-bold text-xs text-slate-200">Creative Studio</span>
              </div>

              {/* Sidebar Menu */}
              <div className="space-y-1.5 text-[11px] font-bold text-slate-400">
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-slate-800 text-white rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-800/40 hover:text-white rounded-lg transition-colors">
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-800/40 hover:text-white rounded-lg transition-colors">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Time Tracker</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-800/40 hover:text-white rounded-lg transition-colors">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invoices</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-800/40 hover:text-white rounded-lg transition-colors">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Client Portals</span>
                </div>
              </div>
            </div>

            {/* Pro Badge & Profile */}
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-indigo-950 to-indigo-900/40 border border-indigo-800/40 rounded-xl p-3 text-[10px] space-y-1">
                <div className="font-extrabold text-indigo-200">PRO MEMBERSHIP</div>
                <p className="text-indigo-300/80 leading-relaxed font-semibold">Unlimited clients & automated email reminders active.</p>
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">JS</div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">Jay Sharma</div>
                  <div className="text-[8px] text-slate-500 truncate">Freelancer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace Area */}
          <div className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-hidden">

            {/* Top Header */}
            <div className="flex items-start justify-between flex-shrink-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                  Welcome back, Jay
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  3 active projects · 2 items need attention
                </p>
              </div>
              <div className="flex items-center gap-2 select-none">
                <div className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Log time</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  <span>New project</span>
                </div>
              </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">
              {/* Outstanding */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Outstanding</div>
                <div className="text-xl md:text-2xl font-bold text-rose-500">$4,850</div>
                <div className="text-[10px] text-rose-400/80 font-medium">2 invoices overdue</div>
              </div>
              {/* This month */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">This month</div>
                <div className="text-xl md:text-2xl font-bold text-white">$3,200</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>↑</span> <span>$1,200 more than last month</span>
                </div>
              </div>
              {/* Active projects */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active projects</div>
                <div className="text-xl md:text-2xl font-bold text-white">3</div>
                <div className="text-[10px] text-slate-500 font-medium">of 4 total</div>
              </div>

              {/* Hours this week */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Hours this week</div>
                <div className="text-xl md:text-2xl font-bold text-white">12h 45m</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>↑</span> <span>4h 15m more than last week</span>
                </div>
              </div>
            </div>



            {/* Needs attention */}
            <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-850/60">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Needs attention</span>
                <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full">
                  2
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200">Acme Website Redesign</span>
                      <span className="text-[10px] text-slate-500 ml-2">Acme Corp</span>
                    </div>
                    <span className="text-[9px] text-amber-500 bg-amber-950 px-2 py-0.5 rounded border border-amber-950 flex-shrink-0">
                      7+ days no update
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-md cursor-pointer select-none">
                    <Send className="w-3 h-3" />
                    <span>Send update</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs cursor-pointer hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-200 truncate">Proposal Mockup Draft</div>
                      <div className="text-[10px] text-slate-500">Acme Website Redesign</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 flex-shrink-0">
                    <span className="text-[10px] text-amber-500 font-bold">Awaiting approval</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">

              {/* Projects List Column — 2 cols */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-1 select-none">
                  <h2 className="text-xs font-semibold text-slate-400">Projects</h2>
                  <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer">
                    View all <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3 hover:border-slate-700 transition-colors group cursor-pointer">
                    <div className="w-1 h-8 rounded-full bg-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                          Acme Website Redesign
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/40 uppercase">
                          active
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Acme Corp</div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-[10px] text-slate-300">Today</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">5 updates sent</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3 hover:border-slate-700 transition-colors group cursor-pointer">
                    <div className="w-1 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                          Delta Mobile App
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900/40 uppercase">
                          active
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Delta Corp</div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-[10px] text-slate-300">3 days ago</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">12 updates sent</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3 hover:border-slate-700 transition-colors group cursor-pointer">
                    <div className="w-1 h-8 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                          Eka Brand Design
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-900/40 uppercase">
                          completed
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Eka LLC</div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-[10px] text-slate-400">May 28, 2026</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">8 updates sent</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Sidebar column — 1 col */}
              <div className="space-y-4 w-full">
                {/* Active timer */}
                <div className="bg-slate-900 rounded-xl border border-slate-800/60 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1 select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400">Timer running</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer">Open</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">
                    UI Layout Implementation
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-amber-500" />
                    <span>Acme Website Redesign</span>
                  </div>
                </div>

                {/* Unpaid invoices */}
                <div className="bg-slate-900 rounded-xl border border-slate-800/60 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 select-none">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-300">Unpaid invoices</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer">View all</span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/60 transition-colors cursor-pointer group">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          INV-2026-001
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[140px]">Acme Corp</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-950">Overdue</span>
                        <span className="text-xs font-bold text-slate-300">$4,850</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-900/60 transition-colors cursor-pointer group">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          INV-2026-002
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate max-w-[140px]">Delta Corp</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-300">$1,200</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New invoice shortcut */}
                <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-slate-800/60 px-4 py-3 hover:border-slate-700 transition-all group cursor-pointer">
                  <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center group-hover:bg-indigo-950 transition-colors">
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">New invoice</div>
                    <div className="text-[10px] text-slate-500">Bill a client</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 ml-auto" />
                </div>
              </div>

            </div>

            {/* Upgrade banner */}
            <div className="bg-indigo-600 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 mt-4">
              <div>
                <div className="text-xs md:text-sm font-semibold text-white">Upgrade to Pro</div>
                <div className="text-[10px] text-indigo-200 mt-0.5">Unlimited projects, auto email delivery to clients, and white-label status pages.</div>
              </div>
              <div className="inline-flex items-center bg-white hover:bg-slate-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer transition-colors self-start sm:self-auto select-none">
                Upgrade
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
