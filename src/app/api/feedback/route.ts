import { createAdminClient } from '@/lib/supabase/admin'
import { getProjectAccess } from '@/lib/project-access'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { notifyFreelancerOfFeedback } from '@/lib/notifications'

const FEEDBACK_TYPES = ['thumbs_up', 'thumbs_down', 'question']
const MAX_MESSAGE_LENGTH = 2000

export async function POST(request: Request) {
  const { projectId, type, message } = await request.json().catch(() => ({}))
  if (!projectId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!FEEDBACK_TYPES.includes(type)) return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 })
  if (message != null && (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json({ error: `Message must be text under ${MAX_MESSAGE_LENGTH} characters` }, { status: 400 })
  }

  // Each submission emails the studio, so cap how often one visitor can send them
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const rl = await rateLimit(`feedback:${ip}:${projectId}`, 5, 10 * 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 })
  }

  const access = await getProjectAccess(projectId)
  if (!access) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (!access.canActAsClient) {
    return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
  }

  // Service role: access is checked above
  const { error } = await createAdminClient()
    .from('feedback')
    .insert({ project_id: projectId, type, message: message?.trim() || null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify freelancer via email in the background
  notifyFreelancerOfFeedback({
    projectId,
    type,
    message: message?.trim() || null,
  }).catch(err => console.error('Failed to notify freelancer of feedback:', err))

  return NextResponse.json({ success: true })
}
