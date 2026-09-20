import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, getWeekOf } from '@/lib/utils'
import { Zap, Bell, Clock, Sparkles, AlertTriangle, CreditCard, ArrowRight, Users, Building2 } from 'lucide-react'
import { fmtCurrency } from '@/lib/currencies'
import Link from 'next/link'
import { FeedbackWidget } from './feedback-widget'
import { ApprovalCard } from './approval-actions'
import { UpdateCommentForm } from './update-comment-form'
import { ClientChecklist } from './client-checklist'
import { CompletedProjectPopup } from '@/components/project/completed-project-popup'
import { PresenceBadge } from '@/components/project/presence-badge'
import { PortalRealtimeSubscriber } from './portal-realtime'
import { PortalResources } from '@/components/integrations/portal-resources'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PasscodeGate } from './passcode-gate'
import { isPaidPlan } from '@/lib/plans'
import { PoweredByReferral } from '@/components/ui/powered-by-referral'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: projectRows } = await supabase
    .rpc('get_project_by_slug', { p_slug: slug })
  const project = projectRows?.[0] ?? null

  if (!project) {
    return {
      title: 'Project Status | Frevio',
      robots: { index: false, follow: false }
    }
  }

  const { data: orgData } = project.org_id
    ? await supabase
        .from('organizations')
        .select('name, favicon_url, white_label')
        .eq('id', project.org_id)
        .maybeSingle()
    : { data: null }

  const portalBrand = orgData?.white_label
    ? orgData.name
    : orgData?.name
    ? `${orgData.name} · Frevio`
    : 'Frevio'

  const title = `${project.project_name} — Client Portal | ${portalBrand}`
  const description = `Track milestones, deliverables, and progress updates for ${project.project_name}.`

  return {
    title,
    description,
    icons: orgData?.favicon_url ? { icon: orgData.favicon_url } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: portalBrand,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: projectRows } = await supabase
    .rpc('get_project_by_slug', { p_slug: slug })

  const project = projectRows?.[0] ?? null
  if (!project) notFound()

  if (project.passcode) {
    const cookieStore = await cookies()
    const enteredPasscode = cookieStore.get(`client_project_passcode_${slug}`)?.value
    if (enteredPasscode !== project.passcode) {
      return <PasscodeGate slug={slug} projectColor={project.color} />
    }
  }

  const { data: updates } = await supabase
    .from('updates')
    .select('*')
    .eq('project_id', project.id)
    .not('sent_at', 'is', null)
    .order('created_at', { ascending: false })

  const { data: owner } = await supabase
    .from('users')
    .select('id, name, username, logo_url, accent_color, plan')
    .eq('id', project.user_id)
    .single()

  const { data: orgData } = project.org_id
    ? await supabase
        .from('organizations')
        .select('id, name, slug, logo_url, favicon_url, accent_color, white_label, custom_domain')
        .eq('id', project.org_id)
        .maybeSingle()
    : { data: null }

  const { data: teamMembersRaw } = await supabase
    .from('project_team_members')
    .select('id, role_title, user_id, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area)')
    .eq('project_id', project.id)

  type TeamMemberPod = {
    id: string
    role_title: string
    user_id: string
    user: {
      id: string
      name: string | null
      email: string | null
      logo_url: string | null
      last_heartbeat_at: string | null
      active_focus_area: string | null
    } | null
  }

  const teamMembers = (teamMembersRaw as unknown as TeamMemberPod[]) ?? []

  const { data: timeEntries } = project.show_time_logged
    ? await supabase
        .from('time_entries')
        .select('hours')
        .eq('project_id', project.id)
    : { data: null }

  const totalHours = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLabel = totalHours === 0
    ? '0h'
    : totalHours % 1 === 0
    ? `${totalHours}h`
    : `${totalHours.toFixed(1)}h`

  const accentColor = orgData?.accent_color || (isPaidPlan(owner?.plan) && owner?.accent_color ? owner.accent_color : '#6366F1')

  const { data: approvals } = await supabase
    .from('approvals')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  const { data: allComments } = await supabase
    .from('update_comments')
    .select('id, update_id, author_name, body, created_at')
    .eq('project_id', project.id)
    .eq('is_internal', false)
    .order('created_at', { ascending: true })

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, title, due_date, done')
    .eq('project_id', project.id)
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('id, title, assigned_to, done, done_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })

  let hasTestimonial = false
  if (project.status === 'completed') {
    const { data: testimonialsData } = await supabase
      .from('testimonials')
      .select('id')
      .eq('project_id', project.id)
      .limit(1)
    hasTestimonial = (testimonialsData ?? []).length > 0
  }

  const { data: depositInvoices } = await supabase
    .from('invoices')
    .select('id, amount, currency, status')
    .eq('project_id', project.id)
    .eq('is_deposit', true)
    .order('created_at', { ascending: false })
    .limit(1)

  const depositInvoice = depositInvoices?.[0] ?? null
  const isDepositPending = Boolean(project.deposit_required && project.deposit_required > 0 && !project.deposit_paid)

  // Fetch integration resources for this project (portal-visible only)
  const { data: projectResources } = await supabase
    .from('project_resources')
    .select('*, integration_connections(status, provider_account_email)')
    .eq('project_id', project.id)
    .eq('show_in_portal', true)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/5 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Sticky Header */}
      <div className="border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {orgData?.logo_url ? (
              <img src={orgData.logo_url} alt={orgData.name} className="h-8 w-auto object-contain rounded" />
            ) : isPaidPlan(owner?.plan) && owner?.logo_url ? (
              <img src={owner.logo_url} alt="Logo" className="h-8 w-auto object-contain rounded" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                {orgData ? <Building2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </div>
            )}
            <div>
              <div className="font-medium text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                <span>{project.project_name}</span>
                {orgData && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    {orgData.name}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Client: {project.client_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PortalRealtimeSubscriber
              projectId={project.id}
              clientName={project.client_name}
              accentColor={accentColor}
            />
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: project.status === 'active' ? '#22c55e' : '#94a3b8' }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {project.status}
              </span>
            </div>
            <Link
              href={`/p/${project.slug}/subscribe`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 relative z-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div
            className="w-12 h-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          {project.show_live_presence !== false && (
            <PresenceBadge
              projectId={project.id}
              initialHeartbeatAt={project.last_heartbeat_at ?? null}
              initialFocusArea={project.active_focus_area ?? null}
              mode="client"
            />
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white mb-2">
          {project.project_name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light">
          {orgData
            ? `Milestones, deliverables, and progress broadcasts from the ${orgData.name} team.`
            : `Milestone progress and deliverables from ${owner?.name ?? 'your specialist'}.`}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-400 dark:text-slate-500">
          <span>{updates?.length ?? 0} update{(updates?.length ?? 0) !== 1 ? 's' : ''} broadcasted</span>
          {updates?.[0] && (
            <span>· Last update {formatDate(updates[0].created_at)}</span>
          )}
          {project.show_time_logged && totalHours > 0 && (
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono">
              · <Clock className="w-3.5 h-3.5" />
              {hoursLabel} logged
            </span>
          )}
        </div>
      </div>

      {/* Dedicated Agency Pod Section */}
      {teamMembers.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-6 relative z-10">
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-5 backdrop-blur-md shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Dedicated Staffed Pod
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">
                    {teamMembers.length} assigned specialist{teamMembers.length > 1 ? 's' : ''} maintaining this project
                  </p>
                </div>
              </div>
              {orgData && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  {orgData.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((tm) => {
                const u = tm.user
                const displayName = u?.name || u?.email?.split('@')[0] || 'Team Specialist'
                const initials = displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                let isLive = false
                let presenceText = 'Available'
                if (u?.last_heartbeat_at) {
                  const diffMinutes = Math.floor(
                    (Date.now() - new Date(u.last_heartbeat_at).getTime()) / 60000
                  )
                  if (diffMinutes <= 15) {
                    isLive = true
                    presenceText = u.active_focus_area ? `Focus: ${u.active_focus_area}` : 'Active in Editor'
                  } else if (diffMinutes < 60) {
                    presenceText = `Active ${diffMinutes}m ago`
                  } else if (diffMinutes < 1440) {
                    presenceText = `Active ${Math.floor(diffMinutes / 60)}h ago`
                  }
                }

                return (
                  <div
                    key={tm.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all hover:border-slate-200 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {u?.logo_url ? (
                          <img
                            src={u.logo_url}
                            alt={displayName}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-400">
                            {initials}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0c0d12] ${
                            isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {displayName}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono truncate">
                          {tm.role_title}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5'
                        }`}
                      >
                        {presenceText}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Upfront Kickoff Deposit Settlement Gate */}
      {isDepositPending && (
        <div className="max-w-3xl mx-auto px-6 pb-6 relative z-10">
          <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/40 dark:via-[#0c0d12]/90 dark:to-[#0c0d12]/90 rounded-2xl border border-indigo-500/30 p-6 backdrop-blur-md shadow-xs ring-1 ring-indigo-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Kickoff Deposit Required
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                      Awaiting Payment
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-light mt-1 max-w-xl">
                    Work on upcoming milestones is scheduled to commence once the upfront deposit of{' '}
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {fmtCurrency(project.deposit_required, depositInvoice?.currency || 'USD')}
                    </span>{' '}
                    is settled.
                  </p>
                </div>
              </div>

              {depositInvoice ? (
                <Link
                  href={`/invoice/${depositInvoice.id}`}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-md transition-all hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  <span>Pay Deposit ({fmtCurrency(project.deposit_required, depositInvoice.currency || 'USD')})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="flex-shrink-0 text-xs font-mono text-slate-400 dark:text-slate-500">
                  Deposit invoice pending generation
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waiting on Client Blocker Banner */}
      {project.waiting_on_client && (
        <div className="max-w-3xl mx-auto px-6 pb-6 relative z-10">
          <div className="bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-500/30 p-5 backdrop-blur-md shadow-xs ring-1 ring-amber-500/20">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Action Required from You
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                    Paused
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-1">
                  {project.waiting_reason || 'Progress is currently paused awaiting your input, credentials, or review.'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
                  Please deliver the requested items to keep milestones moving on track.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Logged Card */}
      {project.show_time_logged && totalHours > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-6 relative z-10">
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 px-6 py-5 flex items-center gap-4 backdrop-blur-md shadow-xs dark:shadow-none">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Clock className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="text-2xl font-light tracking-tight font-mono text-slate-900 dark:text-white">{hoursLabel}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">Total dedicated hours invested into this project</div>
            </div>
          </div>
        </div>
      )}

      {/* Kickoff checklist */}
      {!project.hide_kickoff && checklistItems && checklistItems.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-6 relative z-10">
          <ClientChecklist items={checklistItems as Parameters<typeof ClientChecklist>[0]['items']} accentColor={accentColor} />
        </div>
      )}

      {/* Integration resources: Drive files, Calendar events, GitHub PRs, Figma files */}
      {projectResources && projectResources.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-8 relative z-10">
          <PortalResources resources={projectResources as any} accentColor={accentColor} />
        </div>
      )}

      {/* Milestones */}
      {!project.hide_milestones && milestones && milestones.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-8 relative z-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Milestones & Deliverables
          </h2>
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 backdrop-blur-md shadow-xs dark:shadow-none space-y-3">
            {/* Progress bar */}
            {(() => {
              const done  = milestones.filter(m => m.done).length
              const total = milestones.length
              return total > 0 ? (
                <div className="mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-light mb-2">
                    <span>{done} of {total} milestones fulfilled</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">{Math.round((done / total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((done / total) * 100)}%`, backgroundColor: accentColor }}
                    />
                  </div>
                </div>
              ) : null
            })()}

            {milestones.map(m => {
              const overdue = !m.done && m.due_date && new Date(m.due_date + 'T12:00:00') < new Date(new Date().toDateString())
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      m.done ? 'border-transparent' : overdue ? 'border-rose-400' : 'border-slate-300 dark:border-white/20'
                    }`}
                    style={m.done ? { backgroundColor: accentColor } : {}}
                  >
                    {m.done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`flex-1 text-xs sm:text-sm ${m.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                    {m.title}
                  </span>
                  {m.due_date && (
                    <span className={`text-[11px] font-mono flex-shrink-0 ${overdue ? 'text-rose-500 font-medium' : m.done ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {new Date(m.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly Updates List */}
      <div className="max-w-3xl mx-auto px-6 pb-16 relative z-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Activity Logs & Broadcasts
        </h2>

        {!updates?.length ? (
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center backdrop-blur-md">
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-light">
              No project broadcasts have been published yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, i) => (
              <div
                key={update.id}
                className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden backdrop-blur-md shadow-xs dark:shadow-none"
              >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {getWeekOf(update.created_at)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-light">
                      Published {formatDate(update.sent_at!)}
                    </div>
                  </div>
                  {i === 0 && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
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
                <div className="px-6 py-5">
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

      {/* Approvals */}
      {!project.hide_approvals && approvals && approvals.filter(a => a.status === 'pending').length > 0 && (
        <div className="max-w-3xl mx-auto px-6 pb-8 relative z-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Awaiting Your Review
          </h2>
          <div className="space-y-3.5">
            {approvals.filter(a => a.status === 'pending').map(a => (
              <ApprovalCard key={a.id} approval={a} accentColor={accentColor} />
            ))}
          </div>
        </div>
      )}

      {/* Feedback Widget */}
      <div className="max-w-3xl mx-auto px-6 pb-8 border-t border-slate-200 dark:border-white/10 relative z-10 pt-4">
        <FeedbackWidget projectId={project.id} accentColor={accentColor} />
      </div>

      {/* Powered by with referral attribution */}
      <PoweredByReferral
        refHandle={owner?.username || owner?.id}
        isWhiteLabel={Boolean(orgData?.white_label || isPaidPlan(owner?.plan))}
      />

      {project.status === 'completed' && !hasTestimonial && (
        <CompletedProjectPopup
          projectId={project.id}
          projectName={project.project_name}
          accentColor={accentColor}
        />
      )}
    </div>
  )
}

