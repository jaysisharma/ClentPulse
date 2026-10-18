import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const { id, buildId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  if (project.user_id !== user.id) {
    if (project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await request.json()
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active
  if (typeof body.version_name === 'string' && body.version_name.trim()) updates.version_name = body.version_name.trim()
  if (body.build_number !== undefined) updates.build_number = body.build_number ? String(body.build_number).trim() : null
  if (typeof body.file_url === 'string' && body.file_url.trim()) updates.file_url = body.file_url.trim()
  if (body.changelog !== undefined) updates.changelog = body.changelog ? String(body.changelog).trim() : null
  if (body.environment && ['staging', 'internal_beta', 'client_review', 'production'].includes(body.environment)) {
    updates.environment = body.environment
  }

  const { data: build, error } = await supabase
    .from('app_builds')
    .update(updates)
    .eq('id', buildId)
    .eq('project_id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ build })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; buildId: string }> }
) {
  const { id, buildId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  if (project.user_id !== user.id) {
    if (project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await supabase
    .from('app_builds')
    .delete()
    .eq('id', buildId)
    .eq('project_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
