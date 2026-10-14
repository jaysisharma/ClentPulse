'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export function FrevioWorkflow() {
  const steps = [
    {
      step: 'Step 1',
      title: 'Create a project',
      detail:
        'Set up a new workspace in under 60 seconds with your client details, project description, and target completion date.',
    },
    {
      step: 'Step 2',
      title: 'Define scope & milestones',
      detail:
        'Break the engagement into tangible phases with deliverables so both you and the client have shared expectations from day one.',
    },
    {
      step: 'Step 3',
      title: 'Share with your client',
      detail:
        'Send your client their private link protected by a 6-digit passcode. They access the workspace instantly without having to create an account.',
    },
    {
      step: 'Step 4',
      title: 'Post updates & gather feedback',
      detail:
        'Share weekly progress bullets and preview links. Clients can comment or ask questions right inside their portal.',
    },
    {
      step: 'Step 5',
      title: 'Deliver work & handle invoicing',
      detail:
        'Request explicit sign-off on completed milestones and send Stripe-powered invoices for immediate online payment.',
    },
  ]

  return (
    <section id="workflow" className="py-20 md:py-28 px-4 sm:px-6 bg-[#08090a] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16 space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-[-0.03em] leading-[1.12]">
            From project start to final delivery.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            A simple, predictable process that keeps you organized and leaves your clients impressed.
          </p>
        </div>

        {/* Clean Typographic Progression Timeline */}
        <div className="relative border-l border-white/[0.1] ml-3 sm:ml-4 pl-6 sm:pl-10 space-y-12">
          {steps.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Subtle Timeline Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 size-3 rounded-full bg-[#08090a] border-2 border-indigo-400 group-hover:border-white transition-colors" />

              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-medium">
                  {item.step}
                </span>
                <h3 className="text-xl sm:text-2xl font-normal text-white">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-2xl pt-1">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Working Demo Prompt */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-400 font-light">
            Want to see how the client portal looks and feels in action?
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-indigo-300 transition-colors"
          >
            Explore the live interactive demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
