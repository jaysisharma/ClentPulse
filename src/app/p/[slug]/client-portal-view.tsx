'use client'

import { useState } from 'react'
import {
  Radio, Layers, Receipt, MessageSquare,
  FileCheck, Calendar, Clock, Check, ChevronRight,
  ExternalLink, FileText, AlertTriangle,
  CreditCard, ArrowRight, Mail, Users, Building2,
  ThumbsUp, ThumbsDown, Target, Link as LinkIcon,
  Sparkles, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { fmtCurrency } from '@/lib/currencies'
import { formatDate, getWeekOf } from '@/lib/utils'
import { ApprovalCard } from './approval-actions'
import { ClientChecklist } from './client-checklist'
import { UpdateCommentForm } from './update-comment-form'
import { PortalResources } from '@/components/integrations/portal-resources'
import { FeedbackWidget } from './feedback-widget'

interface ClientPortalViewProps {
  project: any
  updates: any[] | null
  milestones: any[] | null
  checklistItems: any[] | null
  approvals: any[] | null
  projectResources: any[] | null
  projectInvoices: any[]
  teamMembers: any[]
  allComments: any[] | null
  owner: any
  orgData: any
  accentColor: string
  hoursLabel: string
  totalHours: number
  totalMilestones: number
  completedMilestones: number
  progressPercent: number
  targetLaunchDate: string | null
  contactEmail: string | null
  leadSpecialistName: string
  isDepositPending: boolean
  depositInvoice: any
}

export function ClientPortalView({
  project,
  updates,
  milestones,
  checklistItems,
  approvals,
  projectResources,
  projectInvoices,
  teamMembers,
  allComments,
  owner,
  orgData,
  accentColor,
  hoursLabel,
  totalHours,
  totalMilestones,
  completedMilestones,
  progressPercent,
  targetLaunchDate,
  contactEmail,
  leadSpecialistName,
  isDepositPending,
  depositInvoice,
}: ClientPortalViewProps) {
  const pendingApprovals = (approvals ?? []).filter(a => a.status === 'pending')
  const hasActionBlocker = isDepositPending || Boolean(project.waiting_on_client) || pendingApprovals.length > 0

  // Feed tabs: updates vs milestones vs all deliverables
  type FeedTab = 'updates' | 'milestones' | 'invoices'
  const [activeTab, setActiveTab] = useState<FeedTab>('updates')

  const unpaidInvoices = projectInvoices.filter(i => i.status !== 'paid')
  const latestInvoice = projectInvoices[0] || null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* ══════════════════════════════════════════════════════════════
          MAIN FEED COLUMN (Left 8 cols on desktop)
          Clean chronological progress, broadcasts & deliverable reviews
      ══════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-8 space-y-6">

        {/* ── Action Required Alert Banner (Shown only when attention needed) ── */}
        {hasActionBlocker && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/[0.05] p-4 sm:p-5 shadow-xs transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                Action Required From You
              </span>
            </div>

            <div className="space-y-3">
              {/* Deposit Required */}
              {isDepositPending && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0c0d12] border border-amber-200/80 dark:border-amber-500/20 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Kickoff Deposit Required
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5">
                        Work commences once the deposit of{' '}
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          {fmtCurrency(project.deposit_required, depositInvoice?.currency || 'USD')}
                        </span>{' '}
                        is settled.
                      </div>
                    </div>
                  </div>

                  {depositInvoice && (
                    <Link
                      href={`/invoice/${depositInvoice.id}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-2xs self-start sm:self-auto flex-shrink-0 cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span>Pay Deposit</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Waiting on client blocker */}
              {project.waiting_on_client && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c0d12] border border-amber-200/80 dark:border-amber-500/20 shadow-2xs">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Input or Assets Needed</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                    {project.waiting_reason || 'Progress is paused awaiting your input or review.'}
                  </p>
                </div>
              )}

              {/* Pending Approvals */}
              {!project.hide_approvals && pendingApprovals.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Deliverables Awaiting Your Approval ({pendingApprovals.length})
                  </div>
                  <div className="space-y-2">
                    {pendingApprovals.map(a => (
                      <ApprovalCard key={a.id} approval={a} accentColor={accentColor} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Kickoff Checklist (if client items exist) ── */}
        {!project.hide_kickoff && checklistItems && checklistItems.length > 0 && (
          <ClientChecklist items={checklistItems as Parameters<typeof ClientChecklist>[0]['items']} accentColor={accentColor} />
        )}

        {/* ── Main Feed Tab Switcher ── */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'updates'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcasts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'updates' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
              }`}>
                {updates?.length ?? 0}
              </span>
            </button>

            {!project.hide_milestones && (
              <button
                onClick={() => setActiveTab('milestones')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'milestones'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Milestones</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'milestones' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                }`}>
                  {completedMilestones}/{totalMilestones}
                </span>
              </button>
            )}

            {projectInvoices.length > 0 && (
              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Invoices</span>
                {unpaidInvoices.length > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold">
                    {unpaidInvoices.length} due
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 font-mono">
                    {projectInvoices.length}
                  </span>
                )}
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-light hidden sm:inline">
            Live client hub
          </span>
        </div>

        {/* ── TAB 1: Broadcasts Feed ── */}
        {activeTab === 'updates' && (
          <div className="space-y-4 animate-fade-in">
            {!updates?.length ? (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-10 text-center shadow-xs dark:shadow-none">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Broadcasts in Progress</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1 max-w-sm mx-auto">
                  No weekly broadcasts have been published yet. As milestone work completes, your studio will publish progress updates here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update, i) => (
                  <div
                    key={update.id}
                    className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden shadow-xs dark:shadow-none"
                  >
                    <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {getWeekOf(update.created_at)}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-light">
                          Published {formatDate(update.sent_at!)}
                        </div>
                      </div>
                      {i === 0 && (
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${accentColor}15`,
                            borderColor: `${accentColor}30`,
                            color: accentColor,
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2.5">
                        {(update.bullets ?? []).filter(Boolean).map((bullet: string, j: number) => (
                          <li key={j} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      {update.note && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                            &ldquo;{update.note}&rdquo;
                          </p>
                        </div>
                      )}
                      <UpdateCommentForm
                        updateId={update.id}
                        projectId={project.id}
                        accentColor={accentColor}
                        existingComments={(allComments ?? []).filter(c => c.update_id === update.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Milestones Roadmap ── */}
        {activeTab === 'milestones' && !project.hide_milestones && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs dark:shadow-none">
              {milestones?.map(m => {
                const overdue = !m.done && m.due_date && new Date(m.due_date + 'T12:00:00') < new Date(new Date().toDateString())
                return (
                  <div key={m.id} className="p-4 flex items-center gap-3.5 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        m.done ? 'border-transparent' : overdue ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-300 dark:border-white/20'
                      }`}
                      style={m.done ? { backgroundColor: accentColor } : {}}
                    >
                      {m.done ? (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      ) : overdue ? (
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm block truncate ${m.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                        {m.title}
                      </span>
                    </div>

                    {m.due_date && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono flex-shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className={overdue ? 'text-rose-500 font-medium' : m.done ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}>
                          {new Date(m.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: Invoices ── */}
        {activeTab === 'invoices' && projectInvoices.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs dark:shadow-none">
              {projectInvoices.map((inv) => {
                const isPaid = inv.status === 'paid'
                const displayAmount = inv.total ? Number(inv.total) : inv.amount ? Number(inv.amount) : 0
                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPaid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
                          <span>{inv.invoice_number || 'Invoice'}</span>
                          {inv.is_deposit && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              Deposit
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-light">
                          {isPaid && inv.paid_at
                            ? `Paid on ${new Date(inv.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : inv.due_date
                            ? `Due ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'Payment pending'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-white">
                          {fmtCurrency(displayAmount, inv.currency || 'USD')}
                        </div>
                        <div className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </div>
                      </div>

                      <Link
                        href={`/invoice/${inv.id}`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs ${
                          isPaid
                            ? 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                            : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                        }`}
                      >
                        <span>{isPaid ? 'Receipt' : 'Pay Now'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════
          STICKY CLIENT SIDEBAR (Right 4 cols on desktop)
          Reference, contacts, links, latest invoice & quick sentiment
      ══════════════════════════════════════════════════════════════ */}
      <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">

        {/* ── Block 1: Executive Overview Card ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Project Pulse
            </span>
            <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
              {progressPercent}% Done
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%`, backgroundColor: accentColor }}
            />
          </div>

          {/* Key Facts List */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 font-light flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Milestones
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {completedMilestones} / {totalMilestones} fulfilled
              </span>
            </div>

            {targetLaunchDate && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-light flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Target Launch
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {targetLaunchDate}
                </span>
              </div>
            )}

            {project.show_time_logged && totalHours > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-light flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Dedicated Time
                </span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {hoursLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Block 2: Studio Partner & Direct Contact ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 space-y-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Studio Lead
          </div>

          <div className="flex items-center gap-3">
            {orgData?.logo_url ? (
              <img src={orgData.logo_url} alt={leadSpecialistName} className="w-10 h-10 rounded-xl object-contain border border-slate-200 dark:border-white/10 p-0.5" />
            ) : owner?.logo_url ? (
              <img src={owner.logo_url} alt={leadSpecialistName} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {leadSpecialistName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {leadSpecialistName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {orgData ? 'Agency Partner' : 'Specialist'}
              </div>
            </div>
          </div>

          {contactEmail && (
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Question on ${project.project_name}`)}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Send Message</span>
            </a>
          )}
        </div>

        {/* ── Block 3: Assigned Pod Members (if agency) ── */}
        {teamMembers.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Assigned Specialists ({teamMembers.length})
            </div>

            <div className="space-y-2.5">
              {teamMembers.map(tm => {
                const u = tm.user
                const displayName = u?.name || u?.email?.split('@')[0] || 'Team Specialist'
                const initials = displayName.slice(0, 2).toUpperCase()

                let isLive = false
                let presenceText = 'Available'
                if (u?.last_heartbeat_at) {
                  const diffMinutes = Math.floor((Date.now() - new Date(u.last_heartbeat_at).getTime()) / 60000)
                  if (diffMinutes <= 15) {
                    isLive = true
                    presenceText = u.active_focus_area ? u.active_focus_area : 'Active in Editor'
                  }
                }

                return (
                  <div key={tm.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative flex-shrink-0">
                        {u?.logo_url ? (
                          <img src={u.logo_url} alt={displayName} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {initials}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#0c0d12] ${
                          isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{displayName}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
                      {tm.role_title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Block 4: Project Shared Resources & Files ── */}
        {projectResources && projectResources.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" /> Shared Project Assets
            </div>

            <div className="space-y-2">
              {projectResources.map(res => (
                <a
                  key={res.id}
                  href={res.external_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all text-xs group"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate pr-2">
                    {res.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Block 5: Latest Invoice / Billing Shortcut ── */}
        {latestInvoice && (
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Billing & Receipts
              </span>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                View all ({projectInvoices.length})
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {latestInvoice.invoice_number || 'Latest Invoice'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {latestInvoice.status === 'paid' ? 'Paid in full' : 'Payment due'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                  {fmtCurrency(latestInvoice.total || latestInvoice.amount || 0, latestInvoice.currency || 'USD')}
                </div>
                <Link
                  href={`/invoice/${latestInvoice.id}`}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {latestInvoice.status === 'paid' ? 'Receipt' : 'Pay'} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Block 6: Quick Client Sentiment Check ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-4 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5">
          <FeedbackWidget projectId={project.id} accentColor={accentColor} />
        </div>

      </aside>

    </div>
  )
}
