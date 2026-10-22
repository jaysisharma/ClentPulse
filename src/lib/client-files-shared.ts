// Constants, types and pure helpers safe to import from client components.

export const CLIENT_FILES_BUCKET = 'client-files'
export const MAX_CLIENT_FILE_BYTES = 50 * 1024 * 1024
export const MAX_CLIENT_FILES_PER_PROJECT = 100

export interface ClientFile {
  id: string
  project_id: string
  file_name: string
  storage_path: string
  size_bytes: number | null
  content_type: string | null
  uploaded_by: 'client' | 'studio'
  created_at: string
  download_url?: string | null
}

/** Strips path separators and unsafe characters so a client-supplied name can't escape the project folder. */
export function sanitizeFileName(name: string): string {
  const base = String(name ?? '').split(/[\\/]/).pop() ?? ''
  const cleaned = base
    .replace(/[^\w.\- ()]+/g, '_')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 120)
  return cleaned || 'file'
}

/** True when the path was issued for this project by the upload-url route. */
export function isProjectFilePath(path: unknown, projectId: string): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith(`${projectId}/`) &&
    !path.includes('..') &&
    path.split('/').length === 2
  )
}
