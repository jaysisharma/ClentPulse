import { NextResponse } from 'next/server'
import { getManageableProject, verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { APP_BUILDS_BUCKET } from '@/lib/app-build-email'

const MAX_APK_BYTES = 500 * 1024 * 1024

/**
 * POST /api/extension/builds/upload-url
 * Body: { projectId, fileName, size }
 *
 * Issues a one-time signed upload URL so the extension PUTs the APK straight to
 * Supabase Storage (bypassing the 4.5 MB function body limit).
 */
export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { projectId, fileName, size } = body as { projectId?: string; fileName?: string; size?: number }

  if (!projectId || typeof projectId !== 'string' || !fileName || typeof fileName !== 'string') {
    return NextResponse.json({ error: 'projectId and fileName are required' }, { status: 400 })
  }
  if (!/\.(apk|ipa|zip|tar\.gz)$/i.test(fileName)) {
    return NextResponse.json({ error: 'Only .apk, .ipa, .zip, and .tar.gz files can be uploaded' }, { status: 400 })
  }
  if (typeof size !== 'number' || size <= 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (size > MAX_APK_BYTES) {
    return NextResponse.json({ error: 'APK must be 500 MB or smaller' }, { status: 413 })
  }

  const admin = createAdminClient()
  const project = await getManageableProject(admin, projectId, auth.userId, 'id')
  if (!project) {
    return NextResponse.json({ error: 'Project not found or you do not have access to it' }, { status: 404 })
  }

  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${projectId}/${Date.now()}-${cleanName}`
  const { data, error } = await admin.storage.from(APP_BUILDS_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: `Could not prepare upload: ${error?.message || 'unknown error'}` }, { status: 500 })
  }

  return NextResponse.json({ path: data.path, signedUrl: data.signedUrl })
}
