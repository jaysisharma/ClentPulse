'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'Do my clients need to create an account?',
    a: 'No. Clients open their portal from a secure link in their email — no password to remember. Everything they need lives on one clean page.',
  },
  {
    q: 'Is Frevio really free?',
    a: 'Yes. The Free plan runs up to 3 active projects forever, with the client portal, updates, files, and invoicing included. Upgrade to Pro only when you outgrow it.',
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

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200">
      {FAQS.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q} className="py-6">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 text-left"
            >
              <span className="text-lg font-semibold text-slate-900">{f.q}</span>
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="max-w-2xl text-[15px] leading-relaxed text-slate-500">{f.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
