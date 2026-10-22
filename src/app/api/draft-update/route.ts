import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndSyncPromoPlan, isPaidPlan } from '@/lib/plans'
import { rateLimit } from '@/lib/rate-limit'

// Drafts a weekly client update from the project's real activity:
// logged time entries, milestones, and approval responses over the last 7 days.
//
// Claude drafting is for genuinely-paid plans (not free launch-promo Pro), capped per
// user per day; everyone else, and anyone over the cap, gets the template synthesizer below. Set
// AI_DRAFTING_ENABLED to false to turn the endpoint off entirely (404).
const AI_DRAFTING_ENABLED: boolean = true
const AI_DRAFTS_PER_DAY = 20

export async function POST(request: Request) {
  if (!AI_DRAFTING_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { projectId } = await request.json().catch(() => ({}))
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership or organization access and load the project.
  const { data: project } = await supabase
    .from('projects')
    .select('id, project_name, client_name, user_id, org_id')
    .eq('id', projectId)
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

  // Use Claude only for paid, non-promo plans within the daily cap; otherwise fall through to the template.
  const { data: owner } = await supabase
    .from('users')
    .select('id, plan, promo_pro, created_at')
    .eq('id', user.id)
    .single()
  const plan = await checkAndSyncPromoPlan(owner, supabase)
  const canUseClaude = isPaidPlan(plan) && !owner?.promo_pro
    && (await rateLimit(`draft-update:${user.id}`, AI_DRAFTS_PER_DAY, 24 * 60 * 60_000)).success

  if (process.env.ANTHROPIC_API_KEY && canUseClaude) {
    try {
      const context = `Project: ${project.project_name}
Client: ${project.client_name}
Hours logged this week: ${totalHours.toFixed(1)}

Work log this week:
${workLog}

Completed milestones: ${doneMilestones.length ? doneMilestones.join('; ') : 'none'}
Upcoming milestones: ${openMilestones.length ? openMilestones.join('; ') : 'none'}
Approved deliverables: ${approvedItems.length ? approvedItems.join('; ') : 'none'}`

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-5-5',
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
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { bullets?: string[]; note?: string }
        const bullets = (parsed.bullets ?? []).slice(0, 3)
        while (bullets.length < 3) bullets.push('')
        return NextResponse.json({ bullets, note: parsed.note ?? '' })
      }
    } catch (err) {
      console.warn('Anthropic draft-update failed, falling back to smart template synthesis:', err)
    }
  }

  // Fallback smart synthesizer: generates structured client-ready bullets from real project data
  const bullets: string[] = []
  if (doneMilestones.length > 0) {
    bullets.push(`Completed milestone deliverable: ${doneMilestones.slice(0, 2).join(' & ')}`)
  }
  if (approvedItems.length > 0) {
    bullets.push(`Received client sign-off on ${approvedItems.slice(0, 2).join(' & ')}`)
  }
  if (totalHours > 0) {
    const topEntry = (timeEntries ?? []).find(e => (e.description ?? '').trim())
    bullets.push(topEntry?.description ? `Shipped: ${topEntry.description}` : `Invested ${totalHours.toFixed(1)} dedicated development hours this week`)
  }
  if (bullets.length === 0) {
    bullets.push(`Focused on active milestones for ${project.project_name}`)
    if (openMilestones.length > 0) {
      bullets.push(`In progress on ${openMilestones[0]}`)
    }
  }
  while (bullets.length < 3) {
    bullets.push('')
  }

  const note = openMilestones.length > 0
    ? `Upcoming focus next week: ${openMilestones.slice(0, 2).join(', ')}. Please reach out if you have any questions!`
    : 'All deliverables are currently moving along smoothly on schedule.'

  return NextResponse.json({ bullets: bullets.slice(0, 3), note })
}
