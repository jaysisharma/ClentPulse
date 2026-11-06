import { NextResponse } from 'next/server'
import { getManageableProject, verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { APP_BUILDS_BUCKET, normalizeBuildEnvironment, sendBuildReadyEmail } from '@/lib/app-build-email'

/**
 * POST /api/extension/builds
 * Body: { projectId, path, fileSizeBytes, versionName, buildNumber?, environment?, minOsVersion?, changelog?, notifyClient? }
 *
 * Publishes an APK already uploaded via /api/extension/builds/upload-url to the client portal.
 */
export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { projectId, path, fileSizeBytes, versionName, buildNumber, environment, minOsVersion, changelog, notifyClient } = body
  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }
  if (!versionName || typeof versionName !== 'string' || !versionName.trim()) {
    return NextResponse.json({ error: 'Version name is required (e.g. v1.0.4)' }, { status: 400 })
  }
  // The path must be one issued for this project, so a build can't point at another project's file
  if (!path || typeof path !== 'string' || !path.startsWith(`${projectId}/`) || path.includes('..')) {
    return NextResponse.json({ error: 'Missing or invalid upload path' }, { status: 400 })
  }

  const admin = createAdminClient()
  const project = await getManageableProject<{ id: string; project_name: string; client_name: string; client_email: string | null; slug: string }>(
    admin, projectId, auth.userId, 'id, project_name, client_name, client_email, slug'
  )
  if (!project) {
    return NextResponse.json({ error: 'Project not found or you do not have access to it' }, { status: 404 })
  }

  const { data: { publicUrl } } = admin.storage.from(APP_BUILDS_BUCKET).getPublicUrl(path)

  const detectedPlatform = body.platform === 'ios' || body.platform === 'universal' || body.platform === 'android'
    ? body.platform
    : /\.ipa$/i.test(path)
    ? 'ios'
    : /\.apk$/i.test(path)
    ? 'android'
    : 'universal'

  const defaultMinOs = detectedPlatform === 'ios'
    ? 'iOS 15.0+'
    : detectedPlatform === 'android'
    ? 'Android 8.0+'
    : null

  const insertData = {
    project_id: project.id,
    user_id: auth.userId,
    version_name: versionName.trim(),
    build_number: buildNumber ? String(buildNumber).trim() : null,
    platform: detectedPlatform,
    environment: normalizeBuildEnvironment(environment),
    file_url: publicUrl,
    file_size_bytes: fileSizeBytes ? Number(fileSizeBytes) : null,
    min_os_version: minOsVersion ? String(minOsVersion).trim() : defaultMinOs,
    changelog: changelog ? String(changelog).trim().slice(0, 5000) : null,
    is_active: true,
  }

  const { data: build, error } = await admin
    .from('app_builds')
    .insert(insertData)
    .select('id, version_name, build_number, environment, file_url')
    .single()

  if (error || !build) {
    return NextResponse.json({ error: `Failed to save build: ${error?.message || 'Unknown error'}` }, { status: 500 })
  }

  let emailSent = false
  if (notifyClient && project.client_email) {
    const { data: owner } = await admin
      .from('users')
      .select('email')
      .eq('id', auth.userId)
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

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.frevio.cloud').replace(/\/+$/, '')
  return NextResponse.json({
    success: true,
    build,
    projectName: project.project_name,
    clientName: project.client_name,
    clientEmail: project.client_email,
    emailSent,
    portalUrl: `${appUrl}/p/${project.slug}`,
  })
}
