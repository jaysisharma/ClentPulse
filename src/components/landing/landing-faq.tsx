'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Minus } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const FAQS = [
  {
    q: 'Do my clients need to create an account?',
    a: 'No. Clients open their portal from a secure link in their email — no password to remember. Everything they need lives on one clean page.',
  },
  {
    q: 'Is Frevio really free?',
    a: 'Yes. The Free plan runs up to 2 active projects forever, with the client portal, updates, files, and invoicing included. Upgrade to Pro or Agency only when you outgrow it.',
  },
  {
    q: 'Do you offer plans for agencies and creative teams?',
    a: 'Yes. Our Agency ($79/mo, 5 seats) and Agency Scale ($199/mo, 25 seats) plans include multi-tenant team workspaces, project pods, PM update reviews, activity audit trails, custom CNAME domain routing (status.youragency.com), and Executive Radar.',
  },
  {
    q: 'Can I use my own branding?',
    a: 'On Pro, every portal and email carries your logo and accent color — so it feels like a native part of your studio, not a third-party tool.',
  },
  {
    q: 'How do clients get notified of updates?',
    a: 'Whenever you post an update, Frevio sends a branded HTML email automatically. One click takes the client straight to their portal.',
  },
  {
    q: 'How do payments work?',
    a: 'Invoices are paid online through Stripe Checkout. Frevio never touches card details, and your dashboard updates the moment a client pays.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Always. There are no contracts — cancel in a click and keep access until the end of your billing period.',
  },
]

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-row',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="mx-auto max-w-3xl divide-y divide-white/10">
      {FAQS.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} className="faq-row py-6 group transition-colors">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 text-left cursor-pointer"
            >
              <span
                className={`text-base sm:text-lg font-medium transition-colors ${
                  isOpen ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'
                }`}
              >
                {f.q}
              </span>
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                  isOpen
                    ? 'bg-white/15 border-white/25 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                }`}
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl text-[14px] sm:text-[15px] leading-relaxed text-slate-400">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
