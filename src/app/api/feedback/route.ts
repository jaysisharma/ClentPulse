import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { notifyFreelancerOfFeedback } from '@/lib/notifications'

export async function POST(request: Request) {
  const { projectId, type, message } = await request.json()
  if (!projectId || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = await createClient()
  const { error } = await supabase.from('feedback').insert({ project_id: projectId, type, message: message || null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify freelancer via email in the background
  notifyFreelancerOfFeedback({
    projectId,
    type,
    message: message || null,
  }).catch(err => console.error('Failed to notify freelancer of feedback:', err))

  return NextResponse.json({ success: true })
}
