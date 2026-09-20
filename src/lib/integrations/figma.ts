/**
 * Figma API helpers — file listing and metadata.
 * All calls server-side using the user's decrypted access token.
 */

const FIGMA_API = 'https://api.figma.com/v1'

async function figmaFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `Figma API error: ${res.status}`)
  }
  return res.json()
}

export interface FigmaUser {
  id: string
  email: string
  handle: string
  img_url: string
}

export interface FigmaFile {
  key: string
  name: string
  thumbnail_url: string | null
  last_modified: string
  editorType?: string
  project_id?: string | null
}

export interface FigmaProject {
  id: string
  name: string
}

export interface FigmaTeam {
  id: string
  name: string
}

export async function getFigmaUser(accessToken: string): Promise<FigmaUser> {
  return figmaFetch<FigmaUser>('/me', accessToken)
}

/**
 * Lists recent Figma files accessible to the user.
 * Uses the /me/files endpoint (personal drafts + shared with me).
 */
export async function listFigmaFiles(accessToken: string): Promise<FigmaFile[]> {
  // Figma does not have a global "all files" endpoint.
  // The best we can do without a team ID is list the user's personal draft files.
  const data = await figmaFetch<{ files: FigmaFile[] }>('/me/files?page_size=30', accessToken)
  return data.files ?? []
}

/**
 * Lists files in a specific Figma project.
 */
export async function listProjectFiles(
  accessToken: string,
  projectId: string
): Promise<FigmaFile[]> {
  const data = await figmaFetch<{ files: FigmaFile[] }>(`/projects/${projectId}/files`, accessToken)
  return data.files ?? []
}

/**
 * Lists projects for a specific Figma team.
 */
export async function listTeamProjects(
  accessToken: string,
  teamId: string
): Promise<FigmaProject[]> {
  const data = await figmaFetch<{ projects: FigmaProject[] }>(`/teams/${teamId}/projects`, accessToken)
  return data.projects ?? []
}

/**
 * Gets metadata for a single Figma file.
 */
export async function getFigmaFileMeta(
  accessToken: string,
  fileKey: string
): Promise<{ name: string; thumbnail_url: string | null; last_modified: string } | null> {
  try {
    const data = await figmaFetch<{
      name: string
      thumbnailUrl?: string
      lastModified?: string
    }>(`/files/${fileKey}?depth=1`, accessToken)
    return {
      name: data.name,
      thumbnail_url: data.thumbnailUrl ?? null,
      last_modified: data.lastModified ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

/**
 * Returns the Figma file edit/view URL for a given file key.
 */
export function figmaFileUrl(fileKey: string): string {
  return `https://www.figma.com/design/${fileKey}`
}
