import crypto from 'crypto'

/**
 * Webhook integration helper for Slack, Discord, and custom endpoints.
 */

export interface WebhookNotificationPayload {
  title: string
  message: string
  projectName?: string
  clientName?: string
  actionUrl?: string
  type?: 'approval' | 'feedback' | 'comment' | 'deposit' | 'general'
  fields?: { name: string; value: string }[]
}

/**
 * Signs a webhook payload using HMAC-SHA256 for tamper-proof delivery.
 */
export function signWebhookPayload(payloadString: string, secret?: string): string {
  const signingSecret =
    secret ||
    process.env.WEBHOOK_SIGNING_SECRET ||
    process.env.INTEGRATION_ENCRYPTION_KEY ||
    'frevio-webhook-cryptographic-salt'
  return crypto.createHmac('sha256', signingSecret).update(payloadString, 'utf8').digest('hex')
}

/**
 * Verifies that a received webhook payload matches the HMAC-SHA256 signature in constant time.
 */
export function verifyWebhookSignature(
  payloadString: string,
  signature: string,
  secret?: string
): boolean {
  if (!signature || !payloadString) return false
  const signingSecret =
    secret ||
    process.env.WEBHOOK_SIGNING_SECRET ||
    process.env.INTEGRATION_ENCRYPTION_KEY ||
    'frevio-webhook-cryptographic-salt'

  const expectedSig = crypto.createHmac('sha256', signingSecret).update(payloadString, 'utf8').digest('hex')
  const cleanSig = signature.replace(/^sha256=/, '')

  const bufA = Buffer.from(cleanSig, 'hex')
  const bufB = Buffer.from(expectedSig, 'hex')

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Sends a rich notification payload to Slack, Discord, or generic incoming webhook URL.
 */
export async function dispatchWebhook(
  webhookUrl: string | null | undefined,
  payload: WebhookNotificationPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'Invalid or missing webhook URL' }
  }

  const isSlack = webhookUrl.includes('hooks.slack.com')
  const isDiscord = webhookUrl.includes('discord.com/api/webhooks')

  let body: any
  let headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (isDiscord) {
    // Discord Embed format
    let color = 0x6366f1 // Indigo
    if (payload.type === 'approval') color = 0x10b981 // Emerald
    if (payload.type === 'feedback') color = 0xf59e0b // Amber
    if (payload.type === 'deposit') color = 0x8b5cf6 // Violet

    body = {
      username: 'Frevio Pulse',
      avatar_url: 'https://frevio.cloud/icon.svg',
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          url: payload.actionUrl,
          color,
          fields: [
            ...(payload.projectName ? [{ name: 'Project', value: payload.projectName, inline: true }] : []),
            ...(payload.clientName ? [{ name: 'Client', value: payload.clientName, inline: true }] : []),
            ...(payload.fields ?? []).map(f => ({ name: f.name, value: f.value, inline: true })),
          ],
          footer: { text: 'Frevio Real-Time Pulse' },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  } else if (isSlack) {
    // Slack Block Kit format
    body = {
      text: `${payload.title}: ${payload.message}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: payload.title, emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: payload.message },
        },
        ...(payload.fields && payload.fields.length > 0
          ? [
              {
                type: 'section',
                fields: payload.fields.map(f => ({
                  type: 'mrkdwn',
                  text: `*${f.name}:*\n${f.value}`,
                })),
              },
            ]
          : []),
        ...(payload.projectName || payload.clientName
          ? [
              {
                type: 'context',
                elements: [
                  ...(payload.projectName
                    ? [{ type: 'mrkdwn', text: `*Project:* ${payload.projectName}` }]
                    : []),
                  ...(payload.clientName
                    ? [{ type: 'mrkdwn', text: `*Client:* ${payload.clientName}` }]
                    : []),
                ],
              },
            ]
          : []),
        ...(payload.actionUrl
          ? [
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: { type: 'plain_text', text: 'Open in Frevio →', emoji: true },
                    url: payload.actionUrl,
                    style: 'primary',
                  },
                ],
              },
            ]
          : []),
      ],
    }
  } else {
    // Standard generic webhook with cryptographic HMAC signature
    body = {
      event: payload.type || 'notification',
      ...payload,
      timestamp: new Date().toISOString(),
    }

    const payloadString = JSON.stringify(body)
    const signature = signWebhookPayload(payloadString)
    headers = {
      'Content-Type': 'application/json',
      'X-Frevio-Signature': `sha256=${signature}`,
      'X-Frevio-Timestamp': Math.floor(Date.now() / 1000).toString(),
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return { success: false, status: res.status, error: `HTTP ${res.status}` }
    }
    return { success: true, status: res.status }
  } catch (err: any) {
    console.error('[Webhook Dispatch] Failed:', err)
    return { success: false, error: err?.message || 'Network error' }
  }
}
