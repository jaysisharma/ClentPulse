import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { projectId, title, url, previewType = 'figma', notes, notifyClient = true } = body

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid projectId' }, { status: 400 })
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 1. Verify project ownership
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, user_id, project_name, client_name, client_email, slug')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // 2. Insert approval deliverable
  const { data: approval, error: approvalError } = await admin
    .from('approvals')
    .insert({
      project_id: projectId,
      title: title.trim(),
      url: url && typeof url === 'string' ? url.trim() : null,
      preview_type: previewType || 'figma',
      status: 'pending',
    })
    .select()
    .single()

  if (approvalError || !approval) {
    return NextResponse.json({ error: approvalError?.message || 'Failed to create deliverable' }, { status: 500 })
  }

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'}/p/${project.slug}`

  // 3. Optionally notify client via email if configured
  let emailSent = false
  if (notifyClient && project.client_email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Frevio Updates <updates@frevio.cloud>',
        to: [project.client_email],
        subject: `New Design Deliverable Ready for Review: ${title.trim()} — ${project.project_name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${project.client_name || 'there'},</p>
            <p style="font-size: 15px; line-height: 1.5; color: #333;">
              A new design deliverable <strong>"${title.trim()}"</strong> is ready for your review and sign-off on <strong>${project.project_name}</strong>.
            </p>
            ${notes ? `<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #6366F1; background: #f8fafc; font-style: italic; color: #475569;">${notes}</blockquote>` : ''}
            <div style="margin: 28px 0;">
              <a href="${portalUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Review & Approve in Portal →</a>
            </div>
          </div>
        `,
      })
      emailSent = true
    } catch {
      // Non-fatal if email dispatch fails
    }
  }

  return NextResponse.json({
    success: true,
    approval,
    portalUrl,
    emailSent,
    projectName: project.project_name,
    clientName: project.client_name,
  })
}

