import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import {
  Zap, Bell, Clock, Building2, Mail, Sparkles, CheckCircle2
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
import { verifyPasscodeTicket, timingSafeCompare } from '@/lib/passcode-crypto'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  // Service role: the RPC returns the passcode, so it must never be callable by anon
  const { data: projectRows } = await createAdminClient()
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

  // Service role: the RPC returns the passcode, so it must never be callable by anon
  const { data: projectRows } = await createAdminClient()
    .rpc('get_project_by_slug', { p_slug: slug })

  const project = projectRows?.[0] ?? null
  if (!project) notFound()

  if (project.passcode) {
    const cookieStore = await cookies()
    const enteredPasscodeOrTicket = cookieStore.get(`client_project_passcode_${slug}`)?.value

    const isTicketValid = verifyPasscodeTicket(enteredPasscodeOrTicket, project.id, slug)
    const isLegacyPlaintextMatch =
      !isTicketValid &&
      enteredPasscodeOrTicket &&
      timingSafeCompare(enteredPasscodeOrTicket, project.passcode)

    if (!isTicketValid && !isLegacyPlaintextMatch) {
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

  // Fetch change orders for client review and approval
  const { data: changeOrders } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })

  // Fetch active app builds for this project
  const { data: appBuilds } = await supabase
    .from('app_builds')
    .select('*')
    .eq('project_id', project.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

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
    <div className="min-h-screen bg-[#07080d] text-white relative selection:bg-indigo-600 selection:text-white font-sans">
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
        changeOrders={(changeOrders as any[]) ?? []}
        appBuilds={(appBuilds as any[]) ?? []}
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

