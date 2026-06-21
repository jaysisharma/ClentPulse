import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feedbackId } = await request.json()
    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required.' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Fetch current votes count
    const { data: current, error: fetchError } = await adminClient
      .from('freelancer_feedback')
      .select('votes')
      .eq('id', feedbackId)
      .single()

    if (fetchError || !current) {
      console.error('[Feedback Upvote API] Fetch Error:', fetchError)
      return NextResponse.json({ error: 'Feedback suggestion not found.' }, { status: 404 })
    }

    const nextVotes = (current.votes || 0) + 1

    // 2. Update votes count
    const { error: updateError } = await adminClient
      .from('freelancer_feedback')
      .update({ votes: nextVotes })
      .eq('id', feedbackId)

    if (updateError) {
      console.error('[Feedback Upvote API] Update Error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, votes: nextVotes })
  } catch (error: any) {
    console.error('[Feedback Upvote API] Unexpected Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
