import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET  /api/project-resources?projectId=...
 * POST /api/project-resources
 */

async function verifyProjectAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { data: project } = await supabase
    .from('projects')
    .select('user_id, org_id')
    .eq('id', projectId)
    .maybeSingle()

  if (!project) return false
  if (project.user_id === userId) return true

  if (project.org_id) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', userId)
      .maybeSingle()
    return !!member
  }
  return false
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = new URL(request.url).searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const hasAccess = await verifyProjectAccess(supabase, projectId, user.id)
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('project_resources')
    .select('*, integration_connections(status, provider_account_email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ resources: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { projectId, provider, resourceType, externalId, externalUrl, name, thumbnailUrl, metadata, showInPortal, integrationConnectionId } = body

  if (!projectId || !provider || !resourceType || !externalId || !name) {
    return NextResponse.json(
      { error: 'projectId, provider, resourceType, externalId, and name are required' },
      { status: 400 }
    )
  }

  const hasAccess = await verifyProjectAccess(supabase, projectId, user.id)
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('project_resources')
    .insert({
      project_id: projectId,
      integration_connection_id: integrationConnectionId ?? null,
      provider,
      resource_type: resourceType,
      external_id: externalId,
      external_url: externalUrl ?? null,
      name,
      thumbnail_url: thumbnailUrl ?? null,
      show_in_portal: showInPortal ?? true,
      metadata: metadata ?? {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
