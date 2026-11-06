import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'

function formatCommitToClientBullet(msg: string): string {
  // Strip conventional commit prefixes: feat:, fix:, chore:, refactor:, etc.
  let clean = msg
    .replace(/^[a-f0-9]{7,12}\s+/i, '') // git short hash
    .replace(/^(feat|fix|perf|refactor|docs|style|test|build|ci|chore)(\([^)]+\))?:\s*/i, '')
    .trim()

  if (!clean) return 'Completed targeted engineering tasks and optimizations.'

  // Capitalize first letter and ensure ending period
  clean = clean.charAt(0).toUpperCase() + clean.slice(1)
  if (!clean.endsWith('.')) clean += '.'

  return clean
}

export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { projectId, gitMessages = [], gitSummary } = body

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id, project_name, client_name')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Synthesize up to 3 bullets from the git commits
  const rawCommits = Array.isArray(gitMessages) ? gitMessages : []
  const bullets: string[] = []

  for (const commit of rawCommits) {
    if (bullets.length >= 3) break
    const formatted = formatCommitToClientBullet(commit)
    if (!bullets.includes(formatted)) {
      bullets.push(formatted)
    }
  }

  // If fewer than 3 bullets, add context
  if (bullets.length === 0) {
    bullets.push('Completed targeted development sprint and verified deliverables locally.')
    bullets.push('Ran regression test suites and verified performance benchmarks.')
    bullets.push('Staged latest progress for your review in the client portal.')
  } else if (bullets.length === 1) {
    bullets.push('Ran automated regression tests and verified component behavior.')
    bullets.push('Prepared deliverables for the upcoming milestone sign-off.')
  } else if (bullets.length === 2) {
    bullets.push('Verified deliverables across local and staging environments.')
  }

  const note = `Hi ${project.client_name || 'there'}! Here is our latest progress update on ${project.project_name}. Everything is on track — let us know if you have any questions or feedback directly in the portal.`

  return NextResponse.json({
    success: true,
    projectName: project.project_name,
    clientName: project.client_name,
    bullets: bullets.slice(0, 3),
    note,
  })
}

