import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function localWeekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch organization, projects, members, team pods, invoices, updates
  const [
    { data: org },
    { data: projects },
    { data: orgMembers },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase
      .from('projects')
      .select(`
        id, project_name, client_name, client_email, color, status, budget,
        deposit_required, deposit_paid, waiting_on_client, waiting_reason, created_at, slug,
        updates(id, sent_at, review_status, created_at),
        invoices(id, invoice_number, status, items, due_date, currency, created_at),
        project_team_members(id, user_id, role_title, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area))
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
    supabase
      .from('organization_members')
      .select('id, role, user_id, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area)')
      .eq('org_id', orgId),
  ])

  const allProjects = projects ?? []
  const allMembers = orgMembers ?? []
  const projectIds = allProjects.map(p => p.id)

  // Fetch time entries for this week across all projects of this org
  let timeEntries: any[] = []
  if (projectIds.length > 0) {
    const weekStart = localWeekStart()
    const { data: tData } = await supabase
      .from('time_entries')
      .select('project_id, user_id, hours, date')
      .in('project_id', projectIds)
      .gte('date', weekStart)
    timeEntries = tData ?? []
  }

  const cutoff7d = sevenDaysAgo()

  // 1. Portfolio Metrics
  const activeProjects = allProjects.filter(p => p.status === 'active')
  const completedProjects = allProjects.filter(p => p.status === 'completed')
  const uniqueClients = new Set(allProjects.map(p => p.client_name.trim().toLowerCase())).size
  const totalContractedBudget = activeProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)

  // 2. At-Risk Radar
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
        riskSeverity = 'high'
        riskType = 'overdue_update'
      } else if (isOverdue) {
        riskSeverity = 'medium'
        riskType = 'overdue_update'
      } else if (isBlocked) {
        riskSeverity = 'medium'
        riskType = 'blocked_on_client'
      } else if (pendingReviews > 0) {
        riskSeverity = 'medium'
        riskType = 'pending_review'
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
    .sort((a, b) => (b.riskSeverity === 'high' ? 1 : 0) - (a.riskSeverity === 'high' ? 1 : 0))

  // 3. Blocked Cash Radar
  const blockedItems: Array<{
    id: string
    type: 'deposit' | 'invoice'
    projectId: string
    projectName: string
    clientName: string
    clientEmail?: string | null
    amount: number
    currency: string
    reason: string
  }> = []

  let totalBlockedCash = 0

  for (const project of activeProjects) {
    // Check pending kickoff deposit
    if (project.deposit_required && !project.deposit_paid) {
      const amount = Number(project.deposit_required) || 0
      totalBlockedCash += amount
      blockedItems.push({
        id: `deposit-${project.id}`,
        type: 'deposit',
        projectId: project.id,
        projectName: project.project_name,
        clientName: project.client_name,
        clientEmail: project.client_email,
        amount,
        currency: (project.invoices?.[0] as any)?.currency || 'USD',
        reason: 'Kickoff deposit awaiting client payment',
      })
    }

    // Check unpaid invoices on blocked projects
    const invoices = (project.invoices ?? []) as any[]
    for (const inv of invoices) {
      if (inv.status === 'sent') {
        const invAmount = (inv.items ?? []).reduce((sum: number, it: any) => sum + (it.amount ?? 0), 0)
        const isPastDue = inv.due_date && new Date(inv.due_date) < new Date()
        
        if (project.waiting_on_client || isPastDue) {
          totalBlockedCash += invAmount
          blockedItems.push({
            id: `inv-${inv.id}`,
            type: 'invoice',
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

  // 4. Team Workload & Capacity Grid
  const teamWorkload = allMembers.map((member: any) => {
    const usr = Array.isArray(member.user) ? member.user[0] : member.user
    const userId = member.user_id

    // Find all projects where this user is staffed
    const assignedProjects: Array<{ id: string; projectName: string; color: string; roleTitle: string }> = []
    for (const p of activeProjects) {
      const staffList = (p.project_team_members ?? []) as any[]
      const match = staffList.find(s => s.user_id === userId)
      if (match) {
        assignedProjects.push({
          id: p.id,
          projectName: p.project_name,
          color: p.color,
          roleTitle: match.role_title || 'Specialist',
        })
      }
    }

    // Sum hours logged this week
    const hoursThisWeek = timeEntries
      .filter((t: any) => t.user_id === userId)
      .reduce((sum: number, t: any) => sum + (Number(t.hours) || 0), 0)

    const assignedCount = assignedProjects.length
    let capacityStatus: 'available' | 'balanced' | 'overloaded' = 'available'

    if (assignedCount >= 4 || hoursThisWeek >= 35) {
      capacityStatus = 'overloaded'
    } else if (assignedCount >= 2 || hoursThisWeek >= 15) {
      capacityStatus = 'balanced'
    } else {
      capacityStatus = 'available'
    }

    return {
      memberId: member.id,
      userId,
      role: member.role,
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

  return NextResponse.json({
    success: true,
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
  })
}
