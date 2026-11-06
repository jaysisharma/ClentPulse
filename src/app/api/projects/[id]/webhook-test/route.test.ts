import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/project-access', () => ({
  getProjectAccess: vi.fn().mockResolvedValue({
    isWorkspaceMember: true,
    project: { id: 'proj-123', project_name: 'Acme SaaS' },
  }),
}))

vi.mock('@/lib/webhooks', () => ({
  dispatchWebhook: vi.fn().mockResolvedValue({ success: true }),
}))

describe('POST /api/projects/[id]/webhook-test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully dispatches test webhook notification', async () => {
    const req = new Request('http://localhost/api/projects/proj-123/webhook-test', {
      method: 'POST',
      body: JSON.stringify({
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
      }),
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 400 on invalid or non-http webhook URL', async () => {
    const req = new Request('http://localhost/api/projects/proj-123/webhook-test', {
      method: 'POST',
      body: JSON.stringify({
        webhookUrl: 'invalid-url',
      }),
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(400)
  })
})

