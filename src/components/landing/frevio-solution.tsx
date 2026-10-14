'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function FrevioSolution() {
  const capabilities = [
    {
      num: '01',
      title: 'Projects and milestones',
      tagline: 'Keep work organized and visible.',
      description:
        'Break complex deliverables into clear stages with timelines and progress percentages. Clients always know where the project stands without asking.',
    },
    {
      num: '02',
      title: 'Updates and communication',
      tagline: 'Share progress without repeating yourself.',
      description:
        'Post structured weekly summaries directly to the client portal. Frevio automatically sends a formatted email digest so you never rewrite the same update in multiple chats.',
    },
    {
      num: '03',
      title: 'Files and deliverables',
      tagline: 'Keep project assets accessible.',
      description:
        'Link Figma specs, GitHub repositories, Google Drive assets, and staging builds in one organized hub. No more lost links or missing file versions.',
    },
    {
      num: '04',
      title: 'Feedback and approvals',
      tagline: 'Make review and next steps clear.',
      description:
        'Put deliverables up for explicit client sign-off. Clients approve with one click or note specific adjustments, creating a clean audit trail that prevents scope creep.',
    },
    {
      num: '05',
      title: 'Invoices and payments',
      tagline: 'Connect project work with billing.',
      description:
        'Generate invoices tied directly to completed project milestones. Clients pay online via Stripe with Apple Pay or credit card, and status syncs automatically.',
    },
  ]

  return (
    <section id="solution" className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a0b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            Core capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            Everything your client needs. One clear place.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Replace scattered email threads, shared spreadsheets, and lost file links with five focused workflows built into one calm workspace.
          </p>
        </div>

        {/* Editorial Structured Capability Rows (Not identical boxed cards) */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {capabilities.map((item) => (
            <div
              key={item.num}
              className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start group hover:bg-white/[0.01] transition-colors"
            >
              {/* Number & Title */}
              <div className="lg:col-span-5 flex items-baseline gap-4">
                <span className="font-mono text-xs text-indigo-400 font-medium">
                  {item.num}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-normal text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-300 font-mono mt-1">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="lg:col-span-7 pl-8 lg:pl-0">
                <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
