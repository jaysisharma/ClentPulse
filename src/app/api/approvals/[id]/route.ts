import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_STATUSES = ['approved', 'declined']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status, feedback } = await request.json()

  // Validate the response — never write an arbitrary status.
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status. Must be "approved" or "declined".' }, { status: 400 })
  }
  if (feedback != null && (typeof feedback !== 'string' || feedback.length > 2000)) {
    return NextResponse.json({ error: 'Feedback must be text under 2000 characters.' }, { status: 400 })
  }

  const supabase = await createClient()

  // Only respond to a still-pending approval (can't flip an already-decided one).
  const { error } = await supabase.from('approvals').update({
    status, feedback: feedback || null, responded_at: new Date().toISOString(),
  }).eq('id', id).eq('status', 'pending')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
