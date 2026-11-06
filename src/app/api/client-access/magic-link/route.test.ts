import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { verifyClientMagicToken } from '@/lib/magic-token'

vi.mock('@/lib/project-access', () => ({
  getProjectAccess: vi.fn().mockResolvedValue({
    isWorkspaceMember: true,
    project: { id: 'proj-123' },
  }),
}))

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'proj-123', slug: 'acme-corp', client_email: 'client@acme.com' },
              error: null,
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

describe('POST /api/client-access/magic-link', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'test-secret-salt-for-frevio-magic-links-32b'
    vi.clearAllMocks()
  })

  it('generates a valid client magic token link', async () => {
    const req = new Request('http://localhost/api/client-access/magic-link', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'proj-123' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.path).toContain('/p/acme-corp?magic_token=')

    const verification = verifyClientMagicToken(json.token)
    expect(verification.valid).toBe(true)
    expect(verification.clientEmail).toBe('client@acme.com')
  })

  it('rejects missing projectId with 400', async () => {
    const req = new Request('http://localhost/api/client-access/magic-link', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

