import { createClient } from '@/lib/supabase/server'
import { checkAndSyncPromoPlan } from '@/lib/plans'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { ProductTour, TourTrigger } from '@/components/layout/product-tour'
import Link from 'next/link'
import {
  Plus, Timer, FolderOpen, DollarSign, Wallet,
  FileSignature, CheckCircle2, Send, ChevronRight, ArrowRight, Sparkles, FileText, Radio, ArrowUpRight
} from 'lucide-react'
import { UpgradeToast } from './upgrade-toast'
import { RemindSelfButton } from './remind-self-button'
import { DarkShell } from '@/components/layout/dark-shell'
import { Greeting } from '@/components/dashboard/greeting'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { cn } from '@/lib/utils'
import { ACTIVE_WORKSPACE_COOKIE, parseActiveWorkspaceId } from '@/lib/workspace'
import { AgencyExecutiveRadar } from '@/components/dashboard/agency-executive-radar'

function localWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function localLastWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) - 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function localMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function localLastMonthStart() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtHours(h: number) {
  const totalSecs = Math.round(h * 3600)
  const hrs  = Math.floor(totalSecs / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const parts: string[] = []
  if (hrs  > 0) parts.push(`${hrs}h`)
  if (mins > 0) parts.push(`${mins}m`)
  if (parts.length === 0 && totalSecs > 0) {
    return `${totalSecs}s`
  }
  if (parts.length === 0) parts.push('0m')
  return parts.join(' ')
}

function dueLabel(due: string | null): { text: string; overdue: boolean } | null {
  if (!due) return { text: 'No due date', overdue: false }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(due); d.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (days < 0)  return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: true }
  if (days === 1) return { text: 'Due tomorrow', overdue: false }
  return { text: `Due in ${days} days`, overdue: false }
}

function OveradsKpiCard({
  label,
  value,
  icon: Icon,
  caption,
  trend,
  tone,
}: {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  caption?: React.ReactNode
  trend?: { dir: 'up' | 'down' | 'flat'; label: string }
  tone?: 'default' | 'danger'
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 shadow-xs dark:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`mt-3 text-2xl sm:text-3xl font-light font-mono tracking-tight tabular-nums ${tone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold font-mono ${
            trend.dir === 'up' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
            trend.dir === 'down' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
          }`}>
            {trend.dir === 'up' ? '↑' : trend.dir === 'down' ? '↓' : '•'} {trend.label}
          </span>
        )}
        <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{caption}</span>
      </div>
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ agency?: string; freelancer?: string; upgraded?: string }>
}) {
  const params = searchParams ? await searchParams : {}
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const cookieStore = await cookies()
  const rawCookie = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value
  let activeWorkspaceId = parseActiveWorkspaceId(rawCookie)

  // 1. If explicit query parameter is passed or if no cookie is set yet, check user organizations
  if (params.freelancer === 'true') {
    activeWorkspaceId = 'personal'
  } else if (params.agency === 'true' || !rawCookie) {
    // Check if user has an agency organization
    const { data: userMemberships } = await supabase
      .from('organization_members')
      .select('org_id, role')
      .eq('user_id', user.id)

    if (userMemberships && userMemberships.length > 0) {
      // Find owned/admin agency or first membership
      const primary = userMemberships.find(m => m.role === 'owner' || m.role === 'admin') || userMemberships[0]
      if (primary?.org_id) {
        activeWorkspaceId = primary.org_id
      }
    }
  }

  if (activeWorkspaceId !== 'personal') {
    const [
      { data: org },
      { data: membership },
      { data: projects },
      { data: orgMembers },
    ] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', activeWorkspaceId).single(),
      supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', activeWorkspaceId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('projects')
        .select(`
          id, project_name, client_name, client_email, color, status, budget,
          deposit_required, deposit_paid, waiting_on_client, waiting_reason, created_at, slug,
          updates(id, sent_at, review_status, created_at),
          invoices(id, invoice_number, status, items, due_date, currency, created_at),
          project_team_members(id, user_id, role_title, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area))
        `)
        .eq('org_id', activeWorkspaceId)
        .order('created_at', { ascending: false }),
      supabase
        .from('organization_members')
        .select('id, role, user_id, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area)')
        .eq('org_id', activeWorkspaceId),
    ])

    if (membership && org) {
      const allProjects = projects ?? []
      const allMembers = orgMembers ?? []
      const projectIds = allProjects.map(p => p.id)
      const weekStart = localWeekStart()
      const cutoff7d = new Date(); cutoff7d.setDate(cutoff7d.getDate() - 7)

      let timeEntries: any[] = []
      if (projectIds.length > 0) {
        const { data: tData } = await supabase
          .from('time_entries')
          .select('project_id, user_id, hours, date')
          .in('project_id', projectIds)
          .gte('date', weekStart)
        timeEntries = tData ?? []
      }

      const activeProjects = allProjects.filter(p => p.status === 'active')
      const completedProjects = allProjects.filter(p => p.status === 'completed')
      const uniqueClients = new Set(allProjects.map(p => p.client_name.trim().toLowerCase())).size
      const totalContractedBudget = activeProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)

      const atRiskList = activeProjects
        .map(project => {
          const updates = (project.updates ?? [])
            .filter((u: any) => u.sent_at)
            .sort((a: any, b: any) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())
          const lastSentAt = updates[0]?.sent_at ?? null
          const lastActivityDate = lastSentAt ? new Date(lastSentAt) : new Date(project.created_at)
          const daysSinceLastUpdate = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
          const isOverdue = lastActivityDate < cutoff7d
          const pendingReviews = (project.updates ?? []).filter((u: any) => u.review_status === 'review_ready').length
          const isBlocked = Boolean(project.waiting_on_client)

          let riskSeverity: 'high' | 'medium' | 'low' = 'low'
          let riskType: 'overdue_update' | 'blocked_on_client' | 'pending_review' | 'healthy' = 'healthy'

          if (isOverdue && daysSinceLastUpdate > 14) {
            riskSeverity = 'high'; riskType = 'overdue_update'
          } else if (isOverdue) {
            riskSeverity = 'medium'; riskType = 'overdue_update'
          } else if (isBlocked) {
            riskSeverity = 'medium'; riskType = 'blocked_on_client'
          } else if (pendingReviews > 0) {
            riskSeverity = 'medium'; riskType = 'pending_review'
          }

          return {
            projectId: project.id,
            projectName: project.project_name,
            clientName: project.client_name,
            clientEmail: project.client_email,
            color: project.color,
            slug: project.slug,
            daysSinceLastUpdate,
            lastSentAt,
            isOverdue,
            isBlocked,
            waitingReason: project.waiting_reason,
            pendingReviews,
            riskSeverity,
            riskType,
          }
        })
        .filter(item => item.riskType !== 'healthy')

      const blockedItems: any[] = []
      let totalBlockedCash = 0

      for (const project of activeProjects) {
        if (project.deposit_required && !project.deposit_paid) {
          const amount = Number(project.deposit_required) || 0
          totalBlockedCash += amount
          blockedItems.push({
            id: `deposit-${project.id}`,
            type: 'deposit' as const,
            projectId: project.id,
            projectName: project.project_name,
            clientName: project.client_name,
            clientEmail: project.client_email,
            amount,
            currency: (project.invoices?.[0] as any)?.currency || 'USD',
            reason: 'Kickoff deposit awaiting client payment',
          })
        }
        for (const inv of (project.invoices ?? []) as any[]) {
          if (inv.status === 'sent') {
            const invAmount = (inv.items ?? []).reduce((sum: number, it: any) => sum + (it.amount ?? 0), 0)
            const isPastDue = inv.due_date && new Date(inv.due_date) < new Date()
            if (project.waiting_on_client || isPastDue) {
              totalBlockedCash += invAmount
              blockedItems.push({
                id: `inv-${inv.id}`,
                type: 'invoice' as const,
                projectId: project.id,
                projectName: project.project_name,
                clientName: project.client_name,
                clientEmail: project.client_email,
                amount: invAmount,
                currency: inv.currency || 'USD',
                reason: isPastDue ? 'Past due invoice' : `Blocked: ${project.waiting_reason || 'Awaiting client'}`,
              })
            }
          }
        }
      }

      const teamWorkload = allMembers.map((m: any) => {
        const usr = Array.isArray(m.user) ? m.user[0] : m.user
        const assignedProjects = activeProjects
          .filter(p => (p.project_team_members ?? []).some((s: any) => s.user_id === m.user_id))
          .map(p => ({
            id: p.id,
            projectName: p.project_name,
            color: p.color,
            roleTitle: (p.project_team_members ?? []).find((s: any) => s.user_id === m.user_id)?.role_title || 'Specialist',
          }))

        const hoursThisWeek = timeEntries
          .filter((t: any) => t.user_id === m.user_id)
          .reduce((s, t) => s + (Number(t.hours) || 0), 0)

        const assignedCount = assignedProjects.length
        let capacityStatus: 'available' | 'balanced' | 'overloaded' = 'available'
        if (assignedCount >= 4 || hoursThisWeek >= 35) capacityStatus = 'overloaded'
        else if (assignedCount >= 2 || hoursThisWeek >= 15) capacityStatus = 'balanced'

        return {
          memberId: m.id,
          userId: m.user_id,
          role: m.role,
          name: usr?.name || usr?.email?.split('@')[0] || 'Team Member',
          email: usr?.email || '',
          logoUrl: usr?.logo_url || null,
          lastHeartbeatAt: usr?.last_heartbeat_at || null,
          activeFocusArea: usr?.active_focus_area || null,
          assignedProjects,
          assignedProjectCount: assignedCount,
          hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
          capacityStatus,
        }
      })

      const radarData = {
        organization: org,
        portfolio: {
          totalProjects: allProjects.length,
          activeProjects: activeProjects.length,
          completedProjects: completedProjects.length,
          uniqueClients,
          totalContractedBudget,
          totalHoursThisWeek: timeEntries.reduce((s, t) => s + (Number(t.hours) || 0), 0),
        },
        atRisk: {
          count: atRiskList.length,
          items: atRiskList,
        },
        blockedCash: {
          totalBlockedCash,
          count: blockedItems.length,
          items: blockedItems,
        },
        teamWorkload,
      }

      return (
        <AppLayout>
          <DarkShell>
            <div className="relative z-10 pb-16 pt-2">
              <AgencyExecutiveRadar data={radarData} />
            </div>
          </DarkShell>
        </AppLayout>
      )
    }
  }

  const weekStart      = localWeekStart()
  const lastWeekStart  = localLastWeekStart()
  const monthStart     = localMonthStart()
  const lastMonthStart = localLastMonthStart()
  const cutoff7d       = sevenDaysAgo()

  const [
    projectsRes,
    profileRes,
    invoicesRes,
    timeRes,
    lastWeekRes,
    expensesRes,
    timerRes,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, project_name, client_name, color, status, created_at, updates(id, sent_at), approvals(id, title, status), contracts(id, title, signed_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('users').select('id, name, plan, promo_pro, created_at').eq('id', user.id).single(),
    supabase.from('invoices').select('id, invoice_number, client_name, status, items, due_date, created_at, paid_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', lastWeekStart).lt('date', weekStart),
    supabase.from('expenses').select('date, amount').eq('user_id', user.id),
    supabase.from('timers').select('description, project_id, started_at').eq('user_id', user.id).maybeSingle(),
  ])

  const criticalError = projectsRes.error || invoicesRes.error || expensesRes.error
  if (criticalError) throw new Error(`Failed to load dashboard data: ${criticalError.message}`)

  const projects          = projectsRes.data
  const profile           = profileRes.data
  const plan              = await checkAndSyncPromoPlan(profile, supabase)
  const invoices          = invoicesRes.data
  const timeEntries       = timeRes.data
  const lastWeekEntries   = lastWeekRes.data
  const expenses          = expensesRes.data

  type Update   = { id: string; sent_at: string | null }
  type Approval = { id: string; title: string; status: string }
  type Contract = { id: string; title: string; signed_at: string | null }
  type Project  = { id: string; project_name: string; client_name: string; color: string; status: string; created_at: string; updates: Update[]; approvals: Approval[]; contracts: Contract[] }
  type Invoice  = { id: string; invoice_number: string; client_name: string; status: string; items: { amount: number }[]; due_date: string | null; created_at: string; paid_at: string | null }
  type Expense  = { date: string; amount: string }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = (invoices ?? []) as Invoice[]
  const allExpenses = (expenses ?? []) as Expense[]

  const runningTimer = timerRes.data as { description: string | null; project_id: string | null; started_at: string } | null
  const timerProject = runningTimer?.project_id ? allProjects.find(p => p.id === runningTimer.project_id) : null
  const isFree = plan !== 'pro'

  const sumItems = (inv: { items: { amount: number }[] }[]) =>
    inv.flatMap(i => i.items ?? []).reduce((s, item) => s + (item.amount ?? 0), 0)

  // ── Box 1 · You're owed ────────────────────────────────────────────────
  const unpaidInvoices = allInvoices.filter(i => i.status === 'sent')
  const owedAmount     = sumItems(unpaidInvoices)
  const overdueCount   = unpaidInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date()).length

  const upcomingInvoices = [...unpaidInvoices]
    .sort((a, b) => (a.due_date ? new Date(a.due_date).getTime() : Infinity) - (b.due_date ? new Date(b.due_date).getTime() : Infinity))
    .slice(0, 5)

  // ── Box 2 · You made ───────────────────────────────────────────────────
  const expenseInMonth = (start: string, end?: string) =>
    allExpenses
      .filter(e => e.date >= start && (!end || e.date < end))
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

  const getPaidDate = (i: Invoice) => {
    const d = new Date(i.paid_at || i.created_at)
    return d.toISOString().split('T')[0]
  }

  const earningsThisMonth = sumItems(
    allInvoices.filter(i => i.status === 'paid' && getPaidDate(i) >= monthStart)
  )
  const earningsLastMonth = sumItems(
    allInvoices.filter(i => {
      if (i.status !== 'paid') return false
      const paidDate = getPaidDate(i)
      return paidDate >= lastMonthStart && paidDate < monthStart
    })
  )
  const netThisMonth = earningsThisMonth - expenseInMonth(monthStart)
  const netLastMonth = earningsLastMonth - expenseInMonth(lastMonthStart, monthStart)
  const netDiff = netThisMonth - netLastMonth

  // ── Box 3 · You worked ─────────────────────────────────────────────────
  const hoursThisWeek = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursLastWeek = (lastWeekEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const hoursDiff     = hoursThisWeek - hoursLastWeek

  // ── Box 4 · Your projects ──────────────────────────────────────────────
  const activeProjects = allProjects.filter(p => p.status === 'active')
  const isNewUser = allProjects.length === 0 && allInvoices.length === 0 && allExpenses.length === 0

  // ── Needs attention ────────────────────────────────────────────────────
  const overdueProjects = activeProjects.filter(p => {
    const sent = p.updates.filter(u => u.sent_at)
    if (!sent.length) return new Date(p.created_at) < new Date(cutoff7d)
    const latest = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    return new Date(latest.sent_at!) < new Date(cutoff7d)
  })
  const pendingApprovals = allProjects.flatMap(p =>
    p.approvals.filter(a => a.status === 'pending').map(a => ({ ...a, projectId: p.id, projectName: p.project_name }))
  )
  const unsignedContracts = allProjects.flatMap(p =>
    p.contracts.filter(c => !c.signed_at).map(c => ({ ...c, projectId: p.id, projectName: p.project_name }))
  )
  const attentionCount = overdueProjects.length + pendingApprovals.length + unsignedContracts.length

  // ── Greeting ───────────────────────────────────────────────────────────
  const firstName = profile?.name ? profile.name.split(' ')[0] : ''
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : ''
  const emailLocal = (user.email?.split('@')[0] ?? '').toLowerCase()
  const looksAutoName = !!displayName && (/\d/.test(displayName) || displayName.toLowerCase() === emailLocal)
  const greetName = looksAutoName ? '' : displayName

  // ── Chart data ─────────────────────────────────────────────────────────
  const paidPoints = allInvoices
    .filter(i => i.status === 'paid')
    .map(i => ({
      date: (i.paid_at ? new Date(i.paid_at) : new Date(i.created_at)).toISOString().split('T')[0],
      amount: sumItems([i]),
    }))
  const expensePoints = allExpenses.map(e => ({
    date: new Date(e.date).toISOString().split('T')[0],
    amount: parseFloat(e.amount) || 0,
  }))

  return (
    <AppLayout user={profile ? { name: profile.name ?? null, plan: plan as 'free' | 'pro' } : undefined}>
      <DarkShell>
        <div className="relative z-10 space-y-7 pb-10">
          <UpgradeToast />

          {/* ── Overads Header ───────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-white">
                <Greeting name={greetName} />
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                <span>{activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</span>
                <span className="text-slate-600">·</span>
                <span className={attentionCount > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                  {attentionCount > 0 ? `${attentionCount} item${attentionCount !== 1 ? 's' : ''} need attention` : 'all projects on track'}
                </span>
              </p>
              <TourTrigger />
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/time" data-tour-time-btn="">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs dark:shadow-none"
                >
                  <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Log time
                </button>
              </Link>
              <Link href="/project/new" data-tour-project-btn="">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-semibold dark:hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New project
                </button>
              </Link>
            </div>
          </div>

          {/* ── Editor Extension Live Status Strip ───────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs dark:shadow-sm ring-1 ring-slate-950/5 dark:ring-white/5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-900 dark:text-slate-200 font-medium">Editor Extension Sync</span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Streaming active coding status directly from your editor</span>
            </div>
            <Link href="/settings" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors font-medium flex items-center gap-1 text-[11px] self-start sm:self-auto">
              Extension Tokens <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isNewUser ? (
            /* ── New-user setup state ─────────────────────────────────── */
            <div className="rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-16 px-6 flex flex-col items-center text-center shadow-md dark:shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight mt-5">Let&apos;s set up your workspace</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Create your first project to start tracking time, broadcasting live presence, and sending client updates.
              </p>
              <Link href="/project/new" className="mt-6">
                <button type="button" className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-xs font-semibold dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Create your first project
                </button>
              </Link>
              <Link href="/clients" className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1">
                or add a client first <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <>
              {/* Contextual Onboarding Guidance (Progressive next action) */}
              {activeProjects.length > 0 && (() => {
                const totalUpdates = activeProjects.reduce((acc, p) => acc + (p.updates?.length || 0), 0)
                const firstProj = activeProjects[0]
                if (totalUpdates === 0) {
                  return (
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-white">Next: Publish an update on {firstProj.project_name}.</span>
                          <span className="text-slate-400 ml-1.5 hidden sm:inline">Show your client that work has officially kicked off.</span>
                        </div>
                      </div>
                      <Link
                        href={`/project/${firstProj.id}/update`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-semibold px-3.5 py-1.5 text-xs hover:bg-slate-100 transition-colors shadow-xs flex-shrink-0 self-start sm:self-auto"
                      >
                        <span>Send update</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )
                }
                return null
              })()}

              {/* ── 4 Overads KPI number boxes ─────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <OveradsKpiCard
                  label="Outstanding"
                  value={fmt$(owedAmount)}
                  icon={DollarSign}
                  tone={overdueCount > 0 ? 'danger' : 'default'}
                  caption={
                    owedAmount > 0
                      ? overdueCount > 0
                        ? `${overdueCount} overdue`
                        : 'awaiting payment'
                      : 'all paid up'
                  }
                />
                <OveradsKpiCard
                  label="This month"
                  value={fmt$(netThisMonth)}
                  icon={Wallet}
                  trend={
                    netThisMonth !== 0 || netLastMonth !== 0
                      ? { dir: netDiff > 0 ? 'up' : netDiff < 0 ? 'down' : 'flat', label: fmt$(Math.abs(netDiff)) }
                      : undefined
                  }
                  caption={netDiff > 0 ? 'more than last month' : netDiff < 0 ? 'less than last month' : 'vs last month'}
                />
                <OveradsKpiCard
                  label="Hours this week"
                  value={fmtHours(hoursThisWeek)}
                  icon={Timer}
                  trend={
                    hoursThisWeek > 0 || hoursLastWeek > 0
                      ? { dir: hoursDiff > 0 ? 'up' : hoursDiff < 0 ? 'down' : 'flat', label: fmtHours(Math.abs(hoursDiff)) }
                      : undefined
                  }
                  caption={hoursDiff > 0 ? 'more than last week' : hoursDiff < 0 ? 'less than last week' : 'vs last week'}
                />
                <OveradsKpiCard
                  label="Active projects"
                  value={activeProjects.length}
                  icon={FolderOpen}
                  caption={`of ${allProjects.length} total projects`}
                />
              </div>

              {/* ── Two-column workspace ─────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Left column (wider): chart + needs attention */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ── Cash Flow Chart ────────────────────────────────────── */}
                  <RevenueChart paid={paidPoints} expenses={expensePoints} />

                  {/* ── Needs attention to-do list ─────────────────────────── */}
                  {attentionCount > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-400">Needs attention</h2>
                        <span className="text-[11px] text-slate-400">{attentionCount} action required</span>
                      </div>

                      <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs dark:shadow-sm">
                        {overdueProjects.map(p => (
                          <div key={`u-${p.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                              <Send className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{p.project_name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">No update sent in over a week · {p.client_name}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <RemindSelfButton projectId={p.id} />
                              <Link href={`/project/${p.id}/update`}>
                                <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-medium transition-colors cursor-pointer">
                                  Send update
                                </button>
                              </Link>
                            </div>
                          </div>
                        ))}

                        {pendingApprovals.map(a => (
                          <div key={`a-${a.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{a.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Waiting on client approval · {a.projectName}</p>
                            </div>
                            <Link href={`/project/${a.projectId}`} className="flex-shrink-0">
                              <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/10 transition-colors cursor-pointer">
                                Follow up
                              </button>
                            </Link>
                          </div>
                        ))}

                        {unsignedContracts.map(c => (
                          <div key={`c-${c.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                              <FileSignature className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Contract not signed yet · {c.projectName}</p>
                            </div>
                            <Link href={`/project/${c.projectId}/contract`} className="flex-shrink-0">
                              <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-medium transition-colors cursor-pointer">
                                Review &amp; sign
                              </button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right column: timer + invoices + projects */}
                <div className="space-y-6 lg:sticky lg:top-8">

                  {/* ── Active timer / Workstation Card ───────────────────── */}
                  {runningTimer ? (
                    <Link href="/time" className="block rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-4 space-y-3 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs dark:shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timer running</span>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">View →</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{runningTimer.description || 'Untitled task'}</div>
                      {timerProject && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: timerProject.color }} />
                          <span className="truncate">{timerProject.project_name}</span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <Link href="/time" className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 px-4 py-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs dark:shadow-sm group">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Timer className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">Start a timer</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Track billable hours manually</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-shrink-0" />
                    </Link>
                  )}

                  {/* ── Unpaid Invoices ──────────────────────────────────── */}
                  {upcomingInvoices.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unpaid Invoices</h2>
                        <Link href="/invoices" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-0.5">
                          View all <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs dark:shadow-sm">
                        {upcomingInvoices.map(inv => {
                          const due = dueLabel(inv.due_date)
                          return (
                            <Link
                              key={inv.id}
                              href={`/invoices/${inv.id}`}
                              className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                            >
                              <span className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                due?.overdue ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400',
                              )}>
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{inv.client_name}</p>
                                <p className={cn('text-[11px] truncate', due?.overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-500 dark:text-slate-400')}>
                                  {inv.invoice_number} · {due?.text}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono tabular-nums flex-shrink-0">{fmt$(sumItems([inv]))}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  {/* ── New Invoice Shortcut ─────────────────────────────── */}
                  <Link href="/invoices/new" className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 px-4 py-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs dark:shadow-sm group">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Create new invoice</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Bill client with Stripe Checkout</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors ml-auto flex-shrink-0" />
                  </Link>

                  {/* ── Projects list ────────────────────────────────────── */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Active Projects</h2>
                      <Link href="/project" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-0.5">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {activeProjects.length === 0 ? (
                      <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-8 px-5 flex flex-col items-center text-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active projects</p>
                        <Link href="/project/new" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-1 mt-1">
                          <Plus className="w-3 h-3" /> Start a project
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-xs dark:shadow-sm">
                        {activeProjects.slice(0, 5).map(p => (
                          <Link
                            key={p.id}
                            href={`/project/${p.id}`}
                            className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                          >
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{p.project_name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.client_name}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>

                </div>

              </div>

              {/* ── Upgrade Banner (Free tier) ─────────────────────────── */}
              {isFree && (
                <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0c0d14] to-indigo-950/40 border border-indigo-500/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div>
                    <div className="text-xs font-semibold text-white uppercase tracking-wider">Frevio Pro</div>
                    <div className="text-sm font-medium text-slate-200 mt-0.5">Unlock unlimited projects, automatic client notifications & white-label portals.</div>
                  </div>
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-4 py-2 rounded-full transition-all hover:scale-[1.02] shadow-sm self-start sm:self-auto"
                  >
                    Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </DarkShell>
      <ProductTour userId={user.id} isAgency={activeWorkspaceId !== 'personal'} />
    </AppLayout>
  )
}
