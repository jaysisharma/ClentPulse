import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import {
  Zap, Bell, Clock, Building2, Mail
} from 'lucide-react'
import Link from 'next/link'
import { CompletedProjectPopup } from '@/components/project/completed-project-popup'
import { PresenceBadge } from '@/components/project/presence-badge'
import { PortalRealtimeSubscriber } from './portal-realtime'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PasscodeGate } from './passcode-gate'
import { isPaidPlan } from '@/lib/plans'
import { PoweredByReferral } from '@/components/ui/powered-by-referral'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClientPortalView } from './client-portal-view'

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
    .select('id, name, email, username, logo_url, accent_color, plan')
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

  // Fetch all client-visible project invoices (deposit, sent, paid)
  const { data: projectInvoicesRaw } = await supabase
    .from('invoices')
    .select('id, invoice_number, amount, total, currency, status, due_date, paid_at, is_deposit, created_at')
    .eq('project_id', project.id)
    .in('status', ['sent', 'paid'])
    .order('created_at', { ascending: false })

  const projectInvoices = projectInvoicesRaw ?? []
  const depositInvoice = projectInvoices.find(i => i.is_deposit) ?? null
  const isDepositPending = Boolean(project.deposit_required && project.deposit_required > 0 && !project.deposit_paid)

  // Fetch integration resources for this project (portal-visible only)
  const { data: projectResources } = await supabase
    .from('project_resources')
    .select('*, integration_connections(status, provider_account_email)')
    .eq('project_id', project.id)
    .eq('show_in_portal', true)
    .order('created_at', { ascending: true })

  // Calculated Progress & Milestone metrics
  const totalMilestones = milestones?.length ?? 0
  const completedMilestones = (milestones ?? []).filter(m => m.done).length
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  // Find overall target completion date (furthest due_date amongst milestones)
  const milestoneDates = (milestones ?? [])
    .filter(m => m.due_date)
    .map(m => new Date(m.due_date + 'T12:00:00').getTime())
  const targetLaunchDate = milestoneDates.length > 0
    ? new Date(Math.max(...milestoneDates)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const contactEmail = owner?.email || null
  const leadSpecialistName = orgData?.name || owner?.name || 'Studio Specialist'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white relative selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 font-sans transition-colors duration-200">
      {/* Ambient background illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 blur-3xl opacity-30 dark:opacity-20 -z-10"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accentColor} 0%, transparent 80%)`,
        }}
      />

      {/* ── Sticky Top Navigation Header ─────────────────────────── */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Studio / Org Branding & Project Identifier */}
          <div className="flex items-center gap-3 min-w-0">
            {orgData?.logo_url ? (
              <img src={orgData.logo_url} alt={orgData.name} className="h-8 w-auto max-w-[120px] object-contain rounded" />
            ) : isPaidPlan(owner?.plan) && owner?.logo_url ? (
              <img src={owner.logo_url} alt="Logo" className="h-8 w-auto max-w-[120px] object-contain rounded" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {orgData ? <Building2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate flex items-center gap-1.5">
                <span className="truncate">{project.project_name}</span>
                {orgData && (
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    {orgData.name}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light truncate">
                Client: <span className="font-medium text-slate-700 dark:text-slate-300">{project.client_name}</span>
              </div>
            </div>
          </div>

          {/* Realtime sync & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <PortalRealtimeSubscriber
              projectId={project.id}
              clientName={project.client_name}
              accentColor={accentColor}
            />

            {/* Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-[11px] font-medium">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: project.status === 'active' ? '#22c55e' : '#94a3b8' }}
              />
              <span className="text-slate-600 dark:text-slate-300 capitalize text-xs">
                {project.status}
              </span>
            </div>

            {/* Quick Contact Specialist Button */}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Question on ${project.project_name}`)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs"
                title={`Contact ${leadSpecialistName}`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            )}

            {/* Subscribe Action */}
            <Link
              href={`/p/${project.slug}/subscribe`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              <span className="hidden xs:inline">Subscribe</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Container (Clean 2-column layout) ───────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-6 relative z-10">

        {/* ── Header Title Row ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-medium">
                Client Portal
              </span>
              {project.show_live_presence !== false && (
                <PresenceBadge
                  projectId={project.id}
                  initialHeartbeatAt={project.last_heartbeat_at ?? null}
                  initialFocusArea={project.active_focus_area ?? null}
                  mode="client"
                />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              {project.project_name}
            </h1>
          </div>

          {targetLaunchDate && (
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Target Launch</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white font-mono">{targetLaunchDate}</div>
            </div>
          )}
        </div>

        {/* ── 2-Column Feed + Sidebar View ─────────────────────────── */}
        <ClientPortalView
          project={project}
          updates={updates}
          milestones={milestones}
          checklistItems={checklistItems}
          approvals={approvals}
          projectResources={projectResources}
          projectInvoices={projectInvoices}
          teamMembers={teamMembers}
          allComments={allComments}
          owner={owner}
          orgData={orgData}
          accentColor={accentColor}
          hoursLabel={hoursLabel}
          totalHours={totalHours}
          totalMilestones={totalMilestones}
          completedMilestones={completedMilestones}
          progressPercent={progressPercent}
          targetLaunchDate={targetLaunchDate}
          contactEmail={contactEmail}
          leadSpecialistName={leadSpecialistName}
          isDepositPending={isDepositPending}
          depositInvoice={depositInvoice}
        />

        {/* ── Footer Referral Branding ─────────────────────────────── */}
        <PoweredByReferral
          refHandle={owner?.username || owner?.id}
          isWhiteLabel={Boolean(orgData?.white_label || isPaidPlan(owner?.plan))}
          className="pt-6 text-center"
        />

      </main>

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
