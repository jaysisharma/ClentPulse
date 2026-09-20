import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAgencyActivity } from '@/lib/activity'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  const { id: projectId, updateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()
  if (!['submit_for_review', 'approve_draft'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Supported: submit_for_review, approve_draft' }, { status: 400 })
  }

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id, project_name')
    .eq('id', projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Check caller role
  let callerRole: string | null = null
  let isMember = project.user_id === user.id

  if (project.org_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membership) {
      isMember = true
      callerRole = membership.role
    }
  }

  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isManagement = project.user_id === user.id || ['owner', 'admin'].includes(callerRole ?? '')

  if (action === 'approve_draft' && !isManagement) {
    return NextResponse.json({ error: 'Forbidden: only project owner or agency admins can approve drafts' }, { status: 403 })
  }

  // Fetch update
  const { data: update } = await supabase
    .from('updates')
    .select('id, project_id, review_status')
    .eq('id', updateId)
    .eq('project_id', projectId)
    .single()

  if (!update) return NextResponse.json({ error: 'Update not found' }, { status: 404 })

  const updatesPayload: Record<string, any> = {}

  if (action === 'submit_for_review') {
    updatesPayload.review_status = 'review_ready'
    updatesPayload.author_id = user.id
  } else if (action === 'approve_draft') {
    updatesPayload.review_status = 'approved'
    updatesPayload.approved_by = user.id
    updatesPayload.approved_at = new Date().toISOString()
  }

  const { data: updated, error } = await supabase
    .from('updates')
    .update(updatesPayload)
    .eq('id', updateId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (project.org_id) {
    await logAgencyActivity({
      supabase,
      orgId: project.org_id,
      projectId: project.id,
      userId: user.id,
      action: action === 'submit_for_review' ? 'update.review_submitted' : 'update.approved',
      entityType: 'update',
      entityId: updateId,
      details: {
        project_name: project.project_name,
        review_status: updatesPayload.review_status,
      },
    })
  }

  return NextResponse.json({ success: true, update: updated })
}
