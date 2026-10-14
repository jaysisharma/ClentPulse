'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'What is Frevio?',
    a: 'Frevio is a dedicated client workspace for freelancers, independent designers, developers, and small agencies. It replaces scattered communication across Slack, WhatsApp, email, and Google Drive with one clean, organized portal for project updates, deliverable approvals, and Stripe invoices.',
  },
  {
    q: 'Do clients need an account?',
    a: 'No. Clients do not need to register, remember a password, or download any software. They access their private project workspace directly through a secure link protected by a 6-digit passcode.',
  },
  {
    q: 'What can clients see?',
    a: 'Clients see a clean, read-only roadmap of the project, including milestones, completion percentages, weekly progress recaps, deliverable review files, and outstanding invoices. They cannot see your internal notes, timer logs, or other client projects.',
  },
  {
    q: 'How do updates and approvals work?',
    a: 'You post updates and deliverables from your dashboard. Frevio automatically formats them and delivers a clean email notification to your client. Inside their portal, clients can approve deliverables with a single click or leave specific adjustment notes.',
  },
  {
    q: 'What is included in the free plan?',
    a: 'The Free plan is 100% free forever for up to 2 active client projects. It includes the full client portal, milestone tracking, deliverable sign-offs, time and expense logging, and Stripe invoice processing. You only upgrade if you take on more projects or need custom branding.',
  },
  {
    q: 'Can I use my own branding?',
    a: 'Yes. On the Pro and Agency plans, you can upload your studio logo, set custom brand accent colors, and remove the "Powered by Frevio" badge so the portal looks like a natural extension of your brand.',
  },
  {
    q: 'How do billing and cancellation work?',
    a: 'There are no contracts or long-term commitments. You can pay monthly or annually (which saves 17%). You can upgrade, downgrade, or cancel at any time with a single click from your settings.',
  },
  {
    q: 'How is project information protected?',
    a: 'All data is encrypted in transit using TLS 1.3 and at rest with AES-256. Client portals are protected by time-limited secure passcodes, and payment processing is handled directly by Stripe without storing sensitive financial credentials.',
  },
]

export function FrevioFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-14 space-y-4 text-center">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            Frequently answered
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Frequently answered questions.
          </h2>
          <p className="text-base text-slate-300 font-light leading-relaxed max-w-xl mx-auto">
            Everything you need to know about how Frevio works for your studio and your clients.
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={idx} className="py-6 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 text-left cursor-pointer group"
                >
                  <span className={`text-base sm:text-lg font-normal transition-colors ${
                    isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {faq.q}
                  </span>
                  <span className={`flex size-7 items-center justify-center rounded-full border transition-all flex-shrink-0 ${
                    isOpen
                      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 group-hover:text-white group-hover:border-white/20'
                  }`}>
                    {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="pt-3 pr-10">
                    <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
