'use client'

import { useEffect, useRef } from 'react'
import {
  WhatsAppIcon,
  WhatsAppSquircleIcon,
  GmailIcon,
  GoogleDriveIcon,
  FigmaIcon,
  NotionIcon,
  GoogleSheetsIcon,
} from '@/components/ui/brand-icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function ProblemSection() {
  const containerRef = useRef<HTMLElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const cardsStackRef = useRef<HTMLDivElement>(null)
  const annotationRef = useRef<HTMLDivElement>(null)
  const badgesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // 1. Left column text stagger
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: leftColRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 2. Badges pop-in
      if (badgesRef.current) {
        gsap.fromTo(
          badgesRef.current.children,
          { scale: 0.8, opacity: 0, y: 15 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: badgesRef.current,
              start: 'top 90%',
              once: true,
            },
          }
        )
      }

      // 3. Cascading notification cards entrance
      if (cardsStackRef.current) {
        const cards = cardsStackRef.current.querySelectorAll('.notification-card')
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsStackRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      // 4. "Sounds familiar?" annotation & arrow
      if (annotationRef.current) {
        gsap.fromTo(
          annotationRef.current,
          { opacity: 0, scale: 0.8, rotate: -15 },
          {
            opacity: 1,
            scale: 1,
            rotate: -6,
            duration: 0.7,
            delay: 0.4,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: cardsStackRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      id="problem"
      className="py-24 lg:py-32 px-5 sm:px-8 bg-[#FAFAFC] border-t border-slate-200/80 text-slate-900 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[350px] bg-rose-500/[0.04] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Problem Copy & Scattered App Badges */}
          <div ref={leftColRef} className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>The Problem</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
              Your work isn&apos;t the problem. <br className="hidden sm:inline" />
              <span className="font-semibold text-slate-900">Client communication is.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed max-w-xl">
              Project updates, files, feedback, and invoices are scattered everywhere — WhatsApp, email, Drive, Figma, spreadsheets. You spend half your day answering &ldquo;any updates?&rdquo; instead of actually doing the work.
            </p>

            {/* Scattered Tools List with Real Brand Logos */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400 font-medium mb-3">
                Scattered across 6+ different channels
              </div>
              <div ref={badgesRef} className="flex flex-wrap items-center gap-2.5">
                {/* WhatsApp */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                  <span>WhatsApp</span>
                </div>

                {/* Gmail */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GmailIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Gmail</span>
                </div>

                {/* Google Drive */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GoogleDriveIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Google Drive</span>
                </div>

                {/* Figma */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <FigmaIcon className="w-3.5 h-4 flex-shrink-0" />
                  <span>Figma</span>
                </div>

                {/* Notion */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <NotionIcon className="w-4 h-4 flex-shrink-0 text-slate-900" />
                  <span>Notion</span>
                </div>

                {/* Spreadsheets */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-medium text-slate-800 hover:border-slate-300 hover:shadow-md transition-all">
                  <GoogleSheetsIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Spreadsheets</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Cascading Notification Cards & "Sounds familiar?" Annotation */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative py-6 lg:pl-4">
            
            {/* Abstract Smoky Dark Background Aura matching user design */}
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end pointer-events-none lg:translate-x-6">
              <div className="w-[310px] sm:w-[370px] lg:w-[410px] h-[430px] sm:h-[470px] bg-gradient-to-br from-black/90 via-slate-950/80 to-slate-900/65 rounded-[52px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center pt-3.5">
                {/* Top subtle device bezel pill */}
                <div className="w-16 h-1 bg-white/25 rounded-full mb-2" />
                {/* Soft ambient inner glows */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Relative Container for the Cards and Annotation */}
            <div className="relative w-full max-w-[370px] sm:max-w-[450px] px-2 py-8 z-10 lg:translate-x-6">

              {/* Handwritten "Sounds familiar?" Annotation & Curved Arrow */}
              <div
                ref={annotationRef}
                className="absolute -left-3 sm:-left-6 lg:-left-10 top-1/2 -translate-y-12 flex flex-col items-center z-30 select-none pointer-events-none"
              >
                <span
                  style={{ fontFamily: 'var(--font-caveat), cursive' }}
                  className="text-2xl sm:text-3xl text-[#1a4036] font-bold tracking-wide -rotate-6 whitespace-nowrap drop-shadow-sm"
                >
                  Sounds familiar?
                </span>
                
                {/* Hand-drawn curved arrow looping downwards & pointing right */}
                <svg
                  className="w-10 h-14 sm:w-12 sm:h-16 text-[#1a4036] mt-0.5 -rotate-3 overflow-visible"
                  viewBox="0 0 46 62"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 4 C 10 20, 11 38, 36 50"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M26 49 L 36 50 L 33 40"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Cascading Notifications Stack */}
              <div ref={cardsStackRef} className="space-y-3.5 sm:space-y-4">
                
                {/* Card 1: WhatsApp */}
                <div className="notification-card ml-2 sm:ml-6 lg:ml-10 w-[245px] sm:w-[285px] p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.06)] flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <WhatsAppSquircleIcon className="w-8 h-8 rounded-xl shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900 tracking-tight">Client</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">10:24 PM</span>
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight leading-snug mt-0.5 truncate">
                      Hey! Any updates? 👀
                    </p>
                  </div>
                </div>

                {/* Card 2: Gmail */}
                <div className="notification-card ml-8 sm:ml-16 lg:ml-22 w-[245px] sm:w-[285px] p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.06)] flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                    <GmailIcon className="w-5 h-5 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900 tracking-tight">Client</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">Yesterday</span>
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight leading-snug mt-0.5 truncate">
                      Can you share the latest design?
                    </p>
                  </div>
                </div>

                {/* Card 3: Google Drive */}
                <div className="notification-card ml-14 sm:ml-26 lg:ml-34 w-[245px] sm:w-[285px] p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.06)] flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                    <GoogleDriveIcon className="w-5 h-5 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900 tracking-tight">Client</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">2 days ago</span>
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight leading-snug mt-0.5 truncate">
                      Where&apos;s the final file?
                    </p>
                  </div>
                </div>

                {/* Card 4: Figma */}
                <div className="notification-card ml-20 sm:ml-34 lg:ml-44 w-[245px] sm:w-[285px] p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100/90 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.06)] flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                    <FigmaIcon className="w-4 h-5 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900 tracking-tight">Client</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">3 days ago</span>
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-slate-800 tracking-tight leading-snug mt-0.5 truncate">
                      Can I see the revisions?
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
