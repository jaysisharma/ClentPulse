import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import {
  CLIENT_FILES_BUCKET,
  MAX_CLIENT_FILE_BYTES,
  MAX_CLIENT_FILES_PER_PROJECT,
  hasPortalAccess,
  sanitizeFileName,
} from '@/lib/client-files'
import { NextResponse } from 'next/server'

/**
 * POST /api/client-files/upload-url
 * Body: { slug, fileName, size }
 *
 * Issues a one-time signed upload URL so the client's browser uploads straight to
 * Supabase Storage (bypassing the 4.5 MB function body limit).
 */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const body = await request.json().catch(() => ({}))
  const { slug, fileName, size } = body as { slug?: string; fileName?: string; size?: number }

  if (!slug || !fileName) {
    return NextResponse.json({ error: 'slug and fileName are required' }, { status: 400 })
  }
  if (typeof size !== 'number' || size <= 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }
  if (size > MAX_CLIENT_FILE_BYTES) {
    return NextResponse.json({ error: 'Files must be 50 MB or smaller' }, { status: 413 })
  }

  const rl = await rateLimit(`client-file-upload:${ip}:${slug}`, 30, 10 * 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many uploads. Please try again in a few minutes.' }, { status: 429 })
  }

  const admin = createAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('id, slug, passcode')
    .eq('slug', slug)
    .maybeSingle()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (!(await hasPortalAccess(project))) {
    return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
  }

  const { count } = await admin
    .from('client_files')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', project.id)
  if ((count ?? 0) >= MAX_CLIENT_FILES_PER_PROJECT) {
    return NextResponse.json({ error: 'This project has reached its file limit. Please contact your studio.' }, { status: 409 })
  }

  const path = `${project.id}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`
  const { data, error } = await admin.storage.from(CLIENT_FILES_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: 'Could not prepare upload' }, { status: 500 })
  }

  return NextResponse.json({ path: data.path, token: data.token })
}
