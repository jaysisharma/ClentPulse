import { createClient } from '@/lib/supabase/server'
import { normalizeBuildEnvironment, sendBuildReadyEmail } from '@/lib/app-build-email'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: builds, error } = await supabase
    .from('app_builds')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ builds })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, slug, user_id, org_id')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Check user permission (direct owner or org member)
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
  const {
    version_name,
    build_number,
    platform = 'android',
    environment = 'staging',
    file_url,
    file_size_bytes,
    min_os_version = 'Android 8.0+',
    changelog,
    notify_client = false,
  } = body

  if (!version_name || typeof version_name !== 'string' || !version_name.trim()) {
    return NextResponse.json({ error: 'Version name is required (e.g. v1.0.4)' }, { status: 400 })
  }

  if (!file_url || typeof file_url !== 'string' || !file_url.trim()) {
    return NextResponse.json({ error: 'APK file or download URL is required' }, { status: 400 })
  }

  const insertData = {
    project_id: id,
    user_id: user.id,
    version_name: version_name.trim(),
    build_number: build_number ? String(build_number).trim() : null,
    platform: platform === 'ios' ? 'ios' : platform === 'universal' ? 'universal' : 'android',
    environment: normalizeBuildEnvironment(environment),
    file_url: file_url.trim(),
    file_size_bytes: file_size_bytes ? Number(file_size_bytes) : null,
    min_os_version: min_os_version ? String(min_os_version).trim() : 'Android 8.0+',
    changelog: changelog ? String(changelog).trim() : null,
    is_active: true,
  }

  const { data: build, error } = await supabase
    .from('app_builds')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Optionally send email notification to client
  let emailSent = false
  if (notify_client && project.client_email) {
    const { data: owner } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single()

    emailSent = await sendBuildReadyEmail({
      to: project.client_email,
      replyTo: owner?.email,
      projectName: project.project_name,
      projectSlug: project.slug,
      versionName: insertData.version_name,
      buildNumber: insertData.build_number,
      environment: insertData.environment,
      changelog: insertData.changelog,
    })
  }

  return NextResponse.json({ build, emailSent })
}
