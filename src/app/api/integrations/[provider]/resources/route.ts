import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidProvider, getDecryptedConnection } from '@/lib/integrations/oauth'

/**
 * GET /api/integrations/[provider]/resources
 *
 * Fetches available resources from the connected provider.
 * Used by pickers in the project integration panel.
 *
 * Query params by provider:
 *   google: ?type=drive&parentId=...&q=...  OR  ?type=calendar&calendarId=...
 *   github: ?type=repos  OR  ?type=prs&repo=owner/name  OR  ?type=commits&repo=owner/name
 *   figma:  ?type=files  OR  ?type=project_files&projectId=...
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conn = await getDecryptedConnection(supabase, user.id, provider)
  if (!conn) {
    return NextResponse.json(
      { error: 'Not connected. Please connect your account first.' },
      { status: 404 }
    )
  }

  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  try {
    if (provider === 'google') {
      if (type === 'drive') {
        const { listDriveFiles } = await import('@/lib/integrations/google')
        const parentId = url.searchParams.get('parentId') || undefined
        const q = url.searchParams.get('q') || undefined
        const pageToken = url.searchParams.get('pageToken') || undefined
        const result = await listDriveFiles(conn.accessToken, { parentId, query: q, pageToken })
        return NextResponse.json(result)
      }
      if (type === 'calendars') {
        const { listCalendars } = await import('@/lib/integrations/google')
        const calendars = await listCalendars(conn.accessToken)
        return NextResponse.json({ calendars })
      }
      if (type === 'calendar_events') {
        const { listCalendarEvents } = await import('@/lib/integrations/google')
        const calendarId = url.searchParams.get('calendarId')
        if (!calendarId) return NextResponse.json({ error: 'calendarId required' }, { status: 400 })
        const events = await listCalendarEvents(conn.accessToken, calendarId, { maxResults: 20 })
        return NextResponse.json({ events })
      }
      return NextResponse.json({ error: 'type must be drive, calendars, or calendar_events' }, { status: 400 })
    }

    if (provider === 'github') {
      if (type === 'repos' || !type) {
        const { listRepos } = await import('@/lib/integrations/github')
        const repos = await listRepos(conn.accessToken)
        return NextResponse.json({ repos })
      }
      if (type === 'prs') {
        const repo = url.searchParams.get('repo')
        if (!repo || !repo.includes('/')) {
          return NextResponse.json({ error: 'repo must be owner/name' }, { status: 400 })
        }
        const [owner, name] = repo.split('/')
        const { listPullRequests, summarizePR } = await import('@/lib/integrations/github')
        const prs = await listPullRequests(conn.accessToken, owner, name, { state: 'all', perPage: 15 })
        return NextResponse.json({ prs: prs.map(summarizePR) })
      }
      if (type === 'commits') {
        const repo = url.searchParams.get('repo')
        if (!repo || !repo.includes('/')) {
          return NextResponse.json({ error: 'repo must be owner/name' }, { status: 400 })
        }
        const [owner, name] = repo.split('/')
        const { listCommits } = await import('@/lib/integrations/github')
        const commits = await listCommits(conn.accessToken, owner, name, { perPage: 5 })
        return NextResponse.json({ commits })
      }
      return NextResponse.json({ error: 'type must be repos, prs, or commits' }, { status: 400 })
    }

    if (provider === 'figma') {
      if (type === 'files' || !type) {
        const { listFigmaFiles } = await import('@/lib/integrations/figma')
        const files = await listFigmaFiles(conn.accessToken)
        return NextResponse.json({ files })
      }
      if (type === 'project_files') {
        const projectId = url.searchParams.get('projectId')
        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })
        const { listProjectFiles } = await import('@/lib/integrations/figma')
        const files = await listProjectFiles(conn.accessToken, projectId)
        return NextResponse.json({ files })
      }
      return NextResponse.json({ error: 'type must be files or project_files' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  } catch (err: any) {
    console.error(`[GET /api/integrations/${provider}/resources]`, err?.message)

    // Detect rate limiting
    if (err?.message?.includes('403') || err?.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Provider rate limit reached. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: err?.message || 'Failed to fetch resources from provider' },
      { status: 502 }
    )
  }
}
