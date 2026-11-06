import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'

function todayDateStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { projectId, focusArea, intervalSeconds: rawInterval } = body
  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }

  // Interval in seconds, default 120s, clamped between 10s and 300s
  const intervalSeconds = Math.max(10, Math.min(300, typeof rawInterval === 'number' ? rawInterval : 120))
  const cleanFocus = typeof focusArea === 'string' && focusArea.trim() ? focusArea.trim().slice(0, 50) : null

  const admin = createAdminClient()

  // 1. Verify project belongs to the authenticated user
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, user_id, project_name, status, hourly_rate')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const now = new Date()
  const nowIso = now.toISOString()
  const today = todayDateStr()

  // 2. Update real-time presence fields on project
  await admin
    .from('projects')
    .update({
      last_heartbeat_at: nowIso,
      active_focus_area: cleanFocus || 'Coding',
    })
    .eq('id', projectId)

  // 3. Consolidate into time entries
  // Check for an active session entry updated/created in the last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const addedHours = intervalSeconds / 3600

  const { data: recentEntry } = await admin
    .from('time_entries')
    .select('id, hours, description')
    .eq('project_id', projectId)
    .eq('user_id', auth.userId)
    .eq('source', 'extension')
    .gte('created_at', fifteenMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recentEntry) {
    const updatedHours = Math.round(((recentEntry.hours ?? 0) + addedHours) * 10000) / 10000
    let desc = recentEntry.description || 'Editor coding session'
    if (cleanFocus && !desc.includes(cleanFocus)) {
      desc = `${desc} & ${cleanFocus}`
    }

    await admin
      .from('time_entries')
      .update({
        hours: updatedHours,
        description: desc.slice(0, 150),
      })
      .eq('id', recentEntry.id)
  } else {
    const newDesc = cleanFocus ? `Editor session (${cleanFocus})` : 'Editor coding session'
    await admin
      .from('time_entries')
      .insert({
        user_id: auth.userId,
        project_id: projectId,
        description: newDesc,
        hours: Math.round(addedHours * 10000) / 10000,
        date: today,
        source: 'extension',
      })
  }

  // 4. Calculate today's logged hours and billable amount
  const { data: todayEntries } = await admin
    .from('time_entries')
    .select('hours')
    .eq('project_id', projectId)
    .eq('date', today)

  const todayHours = Math.round((todayEntries || []).reduce((s, e) => s + (Number(e.hours) || 0), 0) * 10) / 10
  const rate = Number(project.hourly_rate) || 0
  const billableToday = Math.round(todayHours * rate)

  // 5. Check for recent client notifications within the last heartbeat interval (e.g. 5 minutes)
  const recentWindow = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const [{ data: recentApprovals }, { data: recentComments }] = await Promise.all([
    admin
      .from('approvals')
      .select('title, status, responded_at')
      .eq('project_id', projectId)
      .neq('status', 'pending')
      .gte('responded_at', recentWindow)
      .limit(2),
    admin
      .from('update_comments')
      .select('author_name, body, created_at')
      .eq('project_id', projectId)
      .eq('is_internal', false)
      .gte('created_at', recentWindow)
      .limit(2),
  ])

  const events: Array<{ type: string; message: string }> = [
    ...(recentApprovals || []).map(a => ({
      type: 'approval',
      message: `${a.status === 'approved' ? '✅ Deliverable Approved' : '⚠️ Changes Requested'}: "${a.title}"`,
    })),
    ...(recentComments || []).map(c => ({
      type: 'comment',
      message: `💬 ${c.author_name || 'Client'}: "${(c.body || '').slice(0, 50)}"`,
    })),
  ]

  return NextResponse.json({
    success: true,
    projectId: project.id,
    projectName: project.project_name,
    focusArea: cleanFocus || 'Coding',
    lastHeartbeatAt: nowIso,
    todayHours,
    hourlyRate: rate,
    billableToday,
    events,
  })
}
