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

  const body = await request.json().catch(() => ({}))
  const { projectId, hours: rawHours, description, date } = body

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }

  const hours = typeof rawHours === 'number' ? Math.round(rawHours * 100) / 100 : 0
  if (hours <= 0 || hours > 24) {
    return NextResponse.json({ error: 'Hours must be greater than 0 and at most 24' }, { status: 400 })
  }

  const desc = typeof description === 'string' && description.trim() ? description.trim().slice(0, 200) : 'Browser testing & QA'
  const entryDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayDateStr()

  const admin = createAdminClient()

  // 1. Verify project ownership
  const { data: project, error: projectErr } = await admin
    .from('projects')
    .select('id, user_id, project_name, hourly_rate')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (projectErr || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // 2. Insert time entry
  const { data: entry, error: insertErr } = await admin
    .from('time_entries')
    .insert({
      user_id: auth.userId,
      project_id: projectId,
      hours,
      description: desc,
      date: entryDate,
      source: 'extension',
    })
    .select()
    .single()

  if (insertErr || !entry) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to record time entry' }, { status: 500 })
  }

  // 3. Update project last_heartbeat_at & focus area
  await admin
    .from('projects')
    .update({
      last_heartbeat_at: new Date().toISOString(),
      active_focus_area: 'Browser Testing & QA',
    })
    .eq('id', projectId)

  // 4. Calculate today's totals
  const { data: todayEntries } = await admin
    .from('time_entries')
    .select('hours')
    .eq('project_id', projectId)
    .eq('date', entryDate)

  const todayHours = Math.round((todayEntries || []).reduce((s, e) => s + (Number(e.hours) || 0), 0) * 10) / 10
  const rate = Number(project.hourly_rate) || 0
  const billableToday = Math.round(todayHours * rate)

  return NextResponse.json({
    success: true,
    entry,
    todayHours,
    hourlyRate: rate,
    billableToday,
    projectName: project.project_name,
  })
}
