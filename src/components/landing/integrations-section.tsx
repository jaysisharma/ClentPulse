'use client'

import { Code2, HardDrive, CreditCard, Calendar } from 'lucide-react'

// Custom SVGs for GitHub and Figma to ensure 100% authentic brand presentation
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function FigmaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 2h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8a4 4 0 0 1-4-4 4 4 0 0 1 4-4z" />
      <path d="M8 10h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8a4 4 0 0 1-4-4 4 4 0 0 1 4-4z" />
      <path d="M8 18a4 4 0 0 1-4-4 4 4 0 0 1 4-4h4v4a4 4 0 0 1-4 4z" />
      <circle cx="16" cy="14" r="4" />
      <circle cx="16" cy="6" r="4" />
    </svg>
  )
}

export function IntegrationsSection() {
  const tools = [
    {
      name: 'GitHub',
      role: 'Commits & PRs',
      desc: 'Syncs commit activity and pull request milestones to client timelines automatically.',
      icon: GithubIcon,
      accent: 'text-slate-900 bg-slate-100',
    },
    {
      name: 'Figma',
      role: 'Design updates',
      desc: 'Embeds interactive prototypes and live frames directly into client deliverables.',
      icon: FigmaIcon,
      accent: 'text-rose-600 bg-rose-50',
    },
    {
      name: 'Google Drive',
      role: 'Shared files',
      desc: 'Attaches large assets, zip bundles, and documents to project milestones.',
      icon: HardDrive,
      accent: 'text-blue-600 bg-blue-50',
    },
    {
      name: 'Stripe',
      role: 'Payments',
      desc: 'Processes deposits, milestone invoices, and retainer payouts instantly.',
      icon: CreditCard,
      accent: 'text-indigo-600 bg-indigo-50',
    },
    {
      name: 'Google Calendar',
      role: 'Deadlines',
      desc: 'Keeps project due dates and sprint reviews synced with client schedules.',
      icon: Calendar,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      name: 'VS Code',
      role: 'Work activity (optional)',
      desc: 'Shows live presence when you are actively coding without invasive surveillance.',
      icon: Code2,
      accent: 'text-sky-600 bg-sky-50',
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.accent} border border-slate-200/60 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
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
