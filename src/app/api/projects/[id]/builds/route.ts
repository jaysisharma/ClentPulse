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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: builds, error } = await supabase
    .from('app_builds')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ builds })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await supabase
    .from('projects')
    .select('id, project_name, client_name, client_email, slug, user_id, org_id')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Check user permission (direct owner or org member)
  if (project.user_id !== user.id) {
    if (project.org_id) {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const body = await request.json()
  const {
    version_name,
    build_number,
    platform = 'android',
    environment = 'staging',
    file_url,
    file_size_bytes,
    min_os_version = 'Android 8.0+',
    changelog,
    notify_client = false,
  } = body

  if (!version_name || typeof version_name !== 'string' || !version_name.trim()) {
    return NextResponse.json({ error: 'Version name is required (e.g. v1.0.4)' }, { status: 400 })
  }

  if (!file_url || typeof file_url !== 'string' || !file_url.trim()) {
    return NextResponse.json({ error: 'APK file or download URL is required' }, { status: 400 })
  }

  const insertData = {
    project_id: id,
    user_id: user.id,
    version_name: version_name.trim(),
    build_number: build_number ? String(build_number).trim() : null,
    platform: platform === 'ios' ? 'ios' : platform === 'universal' ? 'universal' : 'android',
    environment: ['internal_beta', 'client_review', 'production'].includes(environment)
      ? environment
      : 'staging',
    file_url: file_url.trim(),
    file_size_bytes: file_size_bytes ? Number(file_size_bytes) : null,
    min_os_version: min_os_version ? String(min_os_version).trim() : 'Android 8.0+',
    changelog: changelog ? String(changelog).trim() : null,
    is_active: true,
  }

  const { data: build, error } = await supabase
    .from('app_builds')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Optionally send email notification to client
  let emailSent = false
  if (notify_client && project.client_email) {
    try {
      const { data: owner } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single()

      const senderName = owner?.name || 'Your development team'
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'}/p/${project.slug}`
      const envLabel = environment === 'production'
        ? 'Production Release'
        : environment === 'client_review'
        ? 'Client Review Build'
        : environment === 'internal_beta'
        ? 'Internal Beta'
        : 'Staging / Test Build'

      await resend.emails.send({
        from: 'Frevio <updates@frevio.cloud>',
        to: [project.client_email],
        replyTo: owner?.email || undefined,
        subject: `New Android Build Ready: ${version_name} — ${project.project_name}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:0;background:#f8fafc;color:#0f172a">
<div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -2px rgba(0,0,0,0.06);border:1px solid #e2e8f0;padding:36px 32px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#10b981;background:#ecfdf5;border:1px solid #a7f3d0;padding:3px 10px;border-radius:999px">
      ${esc(envLabel)}
    </div>
  </div>
  
  <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px 0;line-height:1.3">
    New Android APK Build Ready for Testing
  </h2>
  <p style="font-size:14px;color:#64748b;margin:0 0 20px 0;line-height:1.5">
    A new test build of <strong>${esc(project.project_name)}</strong> (Version <strong>${esc(version_name)}</strong>${build_number ? ` · Build #${esc(build_number)}` : ''}) has been published to your client portal.
  </p>

  ${changelog ? `
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:24px">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:8px">What's New in this Build</div>
    <div style="font-size:13px;color:#334155;line-height:1.6;white-space:pre-wrap">${esc(changelog)}</div>
  </div>` : ''}

  <div style="text-align:center;margin:28px 0 20px 0">
    <a href="${portalUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:999px;box-shadow:0 2px 8px rgba(15,23,42,0.15)">
      Open Portal & Install APK →
    </a>
  </div>

  <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0;line-height:1.5">
    You can install the APK directly on your Android phone with 1-tap, or scan the on-screen QR code from your computer.
  </p>
</div>
</body>
</html>`,
      })
      emailSent = true
    } catch (err) {
      console.error('[AppBuild Email Notify Error]', err)
    }
  }

  return NextResponse.json({ build, emailSent })
}
