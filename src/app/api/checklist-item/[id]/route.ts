import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Used by both freelancer (authenticated) and client (public toggle)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { done } = await request.json()

  const supabase = await createClient()

  const { error } = await supabase
    .from('checklist_items')
    .update({ done: !!done, done_at: done ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
