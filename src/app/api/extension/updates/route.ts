import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAndSyncPromoPlan, isPaidPlan } from '@/lib/plans'
import { Resend } from 'resend'
import { getWeekOf } from '@/lib/utils'
import { logAgencyActivity } from '@/lib/activity'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

  const { projectId, bullets: rawBullets, note } = body
  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }

  // Normalize bullets: accepts string[] or a single string split by semicolons/newlines
  let bullets: string[] = []
  if (Array.isArray(rawBullets)) {
    bullets = rawBullets.map((b: any) => String(b).trim()).filter(Boolean)
  } else if (typeof rawBullets === 'string') {
    bullets = rawBullets
      .split(/[;\n]/)
      .map(b => b.trim())
      .filter(Boolean)
  }

  if (bullets.length === 0) {
    return NextResponse.json({ error: 'Please provide at least one bullet point describing what was updated.' }, { status: 400 })
  }

  const cleanNote = typeof note === 'string' && note.trim() ? note.trim().slice(0, 1000) : null
  const admin = createAdminClient()

  // 1. Verify project exists & user has permissions
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, user_id, project_name, client_name, client_email, slug, color, org_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  let hasPermission = project.user_id === auth.userId
  if (!hasPermission && project.org_id) {
    const { data: membership } = await admin
      .from('organization_members')
      .select('role')
      .eq('org_id', project.org_id)
      .eq('user_id', auth.userId)
      .maybeSingle()

    if (membership && ['owner', 'admin'].includes(membership.role)) {
      hasPermission = true
    }
  }

  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden. You do not have permission to post updates for this project.' }, { status: 403 })
  }

  // 2. Fetch owner profile for email branding & plan verification
  const { data: owner } = await admin
    .from('users')
    .select('id, name, email, accent_color, logo_url, plan, promo_pro, created_at')
    .eq('id', auth.userId)
    .single()

  if (!owner) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  const nowIso = new Date().toISOString()

  // 3. Insert update into updates table
  const { data: newUpdate, error: insertError } = await admin
    .from('updates')
    .insert({
      project_id: project.id,
      bullets,
      note: cleanNote,
      sent_at: nowIso,
      review_status: 'published',
      author_id: auth.userId,
    })
    .select('id, created_at, sent_at')
    .single()

  if (insertError || !newUpdate) {
    return NextResponse.json({ error: `Failed to save update: ${insertError?.message || 'Unknown error'}` }, { status: 500 })
  }

  // 4. Send client notification email if owner has Pro/Paid plan
  let emailSent = false
  const syncedPlan = await checkAndSyncPromoPlan(owner, admin)
  const canSendEmail = isPaidPlan(syncedPlan) && Boolean(process.env.RESEND_API_KEY)

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.frevio.cloud').replace(/\/+$/, '')
  const statusUrl = `${appUrl}/p/${project.slug}`
  const weekOf = getWeekOf(newUpdate.created_at || nowIso)
  const recipient = project.client_email ?? owner.email

  if (canSendEmail && recipient && resend) {
    const accentColor = owner.accent_color ?? project.color ?? '#6366F1'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, 'Inter', sans-serif; margin: 0; padding: 0; background: #f8fafc; }
  .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .header { background: ${accentColor}; padding: 28px 32px; }
  .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; }
  .header p { color: rgba(255,255,255,.8); margin: 4px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .bullet { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${accentColor}; margin-top: 6px; flex-shrink: 0; }
  .bullet-text { font-size: 15px; color: #334155; line-height: 1.6; }
  .note { background: #f8fafc; border-left: 3px solid ${accentColor}; padding: 12px 16px; border-radius: 4px; margin-top: 20px; font-size: 14px; color: #64748b; }
  .cta { margin-top: 28px; text-align: center; }
  .cta a { background: ${accentColor}; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; }
  .footer { padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>${esc(project.project_name)}</h1>
    <p>${esc(weekOf)}</p>
  </div>
  <div class="body">
    <p style="color:#475569;margin-top:0;font-size:15px;">Hi ${esc(project.client_name)},</p>
    <p style="color:#475569;font-size:15px;">Here is the latest progress update directly from the development workspace:</p>
    ${bullets.map(b => `<div class="bullet"><div class="dot"></div><div class="bullet-text">${esc(b)}</div></div>`).join('\n    ')}
    ${cleanNote ? `<div class="note">${esc(cleanNote)}</div>` : ''}
    <div class="cta">
      <a href="${esc(statusUrl)}">View full live status portal &rarr;</a>
    </div>
  </div>
  <div class="footer">
    Sent by ${esc(owner.name ?? 'your developer')} via Frevio Editor Extension
  </div>
</div>
</body>
</html>`

    try {
      await resend.emails.send({
        from: `${owner.name ?? 'Frevio'} <updates@frevio.cloud>`,
        to: [recipient],
        subject: `${project.project_name} — ${weekOf}`,
        html,
      })
      emailSent = true
    } catch {
      // If email delivery fails, the update is still published to the client portal
      emailSent = false
    }

    if (project.org_id) {
      await logAgencyActivity({
        supabase: admin,
        orgId: project.org_id,
        projectId: project.id,
        userId: auth.userId,
        action: 'update.published',
        entityType: 'update',
        entityId: newUpdate.id,
        details: {
          week_of: weekOf,
          recipient,
          source: 'vscode_extension',
        },
      }).catch(() => {})
    }
  }

  return NextResponse.json({
    success: true,
    updateId: newUpdate.id,
    projectId: project.id,
    projectName: project.project_name,
    clientName: project.client_name,
    clientEmail: project.client_email,
    bulletsCount: bullets.length,
    emailSent,
    portalUrl: statusUrl,
  })
}
