'use client'

import { useState } from 'react'
import { Plus, Minus, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    question: 'How do clients access their updates?',
    answer: 'Clients receive a secure login link or email invite directly in their inbox. They can click it to log into their dedicated dashboard portal, showing all active updates, budgets, approval milestones, and unpaid invoices without needing to remember another password.',
  },
  {
    question: 'Can I connect my own domain for client pages?',
    answer: 'Yes! ClientPulse Pro supports custom domains, allowing you to route client portals through your own subdomains (e.g. status.youragency.com) so the client portal looks like a native extension of your primary website.',
  },
  {
    question: 'Is client feedback approval logged and recorded?',
    answer: 'Absolutely. When a client responds by clicking "Approve" or "Request changes" on your updates, the feedback, associated message, and stamp are securely recorded and logged in your freelancer database. You will see active alert badges instantly.',
  },
  {
    question: 'Is Stripe secure for handling invoicing?',
    answer: 'Yes. ClientPulse integrates directly with Stripe Checkout. All invoice payments are handled securely through Stripe\'s compliant billing portals. ClientPulse never stores, processes, or captures your client\'s raw credit card information.',
  },
  {
    question: 'What is the limit on free accounts?',
    answer: 'Free accounts are permanently active and can run up to 3 projects, log unlimited updates, use copy-paste email templates, and share public client status pages. Upgrading to Pro unlocks unlimited projects, automated email delivery, custom branding, and more.',
  },
]

export function FAQAccordion() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  function toggle(idx: number) {
    setActiveIdx(activeIdx === idx ? null : idx)
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {FAQS.map((faq, i) => {
        const isOpen = activeIdx === i
        return (
          <div
            key={i}
            className={`bg-white border rounded-2xl transition-all duration-200 ${
              isOpen ? 'border-indigo-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className={`w-4.5 h-4.5 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {faq.question}
                </span>
              </div>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center border text-slate-400 transition-colors flex-shrink-0 ml-4 ${
                isOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200'
              }`}>
                {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
            </button>

            {/* Answer body with smooth collapse */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-48 border-t border-slate-100' : 'max-h-0'
              }`}
            >
              <div className="px-5 py-4 text-xs md:text-sm text-slate-500 leading-relaxed font-medium bg-slate-50/50 rounded-b-2xl">
                {faq.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
