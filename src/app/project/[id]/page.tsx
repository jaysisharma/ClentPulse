import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Button } from '@/components/ui/button'
import { formatDate, getWeekOf } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Link2, Check, Send,
  Clock, AlertTriangle, FileSignature, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { CopyLinkButton } from './copy-link-button'
import { StatusToggle } from './status-toggle'
import { UpdateActions } from './update-actions'
import { ApprovalsSection } from './approvals-section'
import { MilestonesWidget } from './milestones-widget'
import { KickoffChecklist } from './kickoff-checklist'
import { ProjectActionsMenu } from './project-actions-menu'
import { CollapsibleSection } from './collapsible-section'
import { CollapsibleCard } from './collapsible-card'
import { UpdateCommentForm } from '@/app/p/[slug]/update-comment-form'
import { ClientFeedbackList } from './client-feedback-list'
import { UpdatesList } from './updates-list'
import { NotificationToast } from './notification-toast'
import { PresenceBadge } from '@/components/project/presence-badge'
import { ClientViewingBadge } from '@/components/project/client-viewing-badge'
import { ClientBlockerCard } from './client-blocker-card'
import { TeamPodSection } from './team-pod-section'
import type { ProjectTeamMember } from '@/types'

function checkFeedbackRecency(feedbackList: any[]) {
  const limit = 24 * 60 * 60 * 1000
  const now = Date.now()
  return feedbackList.some(fb => (now - new Date(fb.created_at).getTime()) < limit)
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sent?: string; saved?: string; reviewed?: string }>
}) {
  const { id } = await params
  const { sent, saved, reviewed } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { data: project },
    { data: updates },
    { data: invoices },
    { data: timeEntries },
    { data: milestones },
    { data: approvals },
    { data: contracts },
    { data: updateComments },
    { data: clientFeedback },
    { data: teamMembers },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('updates').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('items, currency, is_deposit, status').eq('project_id', id),
    supabase.from('time_entries').select('hours').eq('project_id', id),
    supabase.from('milestones').select('id, title, due_date, done').eq('project_id', id).order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('approvals').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('contracts').select('id, signed_at').eq('project_id', id),
    supabase.from('update_comments').select('*').eq('project_id', id).order('created_at', { ascending: true }),
    supabase.from('feedback').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    supabase.from('project_team_members').select('id, project_id, user_id, role_title, created_at, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area)').eq('project_id', id),
  ])

  if (!project) notFound()

  // RBAC Access Verification
  let callerRole: 'owner' | 'admin' | 'member' | null = null
  if (project.org_id) {
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    callerRole = memberData?.role ?? null

    // If caller is not the direct creator AND not a member of the agency, deny access
    if (project.user_id !== user.id && !callerRole) {
      notFound()
    }
  } else if (project.user_id !== user.id) {
    notFound()
  }

  const isPersonal = !project.org_id || project.user_id === user.id
  const canViewFinancials = isPersonal || ['owner', 'admin'].includes(callerRole ?? '')
  const canManageTeam = isPersonal || ['owner', 'admin'].includes(callerRole ?? '')

  const hasNewFeedback = checkFeedbackRecency(clientFeedback ?? [])

  const formattedTeamMembers: ProjectTeamMember[] = ((teamMembers as any[]) ?? []).map((tm: any) => ({
    id: tm.id,
    project_id: tm.project_id,
    user_id: tm.user_id,
    role_title: tm.role_title,
    created_at: tm.created_at,
    user: Array.isArray(tm.user) ? tm.user[0] : tm.user,
  }))

  const { data: owner } = await supabase.from('users').select('name').eq('id', user.id).single()
  const ownerName = owner?.name || (user.email?.split('@')[0] ?? 'You')

  const publicUrl   = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${project.slug}`
  const invoiced    = (invoices ?? []).flatMap(i => i.items ?? []).reduce((s: number, x: { amount: number }) => s + (x.amount ?? 0), 0)
  const hours       = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLabel = hours === 0
    ? '0h'
    : hours < 0.05
    ? `${Math.round(hours * 3600)}s`
    : hours % 1 === 0
    ? `${hours}h`
    : `${hours.toFixed(1)}h`
  const sentUpdates = (updates ?? []).filter(u => u.sent_at).length

  // ── Attention strip: surface here what the projects list flags ──────────
  const cutoff7d = new Date(); cutoff7d.setDate(cutoff7d.getDate() - 7)
  const lastSent = (updates ?? []).filter(u => u.sent_at)
    .sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
  const lastActivity = lastSent ? new Date(lastSent.sent_at!) : new Date(project.created_at)
  const isOverdue = project.status === 'active' && lastActivity < cutoff7d
  const pendingApprovals  = (approvals ?? []).filter(a => a.status === 'pending').length
  const hasContracts      = (contracts ?? []).length > 0
  const unsignedContracts = (contracts ?? []).filter(c => !c.signed_at).length

  const attention: { label: string; href: string; cta: string; icon: typeof AlertTriangle }[] = []
  const pendingReviewUpdates = (updates ?? []).filter(u => u.review_status === 'review_ready').length
  if (pendingReviewUpdates > 0 && canManageTeam) attention.push({ label: `${pendingReviewUpdates} update draft${pendingReviewUpdates > 1 ? 's' : ''} awaiting PM review`, href: '#updates', cta: 'Review', icon: AlertTriangle })
  if (project.waiting_on_client) attention.push({ label: `Blocked on client: ${project.waiting_reason || 'Awaiting feedback / assets'}`, href: '#client-blocker', cta: 'Manage blocker', icon: AlertTriangle })
  if (project.deposit_required && !project.deposit_paid) attention.push({ label: `Kickoff deposit pending: $${project.deposit_required.toLocaleString()} required`, href: '#client-blocker', cta: 'View', icon: Clock })
  if (isOverdue) attention.push({ label: 'No update sent in over a week', href: `/project/${id}/update`, cta: 'Send update', icon: Send })
  if (unsignedContracts > 0) attention.push({ label: `${unsignedContracts} contract${unsignedContracts > 1 ? 's' : ''} awaiting signature`, href: `/project/${id}/contract`, cta: 'Review', icon: FileSignature })
  if (pendingApprovals > 0) attention.push({ label: `${pendingApprovals} approval${pendingApprovals > 1 ? 's' : ''} pending`, href: `/project/${id}#approvals`, cta: 'View', icon: CheckCircle2 })

  // Kickoff matters most while the project is young — float it up until it's lived in.
  const isYoung = sentUpdates === 0


  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in pb-12">

        {sent === 'true' && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/10 shadow-xs animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">Weekly status update email has been sent to client via Resend.</span>
          </div>
        )}

        {reviewed === 'true' && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 flex items-center gap-3 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/10 shadow-xs animate-fade-in">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold">Weekly update draft submitted for agency PM review.</span>
          </div>
        )}

        {saved === 'true' && (
          <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-4 flex items-center gap-3 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/10 shadow-xs animate-fade-in">
            <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="text-xs font-semibold">Draft status update has been saved successfully.</span>
          </div>
        )}

        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/project"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to projects
          </Link>
        </div>

        {/* Header Title section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-1.5 h-12 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: project.color }} />
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-slate-900 dark:text-white truncate">{project.project_name}</h1>
                <StatusToggle projectId={project.id} current={project.status as 'active' | 'paused' | 'completed'} />
                <PresenceBadge
                  projectId={project.id}
                  initialHeartbeatAt={project.last_heartbeat_at ?? null}
                  initialFocusArea={project.active_focus_area ?? null}
                  mode="freelancer"
                />
                <ClientViewingBadge
                  projectId={project.id}
                  clientName={project.client_name}
                />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">{project.client_name}</p>

              {/* Compact Inline Metrics */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                {canViewFinancials && project.budget && (
                  <Link
                    href={`/project/${id}/settings`}
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors group"
                  >
                    <span className="font-medium text-slate-500 dark:text-slate-400">Budget:</span>
                    <span className={`font-mono ${invoiced > project.budget ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-900 dark:text-white font-medium'}`}>
                      ${invoiced.toLocaleString()} / ${project.budget.toLocaleString()}
                    </span>
                    <span className="font-mono text-slate-400">({Math.round((invoiced / project.budget) * 100)}%)</span>
                  </Link>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time Logged:
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium">{hoursLabel}</span>
                  <Link href="/time" className="text-slate-400 hover:text-slate-900 dark:hover:text-white underline font-mono ml-1">
                    Log time
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link href={`/project/${id}/update`}>
              <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Send update</span>
              </button>
            </Link>
            <ProjectActionsMenu projectId={id} />
          </div>
        </div>

        {/* Attention strip — mirrors the health signal from the projects list */}
        {attention.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5 divide-y divide-amber-500/10 overflow-hidden shadow-xs ring-1 ring-amber-500/10">
            {attention.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <a.icon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 flex-1 min-w-0">{a.label}</span>
                <Link href={a.href} className="flex-shrink-0">
                  <button className="rounded-full border border-amber-500/30 bg-white dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/30 px-3 py-1 text-xs font-semibold transition-all shadow-xs">
                    {a.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main: Updates + Approvals ────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Client Blocker & Nudge Control */}
            <div id="client-blocker">
              <ClientBlockerCard
                projectId={project.id}
                clientName={project.client_name}
                clientEmail={project.client_email}
                initialWaiting={project.waiting_on_client ?? false}
                initialReason={project.waiting_reason}
                depositRequired={project.deposit_required}
                depositPaid={project.deposit_paid}
                currency={invoices?.[0]?.currency || 'USD'}
              />
            </div>

            {/* Updates — the hero of this page */}
            <div id="updates" className="scroll-mt-6">
              <CollapsibleSection
                title="Updates"
                count={updates?.length ?? 0}
              >
                {!updates?.length ? (
                  <div className="bg-white/60 dark:bg-[#0c0d12]/60 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center ring-1 ring-slate-950/5 dark:ring-white/5">
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 font-light">No updates sent to {project.client_name} yet.</p>
                    <Link href={`/project/${id}/update`}>
                      <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all inline-flex items-center gap-1.5 shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Send first update</span>
                      </button>
                    </Link>
                  </div>
                ) : (
                  <UpdatesList
                    updates={updates}
                    projectColor={project.color}
                    projectId={id}
                    updateComments={updateComments ?? []}
                    ownerName={ownerName}
                    canApprove={canManageTeam}
                  />
                )}
              </CollapsibleSection>
            </div>

            {/* Approvals */}
            {!project.hide_approvals && (
              <div id="approvals" className="scroll-mt-6">
                <ApprovalsSection projectId={project.id} initialApprovals={approvals ?? []} />
              </div>
            )}

            {/* Client Feedback */}
            <CollapsibleSection
              title="Client Feedback"
              count={clientFeedback?.length ?? 0}
              defaultOpen={hasNewFeedback}
            >
              <ClientFeedbackList feedback={clientFeedback ?? []} />
            </CollapsibleSection>

            {/* Testimonial — completed only */}
            {project.status === 'completed' && (
              <div className="bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5 rounded-2xl p-6 flex items-center justify-between backdrop-blur-md">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Request a testimonial</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Collect a review from {project.client_name}.</p>
                </div>
                <Link href={`/testimonial/${project.id}`} target="_blank" rel="noopener noreferrer">
                  <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-medium transition-colors shadow-xs">
                    Open form
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar: grouped by meaning ──────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start">

            {/* Agency Team Pod */}
            {project.org_id && (
              <TeamPodSection
                projectId={project.id}
                orgId={project.org_id}
                initialTeamMembers={formattedTeamMembers}
                canManage={canManageTeam}
              />
            )}

            {/* Progress: milestones */}
            {!project.hide_milestones && (
              <MilestonesWidget
                projectId={project.id}
                color={project.color}
                initialMilestones={milestones ?? []}
              />
            )}

            {/* Client access: status page + contract status, grouped together */}
            {!project.hide_client_access && (
              <CollapsibleCard
                projectId={project.id}
                hideColumn="hide_client_access"
                icon={<Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                title="Client access"
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Status page</span>
                      <div className="flex items-center gap-1.5">
                        <CopyLinkButton url={publicUrl} />
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                          <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-2.5 py-1 text-xs transition-colors shadow-xs">
                            View
                          </button>
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-mono">{publicUrl}</p>
                  </div>

                  <Link href={`/project/${id}/contract`} className="border-t border-slate-100 dark:border-white/5 pt-4 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Contract</span>
                    </div>
                    {unsignedContracts > 0 ? (
                      <span className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">Unsigned</span>
                    ) : hasContracts ? (
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">Signed</span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white inline-flex items-center gap-1 transition-colors">Add <ChevronRight className="w-3 h-3" /></span>
                    )}
                  </Link>
                </div>
              </CollapsibleCard>
            )}

            {/* Kickoff — drops to the bottom once the project is lived-in */}
            {!isYoung && !project.hide_kickoff && <KickoffChecklist projectId={project.id} />}
          </div>

        </div>
        <NotificationToast projectId={project.id} />
        </div>
      </DarkShell>
    </AppLayout>
  )
}
