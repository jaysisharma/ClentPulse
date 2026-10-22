import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  CLIENT_FILES_BUCKET,
  MAX_CLIENT_FILE_BYTES,
  hasPortalAccess,
  isProjectFilePath,
  sanitizeFileName,
  type ClientFile,
} from '@/lib/client-files'
import { notifyFreelancerOfClientFiles } from '@/lib/notifications'
import { NextResponse } from 'next/server'

type AdminClient = ReturnType<typeof createAdminClient>

async function withDownloadUrls(admin: AdminClient, files: ClientFile[]): Promise<ClientFile[]> {
  return Promise.all(
    files.map(async file => {
      const { data } = await admin.storage
        .from(CLIENT_FILES_BUCKET)
        .createSignedUrl(file.storage_path, 60 * 60, { download: file.file_name })
      return { ...file, download_url: data?.signedUrl ?? null }
    })
  )
}

async function canStudioAccess(projectId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: project } = await supabase
    .from('projects')
    .select('user_id, org_id')
    .eq('id', projectId)
    .maybeSingle()
  if (!project) return false
  if (project.user_id === user.id) return true

  if (project.org_id) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', user.id)
      .maybeSingle()
    return !!member
  }
  return false
}

/**
 * GET /api/client-files?slug=...       (client portal)
 * GET /api/client-files?projectId=...  (studio)
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const slug = params.get('slug')
  const projectId = params.get('projectId')
  const admin = createAdminClient()

  let resolvedProjectId: string | null = null

  if (projectId) {
    if (!(await canStudioAccess(projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    resolvedProjectId = projectId
  } else if (slug) {
    const { data: project } = await admin
      .from('projects')
      .select('id, slug, passcode')
      .eq('slug', slug)
      .maybeSingle()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (!(await hasPortalAccess(project))) {
      return NextResponse.json({ error: 'Passcode verification required for this portal' }, { status: 401 })
    }
    resolvedProjectId = project.id
  } else {
    return NextResponse.json({ error: 'slug or projectId required' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('client_files')
    .select('*')
    .eq('project_id', resolvedProjectId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ files: await withDownloadUrls(admin, (data ?? []) as ClientFile[]) })
}

/**
 * POST /api/client-files
 * Body: { slug, files: [{ path, fileName }] }
 *
 * Records files the client just uploaded via signed URLs, then emails the studio once.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { slug, files } = body as { slug?: string; files?: { path?: string; fileName?: string }[] }

  if (!slug || !Array.isArray(files) || files.length === 0 || files.length > 20) {
    return NextResponse.json({ error: 'slug and 1–20 files are required' }, { status: 400 })
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

  const bucket = admin.storage.from(CLIENT_FILES_BUCKET)
  const rows: Omit<ClientFile, 'id' | 'created_at'>[] = []

  for (const file of files) {
    if (!isProjectFilePath(file.path, project.id)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Trust storage, not the browser, for whether the object exists and how big it is
    const { data: info, error: infoError } = await bucket.info(file.path)
    if (infoError || !info) {
      return NextResponse.json({ error: 'Upload not found. Please try again.' }, { status: 400 })
    }
    if ((info.size ?? 0) > MAX_CLIENT_FILE_BYTES) {
      await bucket.remove([file.path])
      return NextResponse.json({ error: 'Files must be 50 MB or smaller' }, { status: 413 })
    }

    rows.push({
      project_id: project.id,
      file_name: sanitizeFileName(file.fileName ?? file.path.split('/').pop() ?? 'file'),
      storage_path: file.path,
      size_bytes: info.size ?? null,
      content_type: info.contentType ?? null,
      uploaded_by: 'client',
    })
  }

  const { data: inserted, error } = await admin
    .from('client_files')
    .upsert(rows, { onConflict: 'storage_path', ignoreDuplicates: true })
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (inserted && inserted.length > 0) {
    await notifyFreelancerOfClientFiles({
      projectId: project.id,
      fileNames: inserted.map(f => f.file_name),
    })
  }

  return NextResponse.json({ files: await withDownloadUrls(admin, (inserted ?? []) as ClientFile[]) })
}
