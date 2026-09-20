import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/project-resources/[id]  — update show_in_portal or name
 * DELETE /api/project-resources/[id] — remove resource from project
 */

async function verifyResourceAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  resourceId: string,
  userId: string
): Promise<{ allowed: boolean; resource: any }> {
  const { data: resource } = await supabase
    .from('project_resources')
    .select('id, project_id, projects(user_id, org_id)')
    .eq('id', resourceId)
    .maybeSingle()

  if (!resource) return { allowed: false, resource: null }

  const project = (resource as any).projects
  if (!project) return { allowed: false, resource: null }

  if (project.user_id === userId) return { allowed: true, resource }

  if (project.org_id) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', userId)
      .maybeSingle()
    return { allowed: !!member, resource }
  }

  return { allowed: false, resource }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await verifyResourceAccess(supabase, id, user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, any> = {}
  if (typeof body.showInPortal === 'boolean') updates.show_in_portal = body.showInPortal
  if (typeof body.name === 'string') updates.name = body.name

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('project_resources')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await verifyResourceAccess(supabase, id, user.id)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('project_resources').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
