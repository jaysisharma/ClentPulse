'use client'

import { Clock, MessageSquareX, AlertCircle } from 'lucide-react'

const FRICTION_POINTS = [
  {
    tag: 'Friction 01',
    title: 'The Chasing Loop',
    stat: '6.2 hrs/wk',
    metricLabel: 'Lost to status follow-ups',
    description:
      'Writing manual progress reports, screenshotting Figma files, and following up on client approvals consumes an entire billable workday every week.',
    icon: Clock,
  },
  {
    tag: 'Friction 02',
    title: 'Channel Fragmentation',
    stat: '14+ channels',
    metricLabel: 'Per active engagement',
    description:
      'Client feedback scattered between Slack DMs, Google Drive comments, WhatsApp voice notes, and 20-reply email chains where deliverables get lost.',
    icon: MessageSquareX,
  },
  {
    tag: 'Friction 03',
    title: 'The Payment Stall',
    stat: '22 days',
    metricLabel: 'Average invoice lag',
    description:
      'Deliverables get approved in chat, but invoices sit waiting because billing is disconnected from the work itself.',
    icon: AlertCircle,
  },
]

export function StoryProblem() {
  return (
    <section className="relative bg-[#090A0F] py-24 lg:py-32 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400/90 font-medium">
              01 — The Friction
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.035em] text-white leading-tight mb-4">
            Where client momentum silently evaporates.
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            The work is exceptional. The delivery system is broken. Modern freelancers spend more time managing client uncertainty than practicing their craft.
          </p>
        </div>

        {/* 3-Column Diagnostic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FRICTION_POINTS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] p-8 transition-all duration-300 hover:border-white/[0.12] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
                      {item.tag}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 font-light leading-relaxed mb-8">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.05]">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mb-1">
                    {item.stat}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.metricLabel}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
