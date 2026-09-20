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

  if (isDiscord) {
    // Discord Embed format
    let color = 0x6366f1 // Indigo
    if (payload.type === 'approval') color = 0x10b981 // Emerald
    if (payload.type === 'feedback') color = 0xf59e0b // Amber
    if (payload.type === 'deposit') color = 0x8b5cf6 // Violet

    body = {
      username: 'Frevio Pulse',
      avatar_url: 'https://frevio.app/icon.svg',
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
          text: {
            type: 'plain_text',
            text: `⚡ ${payload.title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: payload.message,
          },
        },
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
    // Standard generic webhook
    body = {
      event: payload.type || 'notification',
      ...payload,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
