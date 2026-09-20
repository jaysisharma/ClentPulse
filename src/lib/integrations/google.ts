/**
 * Google integration helpers — Drive and Calendar.
 * All functions call Google APIs server-side using a decrypted access token.
 * Never expose tokens to the client.
 */

// ---------------------------------------------------------------------------
// Account info
// ---------------------------------------------------------------------------

export async function getGoogleAccountInfo(accessToken: string): Promise<{
  id: string
  email: string
  name: string | null
}> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`)
  const data = await res.json()
  return { id: data.id, email: data.email, name: data.name ?? null }
}

// ---------------------------------------------------------------------------
// Google Drive
// ---------------------------------------------------------------------------

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string | null
  iconLink: string | null
  thumbnailLink: string | null
  modifiedTime: string | null
  size: string | null
  owners: Array<{ displayName: string; emailAddress: string }> | null
}

export function driveFileType(mimeType: string): 'folder' | 'file' {
  return mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file'
}

/**
 * Lists files/folders accessible to the connected account.
 * Optionally filter by a parent folder ID.
 */
export async function listDriveFiles(
  accessToken: string,
  options: {
    query?: string
    parentId?: string
    pageToken?: string
    pageSize?: number
  } = {}
): Promise<{ files: DriveFile[]; nextPageToken: string | null }> {
  const params = new URLSearchParams({
    fields: 'nextPageToken,files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime,size,owners)',
    pageSize: String(options.pageSize ?? 30),
    orderBy: 'modifiedTime desc',
  })

  const queryParts: string[] = ["trashed = false"]
  if (options.parentId) queryParts.push(`'${options.parentId}' in parents`)
  if (options.query) queryParts.push(`name contains '${options.query.replace(/'/g, "\\'")}'`)
  params.set('q', queryParts.join(' and '))
  if (options.pageToken) params.set('pageToken', options.pageToken)

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Drive list failed: ${res.status}`)
  }

  const data = await res.json()
  return {
    files: data.files ?? [],
    nextPageToken: data.nextPageToken ?? null,
  }
}

/**
 * Gets metadata for a single Drive file.
 */
export async function getDriveFile(accessToken: string, fileId: string): Promise<DriveFile | null> {
  const params = new URLSearchParams({
    fields: 'id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime,size,owners',
  })
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Drive file fetch failed: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Google Calendar
// ---------------------------------------------------------------------------

export interface CalendarEntry {
  id: string
  summary: string
  description: string | null
  location: string | null
  htmlLink: string
  status: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description: string | null
  location: string | null
  htmlLink: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  hangoutLink: string | null
  conferenceData?: {
    entryPoints?: Array<{ entryPointType: string; uri: string; label?: string }>
  }
  status: string
}

/**
 * Lists the user's calendars.
 */
export async function listCalendars(accessToken: string): Promise<CalendarEntry[]> {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items(id,summary,description,location,htmlLink,accessRole)',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`Calendar list failed: ${res.status}`)
  const data = await res.json()
  return data.items ?? []
}

/**
 * Lists upcoming events for a specific calendar.
 */
export async function listCalendarEvents(
  accessToken: string,
  calendarId: string,
  options: { maxResults?: number; timeMin?: string } = {}
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(options.maxResults ?? 10),
    timeMin: options.timeMin ?? new Date().toISOString(),
    fields: 'items(id,summary,description,location,htmlLink,start,end,hangoutLink,conferenceData,status)',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) throw new Error(`Calendar events fetch failed: ${res.status}`)
  const data = await res.json()
  return (data.items ?? []).filter((e: CalendarEvent) => e.status !== 'cancelled')
}
