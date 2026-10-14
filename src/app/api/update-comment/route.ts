import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { notifyFreelancerOfComment } from '@/lib/notifications'
import { logAgencyActivity } from '@/lib/activity'
import { verifyPasscodeTicket, timingSafeCompare } from '@/lib/passcode-crypto'

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

  // 1. Fetch project to verify existence and authorization
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id, project_name, passcode, slug')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  let isWorkspaceAuthorized = false
  if (user) {
    if (project.user_id === user.id) {
      isWorkspaceAuthorized = true
    } else if (project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (member) isWorkspaceAuthorized = true
    }
  }

  const internalFlag = Boolean(isInternal)
  if (internalFlag) {
    if (!user || !isWorkspaceAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: internal notes require authorized workspace access' }, { status: 403 })
    }
  } else if (!isWorkspaceAuthorized && project.passcode) {
    // Public comment on passcode-gated project requires valid ticket
    const cookieStore = await cookies()
    const ticketOrPass = cookieStore.get(`client_project_passcode_${project.slug}`)?.value
    const isTicketValid = verifyPasscodeTicket(ticketOrPass, project.id, project.slug)
    const isLegacyMatch = !isTicketValid && ticketOrPass && timingSafeCompare(ticketOrPass, project.passcode)

    if (!isTicketValid && !isLegacyMatch) {
      return NextResponse.json({ error: 'Passcode verification required to post comments' }, { status: 401 })
    }
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
