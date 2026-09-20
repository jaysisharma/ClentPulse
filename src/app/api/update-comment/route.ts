import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { notifyFreelancerOfComment } from '@/lib/notifications'
import { logAgencyActivity } from '@/lib/activity'

export async function POST(request: Request) {
  const { updateId, projectId, authorName, body, isInternal } = await request.json()

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
  const { data: { user } } = await supabase.auth.getUser()

  const internalFlag = Boolean(isInternal)
  if (internalFlag && !user) {
    return NextResponse.json({ error: 'Unauthorized: internal notes require authenticated session' }, { status: 401 })
  }

  const { error } = await supabase.from('update_comments').insert({
    update_id: updateId,
    project_id: projectId,
    author_name: authorName.trim(),
    body: body.trim(),
    is_internal: internalFlag,
    user_id: user?.id ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id, project_name')
    .eq('id', projectId)
    .single()

  if (project?.org_id) {
    await logAgencyActivity({
      supabase,
      orgId: project.org_id,
      projectId: project.id,
      userId: user?.id ?? null,
      action: internalFlag ? 'note.internal_added' : 'comment.client_added',
      entityType: 'update_comment',
      details: {
        author_name: authorName.trim(),
        update_id: updateId,
        is_internal: internalFlag,
      },
    })
  }

  // Only notify external freelancer via email if comment was public
  if (!internalFlag) {
    notifyFreelancerOfComment({
      projectId,
      updateId,
      authorName: authorName.trim(),
      commentBody: body.trim(),
    }).catch(err => console.error('Failed to notify freelancer of comment:', err))
  }

  return NextResponse.json({ success: true })
}

