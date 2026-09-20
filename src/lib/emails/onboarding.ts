import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sends a concise, helpful Welcome email upon signup.
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string
  name?: string | null
}) {
  if (!process.env.RESEND_API_KEY) return { success: false, error: 'RESEND_API_KEY missing' }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Frevio <login@frevio.cloud>'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'
  const firstName = name ? name.split(' ')[0] : 'there'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
      <div style="margin-bottom: 24px;">
        <div style="display: inline-block; width: 32px; height: 32px; background: #6366F1; border-radius: 8px; vertical-align: middle;"></div>
        <span style="font-size: 20px; font-weight: 700; color: #0f172a; margin-left: 8px; vertical-align: middle;">Frevio</span>
      </div>

      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Welcome to Frevio, ${esc(firstName)}</h1>
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin-top: 0; margin-bottom: 20px;">
        Frevio replaces manual client status emails with a clean, branded project portal where clients track deliverables, approve milestones, and pay invoices without back-and-forth.
      </p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 10px;">Quick start checklist:</div>
        <ul style="font-size: 14px; line-height: 22px; color: #334155; margin: 0; padding-left: 20px;">
          <li>Create your first project</li>
          <li>Post a quick progress update</li>
          <li>Share the live status link with your client</li>
        </ul>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${esc(appUrl)}/dashboard" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Open your workspace &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 18px; margin: 0; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
        Need help? Simply reply to this email to reach our team directly.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to Frevio',
      html,
    })

    if (error) {
      console.warn('[Welcome Email] Resend notice:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[Welcome Email] Exception:', err?.message || err)
    return { success: false, error: err?.message || 'Failed to send welcome email' }
  }
}

/**
 * Sends a clean, client-facing invitation to open their project portal.
 */
export async function sendClientPortalInviteEmail({
  clientEmail,
  projectName,
  freelancerName,
  portalUrl,
  hasPasscode = false,
  customMessage,
}: {
  clientEmail: string
  projectName: string
  freelancerName: string
  portalUrl: string
  hasPasscode?: boolean
  customMessage?: string | null
}) {
  if (!process.env.RESEND_API_KEY) return { success: false, error: 'RESEND_API_KEY missing' }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Frevio <updates@frevio.cloud>'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 40px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6366F1;">Client Portal</span>
      </div>

      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">${esc(projectName)} Workspace</h1>
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin-top: 0; margin-bottom: 16px;">
        <strong>${esc(freelancerName)}</strong> has invited you to view the real-time project portal for <strong>${esc(projectName)}</strong>.
      </p>

      ${
        customMessage
          ? `<div style="background-color: #f8fafc; border-left: 3px solid #6366F1; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; color: #334155; font-style: italic;">
              ${esc(customMessage)}
            </div>`
          : ''
      }

      <div style="text-align: center; margin: 28px 0;">
        <a href="${esc(portalUrl)}" style="display: inline-block; background-color: #6366F1; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Open Project Portal &rarr;
        </a>
      </div>

      ${
        hasPasscode
          ? `<div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #854d0e;">
              🔒 <strong>Passcode Protected:</strong> This portal requires a PIN. ${esc(freelancerName)} will provide you with the access code directly.
            </div>`
          : ''
      }

      <p style="font-size: 12px; color: #94a3b8; line-height: 18px; margin: 0; border-top: 1px dashed #e2e8f0; padding-top: 16px;">
        No account or password is required. You can bookmark the portal link to review deliverable updates, milestones, and invoices at any time.
      </p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [clientEmail],
      subject: `Project Portal: ${projectName} (${freelancerName})`,
      html,
    })

    if (error) {
      console.warn('[Portal Invite Email] Resend notice:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[Portal Invite Email] Exception:', err?.message || err)
    return { success: false, error: err?.message || 'Failed to send invite' }
  }
}
