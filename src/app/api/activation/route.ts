import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { trackActivationEvent, ActivationEventName } from '@/lib/activation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const eventName = body.eventName as ActivationEventName
    const projectId = body.projectId || null
    const metadata = body.metadata || {}

    if (!eventName) {
      return NextResponse.json({ error: 'eventName is required' }, { status: 400 })
    }

    const recorded = await trackActivationEvent({
      supabase,
      userId: user.id,
      eventName,
      projectId,
      metadata,
    })

    return NextResponse.json({ success: true, recorded })
  } catch (err: any) {
    console.error('[POST /api/activation error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
