'use client'

import { useEffect, useRef } from 'react'
import { ShieldCheck, Check, Sparkles, Layers, CreditCard, Lock, Clock } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { StripeIcon, FigmaIcon, GitHubIcon, VSCodeIcon, GoogleDriveIcon } from '@/components/ui/brand-icons'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function FrevioTrust() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const truthsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (toolsRef.current) {
        gsap.fromTo(
          toolsRef.current.children,
          { y: 20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: toolsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (truthsRef.current) {
        gsap.fromTo(
          truthsRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: truthsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="border-y border-white/[0.06] bg-[#0c0d12] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Visual Pill & Punchy Hook */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            Works with your existing workflow
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-white">
            Connects with the tools your clients already recognize
          </h2>
        </div>

        {/* Real Tool Integrations Logos Row */}
        <div ref={toolsRef} className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-2 text-slate-400">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] will-change-transform">
            <StripeIcon className="w-5 h-5" />
            <span className="text-xs font-medium text-slate-200">Stripe Invoicing</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] will-change-transform">
            <FigmaIcon className="w-4 h-4" />
            <span className="text-xs font-medium text-slate-200">Figma Prototypes</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] will-change-transform">
            <GitHubIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-slate-200">GitHub Code &amp; PRs</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] will-change-transform">
            <GoogleDriveIcon className="w-4 h-4" />
            <span className="text-xs font-medium text-slate-200">Google Drive Assets</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] will-change-transform">
            <VSCodeIcon className="w-4 h-4" />
            <span className="text-xs font-medium text-slate-200">VS Code Staging</span>
          </div>
        </div>

        {/* 3 Visual Metric / Truth Cards */}
        <div ref={truthsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto pt-4 border-t border-white/[0.06]">
          <div className="rounded-xl border border-white/[0.06] bg-[#090a0f] p-4 flex items-start gap-3 will-change-transform">
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Zero Account Setup</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                6-digit passcode lets clients review work instantly from any device.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#090a0f] p-4 flex items-start gap-3 will-change-transform">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Immutable Approvals</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Timestamped client sign-offs protect against scope creep.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#090a0f] p-4 flex items-start gap-3 will-change-transform">
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Milestone Invoicing</div>
              <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Instant checkout with Apple Pay &amp; credit card via Stripe.
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
