import { NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/project-access'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClientMagicToken } from '@/lib/magic-token'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const access = await getProjectAccess(projectId)
    if (!access || !access.isWorkspaceMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: project } = await admin
      .from('projects')
      .select('id, slug, client_email')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const clientEmail = project.client_email || 'client@example.com'
    const token = createClientMagicToken(project.id, clientEmail)

    return NextResponse.json({
      success: true,
      token,
      path: `/p/${project.slug}?magic_token=${token}`,
    })
  } catch (err: any) {
    console.error('[Generate Magic Link Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

