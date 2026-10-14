'use client'

import { useEffect, useRef } from 'react'
import {
  Code, Palette, Video, LineChart, Briefcase,
  CheckCircle2, ArrowUpRight
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FigmaIcon, GitHubIcon, VSCodeIcon, GoogleDriveIcon, StripeIcon
} from '@/components/ui/brand-icons'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function FrevioAudience() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
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

      if (cardsGridRef.current) {
        gsap.fromTo(
          cardsGridRef.current.children,
          { y: 40, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsGridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const audiences = [
    {
      role: 'Web & App Developers',
      tools: ['GitHub', 'VS Code', 'Stripe'],
      icons: [<GitHubIcon key="gh" className="w-4 h-4" />, <VSCodeIcon key="vs" className="w-4 h-4" />, <StripeIcon key="st" className="w-4 h-4" />],
      deliverable: 'Staging URLs, GitHub releases, & final milestone code handoff',
      badge: 'Code Handoff',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      role: 'UI/UX & Brand Designers',
      tools: ['Figma', 'Google Drive', 'Stripe'],
      icons: [<FigmaIcon key="fig" className="w-4 h-4" />, <GoogleDriveIcon key="gd" className="w-4 h-4" />, <StripeIcon key="st" className="w-4 h-4" />],
      deliverable: 'Figma prototypes, design token specs, & approved visual assets',
      badge: 'Design Sign-Off',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      role: 'Motion & Video Creators',
      tools: ['Google Drive', 'Figma', 'Stripe'],
      icons: [<GoogleDriveIcon key="gd" className="w-4 h-4" />, <FigmaIcon key="fig" className="w-4 h-4" />, <StripeIcon key="st" className="w-4 h-4" />],
      deliverable: 'Rough cuts, storyboard approvals, & final 4K video exports',
      badge: 'Video Reviews',
      tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      role: 'Boutique Studios & Agencies',
      tools: ['GitHub', 'Figma', 'Google Drive', 'Stripe'],
      icons: [<FigmaIcon key="fig" className="w-4 h-4" />, <GitHubIcon key="gh" className="w-4 h-4" />, <StripeIcon key="st" className="w-4 h-4" />],
      deliverable: 'Multi-client accounts, custom studio branding, & team oversight',
      badge: 'Studio Scale',
      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 sm:px-6 bg-[#0a0b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Audience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Built for people who deliver client work.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            Whether you work solo or lead a creative studio, Frevio fits seamlessly with the tools you already use.
          </p>
        </div>

        {/* ── Visual Cards Grid ── */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {audiences.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.08] bg-[#0d0e14] p-6 sm:p-7 space-y-5 hover:border-white/20 transition-all shadow-xl group will-change-transform"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border ${item.tagColor}`}>
                  {item.badge}
                </span>
                <div className="flex items-center gap-2">
                  {item.icons.map((icon, i) => (
                    <div key={i} className="size-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-normal text-white">
                  {item.role}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 leading-relaxed">
                  {item.deliverable}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Passcode Access
                </span>
                <span className="text-slate-500">Stripe Billing Ready</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
