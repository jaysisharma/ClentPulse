import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dispatchWebhook } from '../webhooks'

describe('dispatchWebhook helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns failure if webhook url is missing or invalid', async () => {
    const result = await dispatchWebhook('', { title: 'Test', message: 'Hello' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid or missing')
  })

  it('formats Slack Block Kit payloads correctly for Slack webhook URLs', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })
    globalThis.fetch = mockFetch

    const result = await dispatchWebhook('https://hooks.slack.com/services/T00/B00/X00', {
      title: 'Milestone Completed',
      message: 'Design system delivered',
      projectName: 'Alpha Brand',
      clientName: 'Acme Corp',
      actionUrl: 'https://frevio.app/project/123',
      type: 'approval',
    })

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const callArgs = mockFetch.mock.calls[0]
    const parsedBody = JSON.parse(callArgs[1].body)
    expect(parsedBody.blocks).toBeDefined()
    expect(parsedBody.blocks[0].text.text).toContain('Milestone Completed')
  })

  it('formats Discord Embed payloads correctly for Discord webhook URLs', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })
    globalThis.fetch = mockFetch

    const result = await dispatchWebhook('https://discord.com/api/webhooks/123/abc', {
      title: 'Feedback Received',
      message: 'Looks amazing!',
      projectName: 'Beta App',
      clientName: 'Globex',
      type: 'feedback',
    })

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const callArgs = mockFetch.mock.calls[0]
    const parsedBody = JSON.parse(callArgs[1].body)
    expect(parsedBody.embeds).toBeDefined()
    expect(parsedBody.embeds[0].title).toBe('Feedback Received')
  })

  it('handles network errors gracefully without crashing', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'))

    const result = await dispatchWebhook('https://example.com/webhook', {
      title: 'Alert',
      message: 'Test message',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network offline')
  })
})
