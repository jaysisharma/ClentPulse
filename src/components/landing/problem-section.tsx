'use client'

import {
  MessageSquare, FileSearch, CheckSquare, Receipt,
  Clock, AlertCircle, ArrowRight
} from 'lucide-react'
import { HaikeiTopography } from '@/components/ui/haikei-backgrounds'

export function ProblemSection() {
  const problems = [
    {
      icon: MessageSquare,
      title: 'Repeating project updates',
      description:
        'Answering "any updates?" across WhatsApp, Slack, iMessage, and email at odd hours, restating progress you already delivered.',
      tag: 'Scattered messages',
      sample: '"Hey, just checking in — where are we on the checkout page design?"',
    },
    {
      icon: CheckSquare,
      title: 'Chasing feedback and approvals',
      description:
        'Feedback gets buried in long threads or verbal calls. Without a clear sign-off record, scope creeps and revisions never end.',
      tag: 'Unclear sign-offs',
      sample: '"Looks great in general! Just can we also change the entire hero section?"',
    },
    {
      icon: FileSearch,
      title: 'Searching through scattered files',
      description:
        'Figma files in one chat, contracts in another, staging links lost in email chains, and invoices saved in separate tabs.',
      tag: 'Fragmented links',
      sample: '"Can you resend the latest Figma link? The one from last Tuesday isn\'t loading."',
    },
    {
      icon: Receipt,
      title: 'Following up on invoices & tasks',
      description:
        'Awkward payment reminders, delayed milestone settlements, and waiting on client assets before you can actually begin.',
      tag: 'Payment friction',
      sample: '"Can you send that invoice again as a PDF? Accounts payable is asking for it."',
    },
  ]

  return (
    <section className="relative py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3] overflow-hidden">
      {/* Haikei Topography Lines Background */}
      <HaikeiTopography className="absolute inset-0 w-full h-full" opacity={0.05} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A1A5AD] mb-4">
            <span>The Client Problem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Your work is organised. <br />
            <span className="font-normal text-[#A1A5AD]">
              Why is managing your clients so messy?
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Project updates live in messages. Feedback gets buried. Invoices need follow-ups. Clients ask questions you&apos;ve already answered.
          </p>
        </div>

        {/* 4 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#1E2126] border border-[#2A2D33] text-[#A7B8FF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#A1A5AD] px-2.5 py-1 rounded bg-[#101113] border border-[#2A2D33]">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {prob.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                {/* Realistic quote snippet */}
                <div className="mt-6 pt-4 border-t border-[#2A2D33]/60 bg-[#101113]/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <p className="text-xs font-mono italic text-[#A1A5AD]/90">
                    {prob.sample}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
