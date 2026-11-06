import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { projectId, canvasEmbedUrl } = body

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }

  const cleanUrl = typeof canvasEmbedUrl === 'string' && canvasEmbedUrl.trim() ? canvasEmbedUrl.trim() : null

  const admin = createAdminClient()

  // 1. Verify project ownership
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id, project_name')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // 2. Update canvas embed URL on project
  const { error } = await admin
    .from('projects')
    .update({ canvas_embed_url: cleanUrl })
    .eq('id', projectId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    projectId,
    projectName: project.project_name,
    canvasEmbedUrl: cleanUrl,
  })
}

