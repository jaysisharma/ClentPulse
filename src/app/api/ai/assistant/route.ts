import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { action, projectId, clientMessage, projectRate, currency = 'USD', estimatedHours = 8 } = body

    const admin = createAdminClient()

    if (action === 'weekly_digest') {
      if (!projectId) {
        return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
      }

      // Fetch project details, completed checklist items, milestones, and recent time entries
      const [{ data: project }, { data: checklist }, { data: milestones }, { data: timeEntries }] = await Promise.all([
        admin.from('projects').select('project_name, client_name, active_focus_area').eq('id', projectId).single(),
        admin.from('checklist_items').select('title, done').eq('project_id', projectId),
        admin.from('milestones').select('title, done, due_date').eq('project_id', projectId),
        admin.from('time_entries').select('description, hours').eq('project_id', projectId).order('created_at', { ascending: false }).limit(5),
      ])

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      const completedTasks = (checklist || []).filter(c => c.done).map(c => c.title)
      const pendingTasks = (checklist || []).filter(c => !c.done).map(c => c.title)
      const completedMilestones = (milestones || []).filter(m => m.done).map(m => m.title)
      const nextMilestones = (milestones || []).filter(m => !m.done).map(m => m.title)
      const recentWork = (timeEntries || []).map(t => t.description).filter(Boolean)

      // Synthesize high-impact executive update bullets
      const bullets: string[] = []

      // Bullet 1: What was shipped / finalized
      if (completedMilestones.length > 0) {
        bullets.push(`Shipped and verified milestone deliverable: ${completedMilestones[0]}.`)
      } else if (completedTasks.length > 0) {
        bullets.push(`Finalized core implementation for ${completedTasks.slice(0, 2).join(' and ')}.`)
      } else {
        bullets.push(`Completed targeted engineering sprint on ${project.active_focus_area || 'core architectural foundations'}.`)
      }

      // Bullet 2: In-progress sprint & telemetry
      if (recentWork.length > 0) {
        bullets.push(`Active development on ${recentWork[0]} with telemetry and regression testing.`)
      } else if (pendingTasks.length > 0) {
        bullets.push(`Deep focus on ${pendingTasks[0]} — currently finalizing staging builds.`)
      } else {
        bullets.push(`Refining staging environment and verifying deliverables ahead of milestone approval.`)
      }

      // Bullet 3: Next steps & client action items
      if (nextMilestones.length > 0) {
        bullets.push(`Targeting next deliverable (${nextMilestones[0]}); review link will be shared in the portal for sign-off.`)
      } else {
        bullets.push(`Awaiting your feedback on the latest portal deliverables to unlock subsequent milestone.`)
      }

      const note = `Hi ${project.client_name || 'there'}, here is our executive pulse update for ${project.project_name}. Everything is on schedule — let us know if you have any questions or review notes directly in your portal.`

      return NextResponse.json({
        success: true,
        bullets,
        note,
      })
    }

    if (action === 'scope_defender') {
      if (!clientMessage || typeof clientMessage !== 'string') {
        return NextResponse.json({ error: 'Client message is required' }, { status: 400 })
      }

      const rate = Number(projectRate) || 125
      const hours = Number(estimatedHours) || 8
      const calculatedAmount = Math.round(rate * hours)

      // Clean preview title from message
      const snippet = clientMessage.trim().replace(/\n+/g, ' ').slice(0, 60)
      const title = snippet.length > 50 ? `${snippet.slice(0, 48)}...` : snippet

      const politeResponse = `Hi! Thanks so much for reaching out with this idea.

I took a close look at this request ("${snippet}"). While it sounds like a great addition to the product, it falls outside the deliverables outlined in our current signed scope agreement.

To make sure our core milestone timeline and launch date remain completely protected, I would love to build this as an official Change Order:

• Deliverable: ${title}
• Estimated Effort: ~${hours} engineering hours
• Investment: ${currency} ${calculatedAmount.toLocaleString()}
• Timeline Impact: +2 to 3 business days

I have staged an official Change Order in your private client portal. You can review the breakdown and approve it whenever you're ready, and I will queue it immediately for development!`

      return NextResponse.json({
        success: true,
        title,
        amount: calculatedAmount,
        estimatedHours: hours,
        politeResponse,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Supported: weekly_digest, scope_defender' }, { status: 400 })
  } catch (err: any) {
    console.error('[AI Assistant Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

