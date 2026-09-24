'use client'

import {
  GitHubIcon,
  FigmaIcon,
  GoogleDriveIcon,
  StripeIcon,
  GoogleCalendarIcon,
  VSCodeIcon,
} from '@/components/ui/brand-icons'

export function IntegrationsSection() {
  const tools = [
    {
      name: 'GitHub',
      role: 'Commits & PRs',
      desc: 'Syncs commit activity and pull request milestones to client timelines automatically.',
      icon: GitHubIcon,
      accent: 'bg-slate-100 text-slate-900 border-slate-200/80',
    },
    {
      name: 'Figma',
      role: 'Design updates',
      desc: 'Embeds interactive prototypes and live frames directly into client deliverables.',
      icon: FigmaIcon,
      accent: 'bg-white border-slate-200/80 shadow-sm',
    },
    {
      name: 'Google Drive',
      role: 'Shared files',
      desc: 'Attaches large assets, zip bundles, and documents to project milestones.',
      icon: GoogleDriveIcon,
      accent: 'bg-white border-slate-200/80 shadow-sm',
    },
    {
      name: 'Stripe',
      role: 'Payments',
      desc: 'Processes deposits, milestone invoices, and retainer payouts instantly.',
      icon: StripeIcon,
      accent: 'bg-[#635BFF]/10 border-[#635BFF]/20 shadow-sm',
    },
    {
      name: 'Google Calendar',
      role: 'Deadlines',
      desc: 'Keeps project due dates and sprint reviews synced with client schedules.',
      icon: GoogleCalendarIcon,
      accent: 'bg-white border-slate-200/80 shadow-sm',
    },
    {
      name: 'VS Code',
      role: 'Work activity (optional)',
      desc: 'Shows live presence when you are actively coding without invasive surveillance.',
      icon: VSCodeIcon,
      accent: 'bg-sky-50 border-sky-100 shadow-sm',
    },
  ]

  return (
    <section id="integrations" className="py-24 lg:py-32 px-5 sm:px-8 bg-white border-t border-slate-200/80 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
            <span>Integrations</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-slate-950 leading-[1.08]">
            Works with the tools <br className="hidden sm:inline" />
            <span className="font-semibold text-slate-900">you already use</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Bring everything together. Connect your workflow and let Frevio keep your client updated automatically.
          </p>
        </div>

        {/* Interconnected Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.name}
                className="p-6 rounded-2xl bg-[#FAFAFC] border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-2.5 ${tool.accent} border group-hover:scale-105 transition-transform`}>
                      <Icon className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{tool.name}</h3>
                      <div className="text-[11px] font-mono text-slate-400">{tool.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Connected
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
