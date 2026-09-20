import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchWebhook } from '@/lib/webhooks'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function emailLayout({
  title,
  subtitle,
  accentColor,
  bodyHtml,
  ctaText,
  ctaUrl,
}: {
  title: string
  subtitle: string
  accentColor: string
  bodyHtml: string
  ctaText: string
  ctaUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Inter',sans-serif;margin:0;padding:0;background:#f8fafc;color:#1e293b">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);border:1px solid #e2e8f0">
    <div style="background:${accentColor};padding:24px 32px">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">
        ${esc(subtitle)}
      </div>
      <div style="font-size:20px;font-weight:700;color:#ffffff;line-height:1.2">
        ${esc(title)}
      </div>
    </div>
    <div style="padding:28px 32px">
      ${bodyHtml}
      <div style="margin-top:28px;text-align:center">
        <a href="${esc(ctaUrl)}" style="background:${accentColor};color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">
          ${esc(ctaText)} →
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8">
      Frevio · Instant client activity alert
    </div>
  </div>
</body>
</html>`
}

/**
 * Notify freelancer when a client comments on a project status update.
 */
export async function notifyFreelancerOfComment({
  projectId,
  updateId,
  authorName,
  commentBody,
}: {
  projectId: string
  updateId: string
  authorName: string
  commentBody: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const admin = createAdminClient()

    const { data: project } = await admin
      .from('projects')
      .select('project_name, client_name, user_id, slug')
      .eq('id', projectId)
      .single()

    if (!project) return

    const { data: owner } = await admin
      .from('users')
      .select('name, email, accent_color')
      .eq('id', project.user_id)
      .single()

    if (!owner?.email) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const projectUrl = `${appUrl}/project/${projectId}`
    const accent = owner.accent_color || '#6366F1'

    const bodyHtml = `
      <p style="font-size:15px;color:#334155;margin-top:0">
        Hi ${esc(owner.name || 'there')},
      </p>
      <p style="font-size:15px;color:#334155;line-height:1.5">
        <strong>${esc(authorName)}</strong> left a comment on an update for <strong>${esc(project.project_name)}</strong>:
      </p>
      <div style="background:#f8fafc;border-left:3px solid ${accent};border-radius:4px;padding:14px 16px;margin:18px 0;font-size:14px;color:#334155;line-height:1.6;font-style:italic">
        "${esc(commentBody)}"
      </div>
    `

    await resend.emails.send({
      from: 'Frevio <notifications@frevio.cloud>',
      to: [owner.email],
      subject: `[${project.project_name}] New comment from ${authorName}`,
      html: emailLayout({
        title: project.project_name,
        subtitle: 'New Client Comment',
        accentColor: accent,
        bodyHtml,
        ctaText: 'View in Project Dashboard',
        ctaUrl: projectUrl,
      }),
    })

    // Dispatch Slack/Discord webhook if configured in environment or project
    const webhookTarget = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
    if (webhookTarget) {
      await dispatchWebhook(webhookTarget, {
        title: `New Client Comment: ${project.project_name}`,
        message: `${authorName}: "${commentBody}"`,
        projectName: project.project_name,
        clientName: project.client_name,
        actionUrl: projectUrl,
        type: 'comment',
      })
    }
  } catch (err) {
    console.error('Error sending comment notification email:', err)
  }
}

/**
 * Notify freelancer when a client submits status feedback (thumbs up/down or message).
 */
export async function notifyFreelancerOfFeedback({
  projectId,
  type,
  message,
}: {
  projectId: string
  type: 'thumbs_up' | 'thumbs_down' | 'question' | string
  message?: string | null
}) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const admin = createAdminClient()

    const { data: project } = await admin
      .from('projects')
      .select('project_name, client_name, user_id, slug')
      .eq('id', projectId)
      .single()

    if (!project) return

    const { data: owner } = await admin
      .from('users')
      .select('name, email, accent_color')
      .eq('id', project.user_id)
      .single()

    if (!owner?.email) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const projectUrl = `${appUrl}/project/${projectId}`
    const accent = owner.accent_color || '#6366F1'

    let reactionLabel = 'Client Feedback'
    let reactionEmoji = '💬'
    if (type === 'thumbs_up') {
      reactionLabel = 'Looking good'
      reactionEmoji = '👍'
    } else if (type === 'thumbs_down') {
      reactionLabel = 'Have concerns'
      reactionEmoji = '⚠️'
    } else if (type === 'question') {
      reactionLabel = 'Client message'
      reactionEmoji = '💬'
    }

    const bodyHtml = `
      <p style="font-size:15px;color:#334155;margin-top:0">
        Hi ${esc(owner.name || 'there')},
      </p>
      <p style="font-size:15px;color:#334155;line-height:1.5">
        Your client <strong>${esc(project.client_name)}</strong> left feedback on <strong>${esc(project.project_name)}</strong>:
      </p>
      <div style="display:inline-block;padding:8px 14px;border-radius:20px;background:#f1f5f9;font-size:14px;font-weight:600;color:#1e293b;margin:8px 0 16px">
        ${reactionEmoji} ${esc(reactionLabel)}
      </div>
      ${
        message?.trim()
          ? `<div style="background:#f8fafc;border-left:3px solid ${accent};border-radius:4px;padding:14px 16px;margin:10px 0 18px;font-size:14px;color:#334155;line-height:1.6">
              "${esc(message.trim())}"
             </div>`
          : ''
      }
    `

    await resend.emails.send({
      from: 'Frevio <notifications@frevio.cloud>',
      to: [owner.email],
      subject: `[${project.project_name}] Client feedback: ${reactionEmoji} ${reactionLabel}`,
      html: emailLayout({
        title: project.project_name,
        subtitle: 'Status Page Feedback',
        accentColor: accent,
        bodyHtml,
        ctaText: 'View Project',
        ctaUrl: projectUrl,
      }),
    })

    const webhookTarget = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
    if (webhookTarget) {
      await dispatchWebhook(webhookTarget, {
        title: `Client Feedback: ${project.project_name}`,
        message: `${reactionEmoji} ${reactionLabel}${message?.trim() ? `: "${message.trim()}"` : ''}`,
        projectName: project.project_name,
        clientName: project.client_name,
        actionUrl: projectUrl,
        type: 'feedback',
      })
    }
  } catch (err) {
    console.error('Error sending feedback notification email:', err)
  }
}

/**
 * Notify freelancer when a client approves or requests changes on a deliverable.
 */
export async function notifyFreelancerOfApproval({
  approvalId,
  status,
  feedback,
}: {
  approvalId: string
  status: 'approved' | 'declined' | string
  feedback?: string | null
}) {
  try {
    if (!process.env.RESEND_API_KEY) return
    const admin = createAdminClient()

    const { data: approval } = await admin
      .from('approvals')
      .select('title, project_id, url')
      .eq('id', approvalId)
      .single()

    if (!approval) return

    const { data: project } = await admin
      .from('projects')
      .select('project_name, client_name, user_id, slug')
      .eq('id', approval.project_id)
      .single()

    if (!project) return

    const { data: owner } = await admin
      .from('users')
      .select('name, email, accent_color')
      .eq('id', project.user_id)
      .single()

    if (!owner?.email) return

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const projectUrl = `${appUrl}/project/${approval.project_id}#approvals`
    const accent = owner.accent_color || '#6366F1'

    const isApproved = status === 'approved'
    const statusText = isApproved ? 'Approved ✅' : 'Changes Requested ⚠️'
    const statusColor = isApproved ? '#16a34a' : '#ea580c'

    const bodyHtml = `
      <p style="font-size:15px;color:#334155;margin-top:0">
        Hi ${esc(owner.name || 'there')},
      </p>
      <p style="font-size:15px;color:#334155;line-height:1.5">
        <strong>${esc(project.client_name)}</strong> responded to your approval request for <strong>${esc(approval.title)}</strong>:
      </p>
      <div style="display:inline-block;padding:8px 16px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;font-size:14px;font-weight:700;color:${statusColor};margin:8px 0 16px">
        ${statusText}
      </div>
      ${
        feedback?.trim()
          ? `<div style="background:#f8fafc;border-left:3px solid ${statusColor};border-radius:4px;padding:14px 16px;margin:10px 0 18px;font-size:14px;color:#334155;line-height:1.6">
              <strong>Client notes:</strong><br/>
              "${esc(feedback.trim())}"
             </div>`
          : ''
      }
    `

    await resend.emails.send({
      from: 'Frevio <notifications@frevio.cloud>',
      to: [owner.email],
      subject: `[${project.project_name}] Deliverable ${statusText}: ${approval.title}`,
      html: emailLayout({
        title: project.project_name,
        subtitle: `Deliverable ${status === 'approved' ? 'Approved' : 'Declined'}`,
        accentColor: accent,
        bodyHtml,
        ctaText: 'Review in Dashboard',
        ctaUrl: projectUrl,
      }),
    })

    const webhookTarget = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
    if (webhookTarget) {
      await dispatchWebhook(webhookTarget, {
        title: `Deliverable ${statusText}: ${approval.title}`,
        message: `${project.client_name} marked deliverable "${approval.title}" as ${statusText}.${feedback?.trim() ? ` Notes: "${feedback.trim()}"` : ''}`,
        projectName: project.project_name,
        clientName: project.client_name,
        actionUrl: projectUrl,
        type: 'approval',
      })
    }
  } catch (err) {
    console.error('Error sending approval notification email:', err)
  }
}
