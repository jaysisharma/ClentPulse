import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/extension-auth', () => ({
  verifyExtensionRequest: vi.fn().mockResolvedValue({
    userId: 'user-123',
    tokenId: 'tok-1',
  }),
}))

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'proj-123',
                  user_id: 'user-123',
                  project_name: 'Super SaaS',
                  client_name: 'Acme Corp',
                },
                error: null,
              }),
            }),
          }),
        }),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

describe('Extension AI Draft API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('synthesizes clean client bullets from git commit messages', async () => {
    const req = new Request('http://localhost/api/extension/ai-draft', {
      method: 'POST',
      headers: { Authorization: 'Bearer frev_live_xyz' },
      body: JSON.stringify({
        projectId: 'proj-123',
        gitMessages: [
          'feat(auth): add passwordless 1-click magic link authentication',
          'fix(stripe): harden webhook event ordering timestamp guards',
          'perf: optimize deliverable rendering latency',
        ],
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.bullets).toHaveLength(3)
    expect(json.bullets[0]).toContain('Add passwordless 1-click magic link authentication.')
    expect(json.note).toContain('Acme Corp')
  })
})

