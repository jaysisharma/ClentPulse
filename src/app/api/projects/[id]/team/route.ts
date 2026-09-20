import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const supabase = await createClient()

  const { data: teamMembers, error } = await supabase
    .from('project_team_members')
    .select('id, project_id, user_id, role_title, created_at, user:users(id, name, email, logo_url, last_heartbeat_at, active_focus_area)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teamMembers: teamMembers ?? [] })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Fetch project to check ownership or org membership
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id')
    .eq('id', projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  let hasPermission = project.user_id === user.id

  if (!hasPermission && project.org_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membership && ['owner', 'admin'].includes(membership.role)) {
      hasPermission = true
    }
  }

  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden: requires project owner or PM/admin role' }, { status: 403 })
  }

  const { userId, roleTitle } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  const title = (roleTitle || 'Team Specialist').trim()

  const { data: member, error: insertErr } = await supabase
    .from('project_team_members')
    .upsert(
      {
        project_id: projectId,
        user_id: userId,
        role_title: title,
      },
      { onConflict: 'project_id,user_id' }
    )
    .select('id, project_id, user_id, role_title, created_at, user:users(id, name, email, logo_url)')
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
  return NextResponse.json({ member }, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const targetUserId = searchParams.get('userId')
  if (!targetUserId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, org_id')
    .eq('id', projectId)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  let hasPermission = project.user_id === user.id

  if (!hasPermission && project.org_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membership && ['owner', 'admin'].includes(membership.role)) {
      hasPermission = true
    }
  }

  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: delErr } = await supabase
    .from('project_team_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', targetUserId)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
