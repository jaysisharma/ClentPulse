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
    a: "No. You send them a link and they open it. There's no account to create and no password to forget. If a project needs to stay private, add a passcode to it.",
  },
  {
    q: 'Is Frevio really free?',
    a: "Yes, for 2 active projects, with no time limit. That includes the client page, updates, approvals and invoicing. You'd upgrade when you have more clients than that, or want your own branding.",
  },
  {
    q: 'I run a small team. Does it work for us?',
    a: 'Yes. Agency ($49/mo) covers 5 people: a shared workspace, assigning people to projects, internal notes, and a review step before an update goes to the client. Agency Scale ($199/mo) covers 25 people and adds your own domain (status.youragency.com), full white-label and an overview of projects at risk.',
  },
  {
    q: 'Can I use my own branding?',
    a: 'On Pro, client pages and emails use your logo and accent color, so your clients see your studio and not ours.',
  },
  {
    q: 'How do clients get notified of updates?',
    a: 'On Pro, posting an update emails your client automatically. On Free, you get the email text with their link ready to paste into your own email. Either way, one click takes them to their page.',
  },
  {
    q: 'How do payments work? Is my country supported?',
    a: "Your client pays by card through Stripe, and the money goes to your own Stripe account. Frevio takes 0%; Stripe's usual processing fee still applies. Stripe Connect works in 46+ countries, including the US, UK, EU, India, Canada and Australia. If yours isn't covered (Nepal, for example), you can still send invoices with your Wise, PayPal or bank details and mark them paid yourself.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes. There's no contract. Cancel from settings and you keep your plan until the end of the period you've paid for.",
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
