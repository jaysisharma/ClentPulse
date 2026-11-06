import { Resend } from 'resend'

function esc(str: string | null | undefined): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const APP_BUILDS_BUCKET = 'app-builds'

export const BUILD_ENVIRONMENTS = ['staging', 'internal_beta', 'client_review', 'production'] as const

export function normalizeBuildEnvironment(env: unknown): (typeof BUILD_ENVIRONMENTS)[number] {
  return BUILD_ENVIRONMENTS.includes(env as any) ? (env as (typeof BUILD_ENVIRONMENTS)[number]) : 'staging'
}

interface BuildReadyEmail {
  to: string
  replyTo?: string | null
  projectName: string
  projectSlug: string
  versionName: string
  buildNumber?: string | null
  environment: string
  changelog?: string | null
}

/** Emails the client that a new build is waiting in their portal. Returns true when sent. */
export async function sendBuildReadyEmail(opts: BuildReadyEmail): Promise<boolean> {
  const { to, replyTo, projectName, projectSlug, versionName, buildNumber, environment, changelog } = opts
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.cloud'}/p/${projectSlug}`
  const envLabel = environment === 'production'
    ? 'Production Release'
    : environment === 'client_review'
    ? 'Client Review Build'
    : environment === 'internal_beta'
    ? 'Internal Beta'
    : 'Staging / Test Build'

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Frevio <updates@frevio.cloud>',
      to: [to],
      replyTo: replyTo || undefined,
      subject: `New Android Build Ready: ${versionName} — ${projectName}`,
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
    A new test build of <strong>${esc(projectName)}</strong> (Version <strong>${esc(versionName)}</strong>${buildNumber ? ` · Build #${esc(buildNumber)}` : ''}) has been published to your client portal.
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
    return true
  } catch (err) {
    console.error('[AppBuild Email Notify Error]', err)
    return false
  }
}
