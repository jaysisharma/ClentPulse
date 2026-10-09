'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is Frevio?',
      a: 'Frevio is a dedicated client workspace platform designed for independent freelancers and small studios. It replaces messy email threads, scattered chat messages, and disparate tools with one clean portal where clients track project progress, review and sign off on deliverables, and settle invoices via Stripe.',
    },
    {
      q: 'Do my clients need to create an account or download an app?',
      a: 'No. Clients access their project portal directly through a secure, tokenized web link (with optional passcode protection). There are zero client passwords to remember, no required app downloads, and no sign-up friction.',
    },
    {
      q: 'Who is Frevio designed for?',
      a: 'Frevio is crafted for independent client-service professionals — including UI/UX designers, web developers, software engineers, digital marketers, consultants, video editors, and small agencies — who want to present a polished, organized delivery experience.',
    },
    {
      q: 'Can clients access their project through a single shared link?',
      a: 'Yes. Each project workspace has its own unique, private URL (e.g., frevio.cloud/p/your-project-slug). You share this link during project kickoff, and it remains the single source of truth for the duration of the engagement.',
    },
    {
      q: 'Can I manage multiple clients and projects simultaneously?',
      a: 'Absolutely. In your freelancer workspace, each client project has its own isolated milestones, deliverable feed, kickoff checklists, and invoices. Free accounts include up to 2 active projects, while Pro and Agency accounts support unlimited active projects.',
    },
    {
      q: 'Can I use Frevio as a designer, developer, or marketer?',
      a: 'Yes. Frevio is content-agnostic. Designers use it for Figma prototypes and design asset sign-offs; developers use it for staging links and milestone deployments; marketers use it for campaign decks and reporting links. All disciplines benefit from the same underlying structure: clear milestones, 1-click approvals, and secure payments.',
    },
    {
      q: 'Does Frevio handle invoices and payments?',
      a: 'Yes. Frevio connects directly with your Stripe account. You can generate project deposit invoices, milestone invoices, and 1-click Scope Creep Shield change orders. Clients pay via Stripe using credit cards, Apple Pay, or Google Pay with zero extra platform cut.',
    },
    {
      q: 'What is included in the Free plan?',
      a: 'The Free plan includes up to 2 active projects, client portals, milestone tracking, deliverable approvals, kickoff checklists, proposals & contracts, and Stripe invoicing. You can use it as long as you like without entering a credit card.',
    },
    {
      q: 'How does Frevio protect privacy and client data?',
      a: 'Every project is isolated using PostgreSQL Row-Level Security (RLS) on Supabase. Only you and authorized visitors with your project token can view workspace content. All payment transactions and data transmissions are encrypted with bank-level 256-bit SSL.',
    },
    {
      q: 'Can I cancel or upgrade my subscription anytime?',
      a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time with one click inside your account billing settings. If you cancel, you retain full access through the end of your billing cycle.',
    },
  ]

  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-indigo-400 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Everything you need to know about setting up client workspaces and managing client projects with Frevio.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-medium text-[#F5F5F3]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A1A5AD] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#A1A5AD] leading-relaxed border-t border-[#2A2D33]/60 pt-4 animate-fade-in">
                    {faq.a}
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
