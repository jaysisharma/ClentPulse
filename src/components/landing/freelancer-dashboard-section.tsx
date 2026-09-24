'use client'

import Link from 'next/link'
import { FolderKanban, Receipt, TrendingUp, CheckCircle, Clock, ExternalLink } from 'lucide-react'

interface Props {
  signupHref: string
}

export function FreelancerDashboardSection({ signupHref }: Props) {
  return (
    <section id="dashboard-showcase" className="py-24 lg:py-32 px-5 sm:px-8 bg-[#090A0F] text-white border-t border-white/[0.08] relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Freelancer Dashboard Copy */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Freelancer Dashboard</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white leading-[1.08]">
              Everything organized <br />
              <span className="font-semibold text-slate-200">in one place</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed">
              Manage your clients, projects, tasks, invoices and revenue. Spend less time on admin, more time on actual work.
            </p>

            <div className="pt-2">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-sm transition-all"
              >
                <span>View demo</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: Sleek Dark Dashboard Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl p-5 sm:p-7 space-y-6">
              
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    F
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Freelancer Workspace</div>
                    <div className="text-[11px] text-slate-400">Welcome back, Alex</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400">Live Sync</span>
                </div>
              </div>

              {/* 3 Metric Stats Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                
                {/* Active Projects */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">Active Projects</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">8</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+2 this month</div>
                </div>

                {/* Pending Invoices */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">Pending</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">$9,200</div>
                  <div className="text-[10px] text-amber-400 font-mono">3 invoices</div>
                </div>

                {/* Total Earnings */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">Total Earnings</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">$24,500</div>
                  <div className="text-[10px] text-emerald-400 font-mono">+18% growth</div>
                </div>

              </div>

              {/* Recent Projects with Progress Bars */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-mono uppercase tracking-[0.14em] text-slate-400 font-medium">
                  Recent Active Projects
                </div>

                {/* Project 1 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-white">Acme Brand Identity</div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                      75% · Next: Handoff
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[75%] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Milestone 3 of 4</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px]">$4,800 due on sign-off</span>
                  </div>
                </div>

                {/* Project 2 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-white">Nova Fintech Web App</div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20">
                      40% · Next: Stripe Integration
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[40%] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Milestone 2 of 5</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">$6,500 milestone</span>
                  </div>
                </div>

                {/* Project 3 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-white">Pulse Studio Design System</div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                      100% · Completed
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[100%] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>All Deliverables Approved</span>
                    </div>
                    <span className="text-emerald-400 font-mono text-[10px]">$3,200 Paid</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
