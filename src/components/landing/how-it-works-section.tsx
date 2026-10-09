'use client'

import { FolderPlus, Share2, ArrowRightCircle } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: FolderPlus,
      title: 'Create a workspace',
      description:
        'Set up a project in under two minutes. Define your core milestones, add your kickoff checklist, and attach initial files or contracts.',
      tag: 'Step 1',
    },
    {
      number: '02',
      icon: Share2,
      title: 'Share one link',
      description:
        'Give your client a clean, passcode-protected link to their workspace. No passwords to remember or accounts for them to register.',
      tag: 'Step 2',
    },
    {
      number: '03',
      icon: ArrowRightCircle,
      title: 'Keep the work moving',
      description:
        'Publish updates, collect 1-click deliverable sign-offs, and receive invoice payments via Stripe without endless email threads.',
      tag: 'Step 3',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A7B8FF] mb-4">
            <span>Simple 3-Step Flow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            From scattered updates <br />
            <span className="font-normal text-[#A7B8FF]">
              to a smoother workflow.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            You don&apos;t need to change how you do your creative or technical work — only where your clients look to see it happen.
          </p>
        </div>

        {/* 3 Horizontal Steps on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2D33] bg-[#17191D] p-6 sm:p-7 flex flex-col justify-between hover:border-[#A7B8FF]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-[#A7B8FF] px-2.5 py-1 rounded-md bg-[#101113] border border-[#2A2D33]">
                      {step.tag}
                    </span>
                    <span className="text-2xl font-light font-mono text-[#A1A5AD]/40">
                      {step.number}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#1E2126] border border-[#2A2D33] flex items-center justify-center text-[#A7B8FF] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {step.description}
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
