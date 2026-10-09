'use client'

import { Sparkles, Mail, Bell, ShieldAlert } from 'lucide-react'

export function AutomationSection() {
  const automations = [
    {
      icon: Sparkles,
      title: 'Automated update draft preparation',
      description:
        'Frevio compiles your recently completed milestones, pending approvals, and active tasks into a clear draft broadcast so you can review and publish in seconds.',
      badge: 'Review before sending',
    },
    {
      icon: Mail,
      title: '1-click client email notifications',
      description:
        'Deliver polished email updates to clients through Resend with a direct link to their portal whenever a milestone is ready for review or an invoice is due.',
      badge: 'Email integration',
    },
    {
      icon: Bell,
      title: 'Overdue milestone & blocker flags',
      description:
        'Visual alert banners flag when a project is waiting on client feedback, deposit payment, or asset delivery, preventing silent timeline delays.',
      badge: 'Automated flags',
    },
    {
      icon: ShieldAlert,
      title: 'Scope Creep Shield & change orders',
      description:
        'Turn out-of-scope feedback into a formal change order with price, timeline impact (+X days), and upfront Stripe payment before you start additional work.',
      badge: 'Revenue protection',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-[#101113] border-t border-[#2A2D33] text-[#F5F5F3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17191D] border border-[#2A2D33] text-xs font-mono text-[#A7B8FF] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#A7B8FF]" />
            <span>Practical Productivity</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] text-[#F5F5F3] leading-[1.15]">
            Let routine work <br />
            <span className="font-normal text-[#A7B8FF]">
              take care of itself.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A1A5AD] font-normal leading-relaxed max-w-xl mx-auto">
            Practical automations designed to eliminate administrative friction — without taking control away from how you run your business.
          </p>
        </div>

        {/* 4 Automation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((item, idx) => {
            const Icon = item.icon
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
                    <span className="text-[11px] font-mono text-[#9BCDBF] px-2.5 py-1 rounded bg-[#101113] border border-[#2A2D33]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-[#F5F5F3] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A5AD] leading-relaxed">
                    {item.description}
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
