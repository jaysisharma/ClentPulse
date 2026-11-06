'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { Bell, CheckCircle2, ExternalLink, Mail, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CARD } from '@/components/dashboard/styles'
import { PortalResources } from '@/components/integrations/portal-resources'
import { PortalClientFiles } from '@/components/portal/portal-client-files'
import { PresenceBadge } from '@/components/project/presence-badge'
import { ThemeToggle } from '@/components/theme-toggle'
import type { ChangeOrder, AppBuild } from '@/types'
import { PortalRealtimeSubscriber } from './portal-realtime'
import type { Approval } from './approval-actions'
import { OverviewTab } from './portal-overview'
import { ReviewTab } from './portal-review'
import { UpdatesTab } from './portal-updates'
import { BillingTab } from './portal-billing'
import {
  PORTAL_TABS, changeOrderNeedsPayment, collectTodos, scheduleStatus, tabFromHash,
  type PortalChecklistItem, type PortalInvoice, type PortalMilestone, type PortalTab,
} from './portal-model'
import { CountBadge, MUTED, PRIMARY_BUTTON, SECONDARY_BUTTON, Section, SchedulePill, initials, useChecklist, useSyncedState } from './portal-ui'

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
  changeOrders?: ChangeOrder[]
  appBuilds?: AppBuild[]
  /** Set after returning from a successful change-order checkout. */
  justPaid?: boolean
  isDemo?: boolean
  footer?: React.ReactNode
}

const EMPTY: never[] = []

// The active tab lives in the URL hash so it survives refreshes, works with the
// back button, and old #files / #checklist links still land somewhere sensible.
function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function ClientPortalView({
  project,
  updates,
  milestones,
  checklistItems,
  approvals: initialApprovals,
  projectResources,
  projectInvoices,
  teamMembers,
  allComments,
  owner,
  orgData,
  accentColor,
  hoursLabel,
  totalMilestones,
  completedMilestones,
  progressPercent,
  targetLaunchDate,
  contactEmail,
  leadSpecialistName,
  isDepositPending,
  depositInvoice,
  changeOrders: initialChangeOrders = EMPTY,
  appBuilds = EMPTY,
  justPaid = false,
  isDemo = false,
  footer = null,
}: ClientPortalViewProps) {
  const accent = accentColor || '#6366F1'

  const hashTab = useSyncExternalStore(subscribeToHash, () => tabFromHash(window.location.hash), () => null)
  const tab: PortalTab = hashTab ?? 'overview'

  function goTo(next: PortalTab) {
    if (next === tab) return
    window.history.pushState(null, '', `#${next}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    document.getElementById('portal-tabs')?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const [approvals, setApprovals] = useSyncedState<Approval[]>(initialApprovals ?? EMPTY)
  const [changeOrders, setChangeOrders] = useSyncedState<ChangeOrder[]>(initialChangeOrders)
  const checklist = useChecklist((checklistItems ?? EMPTY) as PortalChecklistItem[], isDemo)
  const [notice, setNotice] = useState<string | null>(null)
  const [showPaidBanner, setShowPaidBanner] = useState(justPaid)

  const milestoneList = (milestones ?? EMPTY) as PortalMilestone[]
  const invoices = projectInvoices as PortalInvoice[]
  const sentUpdates = useMemo(() => (updates ?? EMPTY).filter((u: any) => u.sent_at), [updates])
  const comments = allComments ?? EMPTY

  const todos = collectTodos({
    isDepositPending,
    depositInvoice,
    waitingOnClient: Boolean(project.waiting_on_client),
    invoices,
    approvals,
    changeOrders,
    checklist: checklist.items,
  })
  const schedule = scheduleStatus(project.status, milestoneList)
  const nextMilestone = milestoneList.find(m => !m.done) ?? null

  const reviewCount = todos.pendingApprovals.length + todos.pendingChangeOrders.length + todos.payableChangeOrders.length
  const billingCount = todos.unpaidInvoices.length + todos.payableChangeOrders.length + (todos.depositPending ? 1 : 0)
  const tabCounts: Partial<Record<PortalTab, { count: number; tone: 'amber' | 'slate' }>> = {
    overview: { count: todos.count, tone: 'amber' },
    review: { count: reviewCount, tone: 'amber' },
    updates: { count: sentUpdates.length, tone: 'slate' },
    billing: { count: billingCount, tone: 'amber' },
  }

  const brandName = orgData?.name || owner?.name || 'Your project'
  const brandLogo = orgData?.logo_url || owner?.logo_url || null
  const ownerFirstName = owner?.name?.split(' ')[0] || 'your team'
  // The lead is shown first, so leave them out of the pod list
  const team = teamMembers.filter(m => m.user && m.user_id !== owner?.id && m.user.name !== leadSpecialistName)
  const mailtoHref = contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Question on ${project.project_name}`)}` : null
  const messageLabel = `Message ${owner?.name?.split(' ')[0] || 'the team'}`
  const overdueInvoice = projectInvoices.find(i => i.status === 'sent' && i.due_date && new Date(i.due_date) < new Date())

  function handleApprovalDecided(a: Approval) {
    setApprovals(prev => prev.map(x => (x.id === a.id ? { ...x, ...a } : x)))
    if (tab === 'overview') {
      setNotice(a.status === 'approved' ? `Approved “${a.title}”. Thanks!` : `Change request sent for “${a.title}”.`)
    }
  }

  function handleChangeOrderUpdated(co: ChangeOrder) {
    setChangeOrders(prev => prev.map(x => (x.id === co.id ? { ...x, ...co } : x)))
    if (tab === 'overview' && !changeOrderNeedsPayment(co)) {
      setNotice(co.status === 'declined' ? `Declined “${co.title}”. The original scope stays.` : `Approved “${co.title}”.`)
    }
  }

  async function handleToggleTask(item: PortalChecklistItem) {
    const ok = await checklist.toggle(item)
    if (ok && !item.done) setNotice(`Marked “${item.title}” as done.`)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#090a0f] text-slate-900 dark:text-slate-100 font-sans">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0d0f15]/90 backdrop-blur-md border-b border-[#eaecf2] dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandLogo} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: accent }}>
                {initials(brandName)}
              </span>
            )}
            <span className="font-bold text-sm tracking-tight truncate">{brandName}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <PortalRealtimeSubscriber projectId={project.id} clientName={project.client_name} accentColor={accent} />
            </div>
            <Link
              href={`/p/${project.slug}/subscribe`}
              title="Get updates by email"
              aria-label="Get updates by email"
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── Hero: what is this, and is it on track ──────────────────── */}
        <section aria-label="Project status" className={cn(CARD, 'p-5 sm:p-6 space-y-5')}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={cn('text-xs font-semibold', MUTED)}>Project for {project.client_name}</p>
              <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-[-0.02em] text-slate-900 dark:text-white mt-0.5 break-words">
                {project.project_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <SchedulePill status={schedule} />
                {project.show_live_presence !== false && (
                  <PresenceBadge
                    projectId={project.id}
                    initialHeartbeatAt={project.last_heartbeat_at ?? null}
                    initialFocusArea={project.active_focus_area ?? null}
                    mode="client"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-shrink-0">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={cn(SECONDARY_BUTTON, 'text-sm')}>
                  <ExternalLink className="w-4 h-4" /> Open live site
                </a>
              )}
              {mailtoHref && (
                <a href={mailtoHref} className={cn(PRIMARY_BUTTON, 'text-sm')} style={{ backgroundColor: accent }}>
                  <Mail className="w-4 h-4" /> {messageLabel}
                </a>
              )}
            </div>
          </div>

          {totalMilestones > 0 && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm">
                  <span className="text-lg font-extrabold tabular-nums">{progressPercent}%</span>
                  <span className={cn('ml-2', MUTED)}>{completedMilestones} of {totalMilestones} milestones done</span>
                </p>
                <p className={cn('text-xs', MUTED)}>
                  {nextMilestone && <>Next: <span className="font-semibold text-slate-700 dark:text-slate-200">{nextMilestone.title}</span></>}
                  {nextMilestone && targetLaunchDate && ' · '}
                  {targetLaunchDate && <>Target finish <span className="font-semibold text-slate-700 dark:text-slate-200">{targetLaunchDate}</span></>}
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Project progress"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden mt-2"
              >
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, backgroundColor: accent }} />
              </div>
            </div>
          )}
        </section>

        {showPaidBanner && (
          <div role="status" className="flex items-center gap-2 px-4 py-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 min-w-0">Payment received — thank you. It can take a minute to show as paid.</span>
            <button type="button" onClick={() => setShowPaidBanner(false)} aria-label="Dismiss" className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <nav id="portal-tabs" aria-label="Portal sections" className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-[#f8f9fc]/95 dark:bg-[#090a0f]/95 backdrop-blur-md scroll-mt-16">
          <div role="tablist" className="flex items-center gap-1 overflow-x-auto overflow-y-hidden border-b border-[#eaecf2] dark:border-white/[0.08]">
            {PORTAL_TABS.map(t => {
              const active = tab === t.key
              const badge = tabCounts[t.key]
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  id={`tab-${t.key}`}
                  aria-selected={active}
                  aria-controls={`panel-${t.key}`}
                  onClick={() => goTo(t.key)}
                  className={cn(
                    'relative inline-flex items-center gap-2 min-h-11 px-3 sm:px-4 text-sm whitespace-nowrap cursor-pointer transition-colors',
                    active ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {t.label}
                  {badge && badge.count > 0 && <CountBadge count={badge.count} tone={badge.tone} />}
                  {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full" style={{ backgroundColor: accent }} />}
                </button>
              )
            })}
          </div>
        </nav>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'overview' && (
            <OverviewTab
              project={project}
              todos={todos}
              checklist={checklist.items}
              onToggleTask={handleToggleTask}
              notice={notice}
              onDismissNotice={() => setNotice(null)}
              onApprovalDecided={handleApprovalDecided}
              onChangeOrderUpdated={handleChangeOrderUpdated}
              latestUpdate={sentUpdates[0] ?? null}
              updateCount={sentUpdates.length}
              comments={comments}
              milestones={milestoneList}
              nextMilestone={nextMilestone}
              targetLaunchDate={targetLaunchDate}
              hoursLabel={hoursLabel}
              leadName={leadSpecialistName}
              team={team}
              mailtoHref={mailtoHref}
              messageLabel="Send a message"
              accent={accent}
              isDemo={isDemo}
              onGoTo={goTo}
            />
          )}

          {tab === 'review' && (
            <ReviewTab
              project={project}
              appBuilds={appBuilds}
              approvals={approvals}
              changeOrders={changeOrders}
              accent={accent}
              overdueInvoice={overdueInvoice}
              isDemo={isDemo}
              onApprovalDecided={handleApprovalDecided}
              onChangeOrderUpdated={handleChangeOrderUpdated}
            />
          )}

          {tab === 'updates' && (
            <UpdatesTab
              updates={sentUpdates}
              comments={comments}
              projectId={project.id}
              clientName={project.client_name}
              ownerFirstName={ownerFirstName}
              accent={accent}
            />
          )}

          {tab === 'files' && (
            <div className="space-y-6">
              <Section title="Files">
                <PortalClientFiles slug={project.slug} accentColor={accent} isDemo={isDemo} />
              </Section>
              {projectResources && projectResources.length > 0 && (
                <Section title="Shared links & tools">
                  <PortalResources resources={projectResources} accentColor={accent} />
                </Section>
              )}
            </div>
          )}

          {tab === 'billing' && (
            <BillingTab
              invoices={invoices}
              changeOrders={changeOrders}
              depositRequired={Number(project.deposit_required) || 0}
              depositPaid={Boolean(project.deposit_paid)}
              accent={accent}
              isDemo={isDemo}
            />
          )}
        </div>

        {footer}
      </main>
    </div>
  )
}
