import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, message } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, slug, waiting_reason, user_id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  if (!project.client_email) {
    return NextResponse.json({ error: 'No client email configured for this project' }, { status: 400 })
  }

  const { data: owner } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const freelancerName = owner?.name || 'Your studio lead'
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'}/p/${project.slug}`
  const reasonText = message || project.waiting_reason || 'There are pending items requiring your feedback or approval.'

  const { error: emailErr } = await resend.emails.send({
    from: 'Frevio <updates@frevio.cloud>',
    to: [project.client_email],
    replyTo: owner?.email || undefined,
    subject: `Action Needed: ${project.project_name} — Project Update`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:0;background:#f8fafc;color:#0f172a">
<div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(0,0,0,0.06);border:1px solid #e2e8f0;padding:36px 32px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px">
    <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366F1">Project Nudge</div>
  </div>
  
  <h1 style="font-size:20px;font-weight:600;margin:0 0 12px;color:#0f172a;line-height:1.3">
    ${esc(freelancerName)} is waiting on your input for ${esc(project.project_name)}
  </h1>
  
  <p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 20px">
    Hi ${esc(project.client_name)},
  </p>

  <div style="background:#f1f5f9;border-left:4px solid #6366F1;border-radius:8px;padding:16px;margin:0 0 24px">
    <p style="font-size:14px;color:#334155;line-height:1.5;margin:0;font-weight:500">
      ${esc(reasonText)}
    </p>
  </div>

  <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 28px">
    Please review the status page to unblock the next milestone and keep project delivery on schedule.
  </p>

  <div style="text-align:center;margin-bottom:28px">
    <a href="${portalUrl}" style="background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;font-size:13px;display:inline-block">
      Open Project Portal →
    </a>
  </div>

  <div style="border-top:1px solid #f1f5f9;padding-top:16px;text-align:center">
    <p style="font-size:11px;color:#94a3b8;margin:0">
      Sent via Frevio · The operating system for modern freelancers
    </p>
  </div>
</div>
</body>
</html>
`,
  })

  if (emailErr) {
    console.error('Failed to send client reminder email:', emailErr)
    return NextResponse.json({ error: 'Failed to dispatch email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
