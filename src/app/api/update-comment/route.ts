import { createAdminClient } from '@/lib/supabase/admin'
import { getProjectAccess } from '@/lib/project-access'
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

  const access = await getProjectAccess(projectId)
  if (!access) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  const { project, user, isWorkspaceMember } = access

  const internalFlag = Boolean(isInternal)
  if (internalFlag) {
    if (!isWorkspaceMember) {
      return NextResponse.json({ error: 'Unauthorized: internal notes require authorized workspace access' }, { status: 403 })
    }
  } else if (!access.canActAsClient) {
    return NextResponse.json({ error: 'Passcode verification required to post comments' }, { status: 401 })
  }

  // Service role: update_comments has no public insert policy, so access is checked above
  const supabase = createAdminClient()

  // The update must belong to this project, so comments can't be attached across projects
  const { data: update } = await supabase
    .from('updates')
    .select('id')
    .eq('id', updateId)
    .eq('project_id', project.id)
    .maybeSingle()
  if (!update) {
    return NextResponse.json({ error: 'Update not found' }, { status: 404 })
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

  if (project.org_id) {
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
      updateId,
      projectId,
      authorName: authorName.trim(),
      commentBody: body.trim(),
    }).catch(err => console.error('Failed to notify freelancer of comment:', err))
  }

  return NextResponse.json({ success: true })
}
