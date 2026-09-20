'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  FolderOpen,
  Send,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Mail,
  ChevronRight
} from 'lucide-react'
import { Organization } from '@/types'
import { formatDate } from '@/lib/utils'

interface RadarData {
  organization: Organization
  portfolio: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    uniqueClients: number
    totalContractedBudget: number
    totalHoursThisWeek: number
  }
  atRisk: {
    count: number
    items: Array<{
      projectId: string
      projectName: string
      clientName: string
      clientEmail?: string | null
      color: string
      slug: string
      daysSinceLastUpdate: number
      lastSentAt: string | null
      isOverdue: boolean
      isBlocked: boolean
      waitingReason?: string | null
      pendingReviews: number
      riskSeverity: 'high' | 'medium' | 'low'
      riskType: 'overdue_update' | 'blocked_on_client' | 'pending_review' | 'healthy'
    }>
  }
  blockedCash: {
    totalBlockedCash: number
    count: number
    items: Array<{
      id: string
      type: 'deposit' | 'invoice'
      projectId: string
      projectName: string
      clientName: string
      clientEmail?: string | null
      amount: number
      currency: string
      reason: string
    }>
  }
  teamWorkload: Array<{
    memberId: string
    userId: string
    role: string
    name: string
    email: string
    logoUrl?: string | null
    lastHeartbeatAt?: string | null
    activeFocusArea?: string | null
    assignedProjects: Array<{ id: string; projectName: string; color: string; roleTitle: string }>
    assignedProjectCount: number
    hoursThisWeek: number
    capacityStatus: 'available' | 'balanced' | 'overloaded'
  }>
}

function fmtCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AgencyExecutiveRadar({ data }: { data: RadarData }) {
  const { organization, portfolio, atRisk, blockedCash, teamWorkload } = data
  const [activeTab, setActiveTab] = useState<'overview' | 'at_risk' | 'blocked_cash' | 'capacity'>('overview')
  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    setCurrentTime(Date.now())
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ── Executive Studio Header ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono">
              <Building2 className="w-3.5 h-3.5" />
              {organization?.name} Executive Radar
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
              {organization?.billing_plan === 'agency_pro' ? 'Agency Pro' : 'Agency Studio'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
            Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
            Real-time portfolio telemetry, at-risk accounts, blocked revenue, and team capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/project/new">
            <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5">
              <span>New Client Project</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
          <Link href="/settings/team">
            <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-2 text-xs font-semibold transition-colors shadow-xs">
              Manage Team
            </button>
          </Link>
        </div>
      </div>

      {/* ── Top Executive KPI Cards Strip ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Portfolio */}
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Active Portfolio
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-light font-mono text-slate-900 dark:text-white tabular-nums">
            {portfolio.activeProjects} <span className="text-xs font-normal text-slate-400">projects</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{portfolio.uniqueClients}</span> distinct client accounts
          </div>
        </div>

        {/* KPI 2: At-Risk Radar */}
        <div className={`rounded-2xl bg-white dark:bg-[#0c0d12]/90 border p-5 ring-1 shadow-xs backdrop-blur-md transition-all ${
          atRisk.count > 0 
            ? 'border-amber-500/30 dark:border-amber-500/20 ring-amber-500/10' 
            : 'border-slate-200 dark:border-white/10 ring-slate-950/5 dark:ring-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              At-Risk Radar
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-light font-mono text-amber-700 dark:text-amber-400 tabular-nums">
            {atRisk.count} <span className="text-xs font-normal text-slate-400">accounts</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {atRisk.count === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">All projects updated this week ✓</span>
            ) : (
              <span>Overdue updates or blocked on client</span>
            )}
          </div>
        </div>

        {/* KPI 3: Blocked Cash */}
        <div className={`rounded-2xl bg-white dark:bg-[#0c0d12]/90 border p-5 ring-1 shadow-xs backdrop-blur-md transition-all ${
          blockedCash.totalBlockedCash > 0
            ? 'border-rose-500/30 dark:border-rose-500/20 ring-rose-500/10'
            : 'border-slate-200 dark:border-white/10 ring-slate-950/5 dark:ring-white/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
              Blocked Cash Radar
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-light font-mono text-rose-700 dark:text-rose-400 tabular-nums">
            {fmtCurrency(blockedCash.totalBlockedCash)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {blockedCash.count} pending deposit{blockedCash.count === 1 ? '' : 's'} / blocked invoices
          </div>
        </div>

        {/* KPI 4: Staffed Pod Utilization */}
        <div className="rounded-2xl bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Team Workload
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-light font-mono text-slate-900 dark:text-white tabular-nums">
            {teamWorkload.length} <span className="text-xs font-normal text-slate-400">specialists</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{portfolio.totalHoursThisWeek}h</span> logged across agency this week
          </div>
        </div>

      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Executive Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('at_risk')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'at_risk'
              ? 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>At-Risk Radar</span>
          {atRisk.count > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] flex items-center justify-center font-bold">
              {atRisk.count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blocked_cash')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
            activeTab === 'blocked_cash'
              ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Blocked Cash</span>
          {blockedCash.count > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-400 text-slate-950 font-mono text-[10px] flex items-center justify-center font-bold">
              {blockedCash.count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('capacity')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'capacity'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Capacity Matrix
        </button>
      </div>

      {/* ── Tab 1: Overview ───────────────────────────────── */}
      {(activeTab === 'overview' || activeTab === 'at_risk') && atRisk.count > 0 && (
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 p-6 backdrop-blur-md ring-1 ring-amber-500/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                At-Risk Client Accounts ({atRisk.count})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              Action Required
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {atRisk.items.map(item => (
              <div key={item.projectId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/project/${item.projectId}`} 
                        className="text-xs font-semibold text-slate-900 dark:text-white hover:underline"
                      >
                        {item.projectName}
                      </Link>
                      <span className="text-slate-400 text-xs">·</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.clientName}</span>
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      {item.isOverdue && item.daysSinceLastUpdate > 0 && `No update sent in ${item.daysSinceLastUpdate} days.`}
                      {item.isBlocked && ` Blocked on client: ${item.waitingReason || 'Awaiting assets'}`}
                      {item.pendingReviews > 0 && ` · ${item.pendingReviews} draft update awaiting PM approval`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/project/${item.projectId}/update`}>
                    <button className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 px-3 py-1 text-xs font-semibold transition-colors inline-flex items-center gap-1.5">
                      <Send className="w-3 h-3" />
                      <span>Send Update</span>
                    </button>
                  </Link>
                  <Link href={`/project/${item.projectId}`}>
                    <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-xs font-medium transition-colors">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 2: Blocked Cash ───────────────────────────── */}
      {(activeTab === 'overview' || activeTab === 'blocked_cash') && blockedCash.count > 0 && (
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-rose-500/30 dark:border-rose-500/20 p-6 backdrop-blur-md ring-1 ring-rose-500/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Blocked Cash Pipeline ({fmtCurrency(blockedCash.totalBlockedCash)})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
              {blockedCash.count} Held-up Settlement{blockedCash.count === 1 ? '' : 's'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {blockedCash.items.map(item => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{item.projectName}</span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.clientName}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">
                    {fmtCurrency(item.amount, item.currency)}
                  </span>
                  <Link href={`/project/${item.projectId}`}>
                    <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-xs font-medium transition-colors">
                      Manage Blocker
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 3: Team Capacity Matrix ────────────────────── */}
      {(activeTab === 'overview' || activeTab === 'capacity') && (
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Team Workload & Specialist Capacity Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Staffed project allocation, active focus telemetry, and onboarding availability.
              </p>
            </div>
            <Link href="/settings/team">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">
                <span>Manage seats</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {teamWorkload.map(member => (
              <div key={member.memberId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Member Identity & Telemetry */}
                <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center uppercase">
                      {member.name[0] || 'M'}
                    </div>
                    {/* Real-time IDE Pulse Dot */}
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0c0d12] ${
                        member.lastHeartbeatAt && currentTime && (currentTime - new Date(member.lastHeartbeatAt).getTime() < 300000)
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-slate-400'
                      }`}
                      title={member.activeFocusArea ? `Focus: ${member.activeFocusArea}` : 'Status'}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {member.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                      {member.email} · <span className="capitalize">{member.role === 'admin' ? 'Project Manager' : member.role}</span>
                    </div>
                    {member.activeFocusArea && (
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                        ⚡ {member.activeFocusArea}
                      </div>
                    )}
                  </div>
                </div>

                {/* Staffed Projects Chips */}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-1">
                    Staffed Pods ({member.assignedProjectCount})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.assignedProjects.length === 0 ? (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">No assigned projects</span>
                    ) : (
                      member.assignedProjects.map(p => (
                        <Link 
                          key={p.id} 
                          href={`/project/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-sans hover:border-slate-300 dark:hover:border-white/20 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{p.projectName}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Hours & Availability Gauge */}
                <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                      {member.hoursThisWeek} hrs
                    </div>
                    <div className="text-[10px] text-slate-400">this week</div>
                  </div>

                  <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-semibold uppercase ${
                    member.capacityStatus === 'available'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : member.capacityStatus === 'balanced'
                      ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {member.capacityStatus === 'available' ? '● Available' : member.capacityStatus === 'balanced' ? '● Optimal' : '● At Capacity'}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
