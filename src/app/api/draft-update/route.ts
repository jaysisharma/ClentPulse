import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Drafts a weekly client update from the project's real activity:
// logged time entries, milestones, and approval responses over the last 7 days.
//
// DISABLED: AI drafting is turned off for everyone for now. The endpoint
// returns 404 so the feature is fully inert (no Anthropic calls, no surface).
// To re-enable, remove the early return below and restore the UI in
// src/app/project/[id]/update/page.tsx.
const AI_DRAFTING_ENABLED: boolean = false

export async function POST(request: Request) {
  if (!AI_DRAFTING_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI drafting is not configured. Add ANTHROPIC_API_KEY to enable it.' },
      { status: 503 },
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Paid-Pro-only feature: gate server-side so it can't be bypassed from the
  // client. Promo Pro (free launch grant) intentionally does NOT include AI —
  // it's excluded so we don't pay Anthropic for free users. `promo_pro` is
  // cleared by the Stripe webhook once a promo user actually subscribes.
  const { data: owner } = await supabase
    .from('users')
    .select('plan, promo_pro')
    .eq('id', user.id)
    .single()
  if (owner?.plan !== 'pro' || owner?.promo_pro) {
    return NextResponse.json(
      { error: 'AI drafting is available on a paid Pro plan.' },
      { status: 403 },
    )
  }

  // Verify ownership and load the project.
  const { data: project } = await supabase
    .from('projects')
    .select('id, project_name, client_name')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10)

  const [{ data: timeEntries }, { data: milestones }, { data: approvals }] = await Promise.all([
    supabase.from('time_entries')
      .select('description, hours, date')
      .eq('project_id', projectId)
      .gte('date', cutoffDate)
      .order('date', { ascending: true }),
    supabase.from('milestones')
      .select('title, due_date, done')
      .eq('project_id', projectId),
    supabase.from('approvals')
      .select('title, status')
      .eq('project_id', projectId),
  ])

  const totalHours = (timeEntries ?? []).reduce((s, e) => s + (e.hours ?? 0), 0)
  const workLog = (timeEntries ?? [])
    .filter(e => (e.description ?? '').trim())
    .map(e => `- ${e.description} (${e.hours}h, ${e.date})`)
    .join('\n') || '(no described time entries this week)'
  const doneMilestones = (milestones ?? []).filter(m => m.done).map(m => m.title)
  const openMilestones = (milestones ?? []).filter(m => !m.done).map(m => `${m.title}${m.due_date ? ` (due ${m.due_date})` : ''}`)
  const approvedItems = (approvals ?? []).filter(a => a.status === 'approved').map(a => a.title)

  const context = `Project: ${project.project_name}
Client: ${project.client_name}
Hours logged this week: ${totalHours.toFixed(1)}

Work log this week:
${workLog}

Completed milestones: ${doneMilestones.length ? doneMilestones.join('; ') : 'none'}
Upcoming milestones: ${openMilestones.length ? openMilestones.join('; ') : 'none'}
Approved deliverables: ${approvedItems.length ? approvedItems.join('; ') : 'none'}`

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system:
        'You are a freelancer writing a brief, warm weekly status update for a client. ' +
        'Use only the activity provided — never invent work that is not in the log. ' +
        'Write in first person ("I"/"we"), plain and confident, no corporate fluff. ' +
        'Respond ONLY with a JSON object of the form ' +
        '{"bullets": ["...","...","..."], "note": "..."} where bullets is exactly three concise ' +
        'progress statements a client would understand (translate raw time-log jargon into outcomes), ' +
        'and note is one or two friendly sentences about context or next steps. ' +
        'If there is little activity, say so honestly in the note rather than padding the bullets.',
      messages: [{ role: 'user', content: `Here is this week's activity:\n\n${context}` }],
    })

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in model response')
    const parsed = JSON.parse(jsonMatch[0]) as { bullets?: string[]; note?: string }

    const bullets = (parsed.bullets ?? []).slice(0, 3)
    while (bullets.length < 3) bullets.push('')

    return NextResponse.json({ bullets, note: parsed.note ?? '' })
  } catch (err) {
    console.error('draft-update error:', err)
    return NextResponse.json({ error: 'Could not generate a draft. Please try again.' }, { status: 502 })
  }
}
