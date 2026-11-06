import { createClient } from '@/lib/supabase/server'
import { checkAndSyncPromoPlan, isPaidPlan } from '@/lib/plans'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { AppLayout } from '@/components/layout/app-layout'
import { ProductTour, TourTrigger } from '@/components/layout/product-tour'
import Link from 'next/link'
import {
  Plus, Timer, FolderOpen, DollarSign, Wallet,
  FileSignature, CheckCircle2, Send, ChevronRight, ArrowRight, Sparkles, FileText, ArrowUpRight
} from 'lucide-react'
import { UpgradeToast } from './upgrade-toast'
import { RemindSelfButton } from './remind-self-button'
import { DarkShell } from '@/components/layout/dark-shell'
import { Greeting } from '@/components/dashboard/greeting'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { cn } from '@/lib/utils'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { CARD, CARD_TITLE, CARD_LINK, ROW, TONES } from '@/components/dashboard/styles'
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

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Local dates of the last `n` days (oldest first), for the hours sparkline
function lastDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return localDate(d)
  })
}

// Monday starts of the last `n` weeks (oldest first), for weekly sparklines
function lastWeekStarts(n: number) {
  const monday = new Date(localWeekStart() + 'T00:00:00')
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() - 7 * (n - 1 - i))
    return localDate(d)
  })
}

// Sum amounts into the week each date falls in
function bucketByWeek(weeks: string[], points: { date: string; amount: number }[]) {
  return weeks.map((w, i) => {
    const next = weeks[i + 1]
    return points
      .filter(p => p.date >= w && (!next || p.date < next))
      .reduce((s, p) => s + p.amount, 0)
  })
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
    tokenCountRes,
    recentTimeRes,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, project_name, client_name, color, status, created_at, updates(id, sent_at), approvals(id, title, status), contracts(id, title, signed_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('users').select('id, name, plan, promo_pro, created_at').eq('id', user.id).single(),
    supabase.from('invoices').select('id, invoice_number, client_name, status, items, due_date, created_at, paid_at, tax_rate').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', weekStart),
    supabase.from('time_entries').select('hours').eq('user_id', user.id).gte('date', lastWeekStart).lt('date', weekStart),
    supabase.from('expenses').select('date, amount').eq('user_id', user.id),
    supabase.from('timers').select('description, project_id, started_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('api_tokens').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('time_entries').select('hours, date').eq('user_id', user.id).gte('date', lastDays(7)[0]),
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
  type InvoiceItem = { amount?: number; quantity?: number; rate?: number }
  type Invoice  = { id: string; invoice_number: string; client_name: string; status: string; items: InvoiceItem[]; tax_rate?: number | null; due_date: string | null; created_at: string; paid_at: string | null }
  type Expense  = { date: string; amount: string }

  const allProjects = (projects ?? []) as Project[]
  const allInvoices = (invoices ?? []) as Invoice[]
  const allExpenses = (expenses ?? []) as Expense[]

  const runningTimer = timerRes.data as { description: string | null; project_id: string | null; started_at: string } | null
  const timerProject = runningTimer?.project_id ? allProjects.find(p => p.id === runningTimer.project_id) : null
  const isFree = !isPaidPlan(plan)
  const hasExtensionToken = (tokenCountRes.count ?? 0) > 0

  const calcInvoiceTotal = (inv: Invoice): number => {
    const items = Array.isArray(inv.items) ? inv.items : []
    const subtotal = items.reduce((s, it) => {
      if (typeof it.amount === 'number') return s + it.amount
      const qty = Number(it.quantity ?? 1)
      const rate = Number(it.rate ?? 0)
      return s + (qty * rate)
    }, 0)
    const taxRate = Number(inv.tax_rate ?? 0)
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
    return subtotal + taxAmount
  }

  const sumInvoices = (list: Invoice[]): number =>
    list.reduce((sum, inv) => sum + calcInvoiceTotal(inv), 0)

  // ── Box 1 · You're owed ────────────────────────────────────────────────
  const unpaidInvoices = allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const owedAmount     = sumInvoices(unpaidInvoices)
  const overdueCount   = unpaidInvoices.filter(i => i.status === 'overdue' || (i.due_date && new Date(i.due_date) < new Date())).length

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

  const earningsThisMonth = sumInvoices(
    allInvoices.filter(i => i.status === 'paid' && getPaidDate(i) >= monthStart)
  )
  const earningsLastMonth = sumInvoices(
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
  // Only evaluate active projects (never closed/archived projects)
  const overdueProjects = activeProjects.filter(p => {
    const sent = (p.updates ?? []).filter(u => u.sent_at)
    if (!sent.length) return new Date(p.created_at) < new Date(cutoff7d)
    const latest = [...sent].sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
    return new Date(latest.sent_at!) < new Date(cutoff7d)
  })
  const pendingApprovals = activeProjects.flatMap(p =>
    (p.approvals ?? []).filter(a => a.status === 'pending').map(a => ({ ...a, projectId: p.id, projectName: p.project_name }))
  )
  const unsignedContracts = activeProjects.flatMap(p =>
    (p.contracts ?? []).filter(c => !c.signed_at).map(c => ({ ...c, projectId: p.id, projectName: p.project_name }))
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
      amount: calcInvoiceTotal(i),
    }))
  const expensePoints = allExpenses.map(e => ({
    date: new Date(e.date).toISOString().split('T')[0],
    amount: parseFloat(e.amount) || 0,
  }))

  // ── Unified Chronological Workspace Activity Feed ───────────────────────
  type ActivityItem = {
    id: string
    type: 'update' | 'invoice_paid' | 'invoice_sent' | 'contract_signed' | 'project_created'
    title: string
    client: string
    date: string
    href: string
    amount?: number
  }

  const activityFeed: ActivityItem[] = [
    // Project updates sent
    ...allProjects.flatMap(p =>
      (p.updates ?? [])
        .filter(u => u.sent_at)
        .map(u => ({
          id: `u-${u.id}`,
          type: 'update' as const,
          title: `Update sent · ${p.project_name}`,
          client: p.client_name,
          date: u.sent_at!,
          href: `/project/${p.id}`,
        }))
    ),
    // Payments received
    ...allInvoices
      .filter(i => i.status === 'paid')
      .map(i => ({
        id: `inv-paid-${i.id}`,
        type: 'invoice_paid' as const,
        title: `Payment received · ${i.invoice_number}`,
        client: i.client_name,
        date: i.paid_at || i.created_at,
        href: `/invoices/${i.id}`,
        amount: calcInvoiceTotal(i),
      })),
    // Invoices issued
    ...allInvoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .map(i => ({
        id: `inv-sent-${i.id}`,
        type: 'invoice_sent' as const,
        title: `Invoice issued · ${i.invoice_number}`,
        client: i.client_name,
        date: i.created_at,
        href: `/invoices/${i.id}`,
        amount: calcInvoiceTotal(i),
      })),
    // Contracts signed
    ...allProjects.flatMap(p =>
      (p.contracts ?? [])
        .filter(c => c.signed_at)
        .map(c => ({
          id: `c-${c.id}`,
          type: 'contract_signed' as const,
          title: `Contract signed · ${c.title}`,
          client: `${p.client_name} (${p.project_name})`,
          date: c.signed_at!,
          href: `/project/${p.id}`,
        }))
    ),
    // Projects created
    ...allProjects.map(p => ({
      id: `p-${p.id}`,
      type: 'project_created' as const,
      title: `Project created · ${p.project_name}`,
      client: p.client_name,
      date: p.created_at,
      href: `/project/${p.id}`,
    })),
  ]
    .filter(item => item.date && !isNaN(new Date(item.date).getTime()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  // ── KPI sparklines ─────────────────────────────────────────────────────
  const weeks = lastWeekStarts(8)
  const recentTime = (recentTimeRes.data ?? []) as { hours: number | null; date: string }[]
  const sparkInvoiced = bucketByWeek(weeks, allInvoices.map(i => ({ date: localDate(new Date(i.created_at)), amount: calcInvoiceTotal(i) })))
  const sparkPaid = bucketByWeek(weeks, paidPoints)
  const sparkHours = lastDays(7).map(d => recentTime.filter(t => t.date === d).reduce((s, t) => s + (t.hours ?? 0), 0))
  const sparkProjects = weeks.map((_, i) => {
    const next = weeks[i + 1]
    return allProjects.filter(p => !next || localDate(new Date(p.created_at)) < next).length
  })

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <AppLayout user={profile ? { name: profile.name ?? null, plan: plan as 'free' | 'pro' } : undefined}>
      <DarkShell>
        <div className="relative z-10 space-y-6 pb-10 max-w-[1550px] mx-auto">
          <UpgradeToast />

          {/* ── Greeting ─────────────────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[27px] font-extrabold text-slate-900 dark:text-white tracking-[-0.02em]">
                <Greeting name={greetName} />
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{today}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span>{activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className={attentionCount > 0 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                  {attentionCount > 0 ? `${attentionCount} item${attentionCount !== 1 ? 's' : ''} need attention` : 'all projects on track'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <TourTrigger />
              <Link
                href="/time"
                data-tour-time-btn=""
                className="inline-flex items-center gap-2 rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Log time
              </Link>
              <Link
                href="/project/new"
                data-tour-project-btn=""
                className="inline-flex items-center gap-1.5 rounded-md bg-accent hover:bg-accent-hover text-white px-3.5 py-2 text-xs font-semibold shadow-sm shadow-accent/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New project
              </Link>
            </div>
          </div>

          {/* ── Editor extension status (only once a token exists) ────── */}
          {hasExtensionToken && (
            <div className={cn(CARD, 'px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs')}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">Editor extension connected</span>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">·</span>
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline truncate">Your coding status streams to client portals</span>
              </div>
              <Link href="/settings" className={cn(CARD_LINK, 'self-start sm:self-auto flex-shrink-0')}>
                Extension tokens <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {isNewUser ? (
            /* ── New-user setup state ─────────────────────────────────── */
            <div className={cn(CARD, 'py-16 px-6 flex flex-col items-center text-center')}>
              <div className={cn('w-12 h-12 rounded-md border flex items-center justify-center', TONES.indigo.tile)}>
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-5">Let&apos;s set up your workspace</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Create your first project to start tracking time, broadcasting live presence, and sending client updates.
              </p>
              <Link
                href="/project/new"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent hover:bg-accent-hover text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-accent/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </Link>
              <Link href="/clients" className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1">
                or add a client first <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <>
              {/* ── KPI cards ──────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  id="owed"
                  label="Outstanding"
                  value={fmt$(owedAmount)}
                  icon={DollarSign}
                  tone={overdueCount > 0 ? 'rose' : 'amber'}
                  href="/invoices"
                  badge={owedAmount > 0 ? (overdueCount > 0 ? `${overdueCount} overdue` : `${unpaidInvoices.length} awaiting payment`) : 'All paid up'}
                  badgeTone={owedAmount > 0 ? (overdueCount > 0 ? 'rose' : 'amber') : 'emerald'}
                  spark={sparkInvoiced}
                />
                <KpiCard
                  id="month"
                  label="Net this month"
                  value={fmt$(netThisMonth)}
                  icon={Wallet}
                  tone="emerald"
                  href="/earnings"
                  badge={
                    netThisMonth !== 0 || netLastMonth !== 0
                      ? `${netDiff > 0 ? '↑' : netDiff < 0 ? '↓' : '•'} ${fmt$(Math.abs(netDiff))} vs last month`
                      : 'No payments yet'
                  }
                  badgeTone={netDiff > 0 ? 'emerald' : netDiff < 0 ? 'rose' : 'slate'}
                  spark={sparkPaid}
                />
                <KpiCard
                  id="hours"
                  label="Hours this week"
                  value={fmtHours(hoursThisWeek)}
                  icon={Timer}
                  tone="sky"
                  href="/time"
                  badge={
                    hoursThisWeek > 0 || hoursLastWeek > 0
                      ? `${hoursDiff > 0 ? '↑' : hoursDiff < 0 ? '↓' : '•'} ${fmtHours(Math.abs(hoursDiff))} vs last week`
                      : 'Nothing logged yet'
                  }
                  badgeTone={hoursDiff > 0 ? 'emerald' : hoursDiff < 0 ? 'rose' : 'slate'}
                  spark={sparkHours}
                />
                <KpiCard
                  id="projects"
                  label="Active projects"
                  value={activeProjects.length}
                  icon={FolderOpen}
                  tone="indigo"
                  href="/project"
                  badge={`of ${allProjects.length} total`}
                  badgeTone="slate"
                  spark={sparkProjects}
                />
              </div>

              {/* ── Two-column workspace ─────────────────────────────────── */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* Left column: needs attention + cash flow */}
                <div className="xl:col-span-8 space-y-6 min-w-0 w-full">
                  {attentionCount > 0 && (
                    <section className={cn(CARD, 'overflow-hidden')}>
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <div className="flex items-center gap-2">
                          <h2 className={CARD_TITLE}>Needs attention</h2>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', TONES.amber.pill)}>
                            {attentionCount} to do
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-[#f1f3f7] dark:divide-white/[0.05] border-t border-[#f1f3f7] dark:border-white/[0.05]">
                        {overdueProjects.map(p => {
                          const sent = (p.updates ?? []).filter(u => u.sent_at).sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())
                          const lastSent = sent[0]?.sent_at
                          const daysSince = lastSent
                            ? Math.floor((Date.now() - new Date(lastSent).getTime()) / 86_400_000)
                            : Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86_400_000)
                          const subtitle = lastSent
                            ? `Last update sent ${daysSince === 1 ? 'yesterday' : `${daysSince}d ago`} · ${p.client_name}`
                            : `Created ${daysSince}d ago · No update sent yet · ${p.client_name}`

                          return (
                            <div key={`u-${p.id}`} className={cn(ROW, 'flex-col sm:flex-row items-stretch sm:items-center justify-between')}>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0', TONES.amber.tile)}>
                                  <Send className="w-3.5 h-3.5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.project_name}</p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto pl-11 sm:pl-0">
                                <RemindSelfButton projectId={p.id} />
                                <Link href={`/project/${p.id}/update`} className="px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors">
                                  Send update
                                </Link>
                              </div>
                            </div>
                          )
                        })}

                        {pendingApprovals.map(a => (
                          <div key={`a-${a.id}`} className={cn(ROW, 'flex-col sm:flex-row items-stretch sm:items-center justify-between')}>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0', TONES.violet.tile)}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Waiting on client approval · {a.projectName}</p>
                              </div>
                            </div>
                            <Link href={`/project/${a.projectId}`} className="self-end sm:self-auto flex-shrink-0 px-3 py-1.5 rounded-md border border-[#eaecf2] dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] text-xs font-semibold transition-colors">
                              Follow up
                            </Link>
                          </div>
                        ))}

                        {unsignedContracts.map(c => (
                          <div key={`c-${c.id}`} className={cn(ROW, 'flex-col sm:flex-row items-stretch sm:items-center justify-between')}>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0', TONES.indigo.tile)}>
                                <FileSignature className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Contract not signed yet · {c.projectName}</p>
                              </div>
                            </div>
                            <Link href={`/project/${c.projectId}/contract`} className="self-end sm:self-auto flex-shrink-0 px-3 py-1.5 rounded-md border border-[#eaecf2] dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] text-xs font-semibold transition-colors">
                              Review &amp; sign
                            </Link>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <RevenueChart paid={paidPoints} expenses={expensePoints} />
                </div>

                {/* Right column: timer, unpaid invoices, activity */}
                <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-8 min-w-0 w-full">

                  {runningTimer ? (
                    <Link href="/time" className={cn(CARD, 'block p-4 space-y-2.5 border-emerald-200 dark:border-emerald-500/25 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors')}>
                      <div className="flex items-center justify-between">
                        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold', TONES.emerald.pill)}>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Timer running
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">View timer →</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{runningTimer.description || 'Untitled task'}</div>
                      {timerProject && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: timerProject.color }} />
                          <span className="truncate">{timerProject.project_name}</span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <Link href="/time" className={cn(CARD, 'flex items-center gap-3 px-4 py-3.5 hover:border-slate-300 dark:hover:border-white/20 transition-colors group')}>
                      <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', TONES.indigo.tile)}>
                        <Timer className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Start a timer</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Track billable work with 1 click</p>
                      </div>
                      <span className={CARD_LINK}>
                        Track <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  )}

                  {upcomingInvoices.length > 0 && (
                    <section className={cn(CARD, 'overflow-hidden')}>
                      <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className={CARD_TITLE}>Unpaid invoices</h2>
                        <Link href="/invoices" className={CARD_LINK}>
                          View all <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <div className="divide-y divide-[#f1f3f7] dark:divide-white/[0.05] border-t border-[#f1f3f7] dark:border-white/[0.05]">
                        {upcomingInvoices.map(inv => {
                          const due = dueLabel(inv.due_date)
                          return (
                            <Link key={inv.id} href={`/invoices/${inv.id}`} className={cn(ROW, 'group')}>
                              <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0', due?.overdue ? TONES.rose.tile : TONES.slate.tile)}>
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-accent dark:group-hover:text-indigo-300 transition-colors">{inv.client_name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{inv.invoice_number}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{fmt$(calcInvoiceTotal(inv))}</p>
                                <span className={cn('inline-block mt-0.5 px-1.5 py-px rounded border text-[10px] font-semibold', due?.overdue ? TONES.rose.pill : TONES.slate.pill)}>
                                  {due?.text}
                                </span>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  <section className={cn(CARD, 'overflow-hidden')}>
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div className="flex items-center gap-2">
                        <h2 className={CARD_TITLE}>Recent activity</h2>
                        {activityFeed.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </div>
                      <Link href="/project" className={CARD_LINK}>
                        All projects <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {activityFeed.length === 0 ? (
                      <div className="py-8 px-5 flex flex-col items-center text-center gap-2 border-t border-[#f1f3f7] dark:border-white/[0.05]">
                        <div className={cn('w-9 h-9 rounded-md border flex items-center justify-center', TONES.slate.tile)}>
                          <FolderOpen className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No recent activity yet</p>
                        <Link href="/project/new" className={cn(CARD_LINK, 'mt-1')}>
                          <Plus className="w-3 h-3" /> Start a project
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f1f3f7] dark:divide-white/[0.05] border-t border-[#f1f3f7] dark:border-white/[0.05]">
                        {activityFeed.map(item => {
                          const timeStr = formatRelativeTime(item.date)
                          const tone =
                            item.type === 'invoice_paid' ? TONES.emerald
                            : item.type === 'invoice_sent' ? TONES.indigo
                            : item.type === 'update' ? TONES.violet
                            : item.type === 'contract_signed' ? TONES.sky
                            : TONES.slate
                          return (
                            <Link key={item.id} href={item.href} className={cn(ROW, 'group')}>
                              <span className={cn('w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0', tone.tile)}>
                                {item.type === 'invoice_paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {item.type === 'invoice_sent' && <FileText className="w-3.5 h-3.5" />}
                                {item.type === 'update' && <Send className="w-3.5 h-3.5" />}
                                {item.type === 'contract_signed' && <FileSignature className="w-3.5 h-3.5" />}
                                {item.type === 'project_created' && <FolderOpen className="w-3.5 h-3.5" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-accent dark:group-hover:text-indigo-300 transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.client} {timeStr ? `· ${timeStr}` : ''}
                                </p>
                              </div>
                              {typeof item.amount === 'number' && (
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-200 tabular-nums flex-shrink-0">
                                  {fmt$(item.amount)}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </section>

                  {isFree && (
                    <Link
                      href="/upgrade"
                      className="flex items-center gap-3 rounded-md bg-accent hover:bg-accent-hover text-white px-4 py-3.5 shadow-lg shadow-accent/20 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-md bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold">Upgrade to Pro</p>
                        <p className="text-[11px] text-white/75">Unlimited projects · custom branding · auto emails</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors flex-shrink-0" />
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DarkShell>
      <ProductTour userId={user.id} isAgency={activeWorkspaceId !== 'personal'} />
    </AppLayout>
  )
}
