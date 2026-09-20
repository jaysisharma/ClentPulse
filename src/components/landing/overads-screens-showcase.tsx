'use client'

import { useState, useEffect, useRef } from 'react'
import { Radio, Globe, CreditCard, CheckCircle2, Check, ExternalLink } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const TABS = [
  { id: 'presence', label: 'Live Presence', icon: Radio },
  { id: 'status', label: 'Client Status Page', icon: Globe },
  { id: 'invoice', label: 'Stripe Invoicing', icon: CreditCard },
  { id: 'approvals', label: 'Deliverable Approvals', icon: CheckCircle2 },
] as const

type TabId = typeof TABS[number]['id']

export function OveradsScreensShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>('presence')

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const tabBarRef = useRef<HTMLDivElement>(null)
  const screenCardRef = useRef<HTMLDivElement>(null)
  const tabContentRef = useRef<HTMLDivElement>(null)

  // Scroll entrance
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

      // 2. Tab switcher bar entrance
      if (tabBarRef.current) {
        gsap.fromTo(
          tabBarRef.current,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: tabBarRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 3. Screen mockup card scale-in
      if (screenCardRef.current) {
        gsap.fromTo(
          screenCardRef.current,
          { y: 35, scale: 0.98, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: screenCardRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Animate tab content whenever activeTab changes
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    }
  }, [activeTab])

  return (
    <section ref={sectionRef} id="screens" className="relative w-full py-20 md:py-28 bg-white text-slate-900 border-t border-slate-200/80">
      <div className="mx-auto w-full max-w-6xl px-6">

        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            <span>Inside Frevio</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-[-0.02em] text-slate-950 leading-[0.98]">
            Three screens. That is the whole job.
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-light max-w-2xl mx-auto">
            Where your time went, what your clients see, and how you get paid. No bloat, no spreadsheets.
          </p>
        </div>

        {/* Segmented Pill Switcher (Light Mode) */}
        <div ref={tabBarRef} className="flex justify-center mb-12">
          <div className="relative flex flex-wrap items-center justify-center rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-xs backdrop-blur-xl">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-md scale-[1.02] font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Screen Container (Clean Light Panel) */}
        <div ref={screenCardRef} className="relative rounded-3xl border border-slate-200 bg-[#f8f9fb] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Subtle glow accent based on tab */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] opacity-10 -z-10"
            style={{
              backgroundColor:
                activeTab === 'presence' ? '#22c55e' :
                activeTab === 'status' ? '#6366f1' :
                activeTab === 'invoice' ? '#f59e0b' : '#a855f7'
            }}
          />

          <div ref={tabContentRef}>

          {/* TAB 1: LIVE PRESENCE */}
          {activeTab === 'presence' && (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs text-emerald-700 font-medium">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-600" /> Live Coding Activity
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-slate-950 tracking-tight">
                  Editor-connected heartbeat. Zero ghost hours.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Frevio detects keystrokes in VS Code or Cursor and sends encrypted heartbeats. If you step away for 5 minutes, it automatically pauses so you never log accidental phantom time.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time presence badge on client&apos;s public status page</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Focus area detection from active files and workspace</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Session consolidation into clean, billable invoice rows</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d1117] p-5 shadow-2xl font-mono text-xs text-slate-200">
                {/* Simulated IDE Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] text-slate-400 ml-2">Frevio: Workspace Monitor</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-sans font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                </div>

                {/* Simulated Session Details */}
                <div className="py-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 font-sans">
                    <div>
                      <div className="text-xs font-semibold text-white">Project: QR software</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Focus: Payment Webhook Integration</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400 font-mono">03h 45m</div>
                      <div className="text-[10px] text-slate-400">Active session</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-[11px] text-slate-400">
                    <div className="text-slate-300 font-medium">Recent Heartbeat Events:</div>
                    <div className="flex justify-between"><span>14:48:12 · Keystroke active</span><span className="text-emerald-400">+120s logged</span></div>
                    <div className="flex justify-between"><span>14:46:12 · Keystroke active</span><span className="text-emerald-400">+120s logged</span></div>
                    <div className="flex justify-between text-slate-500"><span>14:41:00 · Smart Idle Pause</span><span>Heartbeats suspended</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-sans text-slate-400">
                  <span>Status Bar Indicator:</span>
                  <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono">⏱️ Frevio: QR software</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT STATUS PAGE */}
          {activeTab === 'status' && (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs text-indigo-700 font-medium">
                  <Globe className="w-3 h-3 text-indigo-600" /> Client Experience
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-slate-950 tracking-tight">
                  Passcode-locked live client link. Zero logins.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Clients visit a sleek, bespoke URL like <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono text-xs">frevio.cloud/p/acme-app</code>. They enter a passcode to view milestones, read weekly bullet updates, and reply directly.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Interactive milestone checklist with completion percentage</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Real-time presence badge shows when you&apos;re coding</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Immediate feedback widget (👍, ⚠️, or questions)</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white text-slate-900 p-6 shadow-xl">
                {/* Status Page Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      AC
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Acme E-Commerce Redesign</div>
                      <div className="text-xs text-slate-500">Client: Sarah Jenkins</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Currently working
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress (3 of 4 milestones)</span>
                    <span className="font-bold text-slate-800">75%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '75%' }} />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-800">Week of Sep 8 Updates</div>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Finished Stripe checkout integration & tax rates</li>
                      <li>Deployed staging build for review on Vercel</li>
                      <li>Optimized mobile cart layout</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Protected by 6-digit passcode</span>
                  <span className="text-indigo-600 font-semibold font-mono">frevio.cloud/p/acme-app</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STRIPE INVOICING */}
          {activeTab === 'invoice' && (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700 font-medium">
                  <CreditCard className="w-3 h-3 text-amber-600" /> Seamless Payments
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-slate-950 tracking-tight">
                  Turn logged coding time into paid invoices.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Stop compiling hours by hand. Frevio lets you convert tracked VS Code time into an itemized Stripe invoice with one click. Clients pay via card or Apple Pay, and status updates instantly.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Direct Stripe Checkout with Apple Pay and credit cards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Automated overdue reminder emails via Resend</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Real-time webhook marks invoices as paid automatically</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-slate-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Invoice</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 mt-0.5">#INV-2026-084</div>
                  </div>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Due in 7 days
                  </span>
                </div>

                <div className="py-5 space-y-3">
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-700">Backend API & Database Architecture (18.5 hrs)</span>
                    <span className="font-mono text-slate-950 font-medium">$2,775.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-700">Stripe Webhook & Checkout Flow (6.0 hrs)</span>
                    <span className="font-mono text-slate-950 font-medium">$900.00</span>
                  </div>

                  <div className="pt-2 flex justify-between items-baseline">
                    <span className="text-slate-500 text-sm">Total Due</span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-950 font-mono">$3,675.00</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">Powered by Stripe Connect</div>
                  <button className="bg-slate-950 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer">
                    Pay Now with Stripe →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERABLE APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs text-violet-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-violet-600" /> Scope Protection
                </div>
                <h3 className="text-2xl sm:text-3xl font-light text-slate-950 tracking-tight">
                  Clear milestone sign-offs. No endless revisions.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Post deliverables for formal approval with preview links. Clients can approve with one click or request specific changes. You get immediate email alerts the second they respond.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Explicit approval logs eliminate revision disputes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Instant freelancer email notification on client response</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>Attached digital agreements and contract signing</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-slate-900">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Awaiting Client Approval</span>
                  <span className="text-[11px] text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md font-mono font-medium">Deliverable #3</span>
                </div>

                <div className="space-y-2">
                  <div className="text-base font-semibold text-slate-950">Interactive Staging Environment v2.4</div>
                  <p className="text-xs text-slate-600">
                    Live prototype deployed with all checkout modifications and responsive tablet layouts.
                  </p>
                  <a href="#demo" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline pt-1">
                    staging.clientapp.dev <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                  <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer">
                    Approve Deliverable
                  </button>
                  <button className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer">
                    Request Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>

        </div>

      </div>
    </section>
  )
}
