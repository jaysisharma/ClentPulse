import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { updateId, projectId, authorName, body } = await request.json()

  if (!updateId || !projectId || !authorName?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (authorName.trim().length > 60) {
    return NextResponse.json({ error: 'Name too long (max 60 characters)' }, { status: 400 })
  }
  if (body.trim().length > 500) {
    return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('update_comments').insert({
    update_id: updateId,
    project_id: projectId,
    author_name: authorName.trim(),
    body: body.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
