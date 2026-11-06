import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Verify project ownership
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id, project_name, client_name')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // 2. Query approvals with changes requested and client comments
  const [{ data: revisionRequests }, { data: comments }] = await Promise.all([
    admin
      .from('approvals')
      .select('id, title, feedback, responded_at, created_at')
      .eq('project_id', projectId)
      .eq('status', 'changes_requested')
      .order('responded_at', { ascending: false })
      .limit(10),
    admin
      .from('update_comments')
      .select('id, author_name, body, created_at')
      .eq('project_id', projectId)
      .eq('is_internal', false)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const feedbackItems = [
    ...(revisionRequests || []).map(r => ({
      id: r.id,
      type: 'revision_request',
      title: `Revision: ${r.title}`,
      text: r.feedback || 'Changes requested by client',
      author: project.client_name || 'Client',
      createdAt: r.responded_at || r.created_at,
    })),
    ...(comments || []).map(c => ({
      id: c.id,
      type: 'comment',
      title: 'Portal Comment',
      text: c.body,
      author: c.author_name || project.client_name || 'Client',
      createdAt: c.created_at,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({
    success: true,
    projectName: project.project_name,
    clientName: project.client_name,
    feedback: feedbackItems,
  })
}

