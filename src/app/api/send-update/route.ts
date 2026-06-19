import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { getWeekOf } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  const { updateId } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: update } = await supabase
    .from('updates')
    .select('*, projects(project_name, client_name, client_email, slug, color, user_id)')
    .eq('id', updateId)
    .single()

  if (!update) return NextResponse.json({ error: 'Update not found' }, { status: 404 })

  const project = update.projects
  if (project.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: owner } = await supabase
    .from('users')
    .select('name, email, accent_color, logo_url, plan')
    .eq('id', user.id)
    .single()

  if (!owner?.plan || owner.plan !== 'pro') {
    return NextResponse.json({ error: 'Auto email requires Pro plan' }, { status: 403 })
  }

  const accentColor = owner.accent_color ?? '#6366F1'
  const weekOf = getWeekOf(update.created_at)
  const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.slug}`

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
    <h1>${project.project_name}</h1>
    <p>${weekOf}</p>
  </div>
  <div class="body">
    <p style="color:#475569;margin-top:0;font-size:15px;">Hi ${esc(project.client_name)},</p>
    <p style="color:#475569;font-size:15px;">Here's your weekly progress update:</p>
    ${(update.bullets ?? []).filter(Boolean).map((b: string) => `<div class="bullet"><div class="dot"></div><div class="bullet-text">${esc(b)}</div></div>`).join('\n    ')}
    ${update.note ? `<div class="note">${esc(update.note)}</div>` : ''}
    <div class="cta">
      <a href="${esc(statusUrl)}">View full status page →</a>
    </div>
  </div>
  <div class="footer">
    Sent by ${esc(owner.name ?? 'your freelancer')} via Frevio
  </div>
</div>
</body>
</html>`

  const recipient = project.client_email ?? user.email!

  await resend.emails.send({
    from: `${owner.name ?? 'Frevio'} <updates@frevio.cloud>`,
    to: [recipient],
    subject: `${project.project_name} — ${weekOf}`,
    html,
  })

  await supabase.from('updates').update({ sent_at: new Date().toISOString() }).eq('id', updateId)

  return NextResponse.json({ success: true })
}
