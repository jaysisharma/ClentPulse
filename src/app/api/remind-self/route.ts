import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('project_name, client_name, slug')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const { data: owner } = await supabase
    .from('users')
    .select('name, accent_color')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const updateUrl = `${appUrl}/project/${projectId}/update`
  const accent = owner?.accent_color ?? '#6366F1'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Inter',sans-serif;margin:0;padding:0;background:#f8fafc">
<div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
  <div style="background:${accent};padding:24px 32px">
    <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Update reminder</div>
    <div style="font-size:20px;font-weight:700;color:white">${project.project_name}</div>
  </div>
  <div style="padding:28px 32px">
    <p style="color:#475569;margin-top:0;font-size:15px">Hi ${owner?.name ?? 'there'},</p>
    <p style="color:#475569;font-size:15px">
      You haven't sent an update to <strong>${project.client_name}</strong> in over 7 days.
      Keep your client in the loop — it only takes 2 minutes.
    </p>
    <div style="margin-top:24px;text-align:center">
      <a href="${updateUrl}" style="background:${accent};color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">
        Send update now →
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8">
    ClientPulse · You requested this reminder
  </div>
</div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'ClientPulse <reminders@clientpulse.app>',
    to: [user.email!],
    subject: `Reminder: send an update for ${project.project_name}`,
    html,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
