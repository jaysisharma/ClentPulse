import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { sealProjectSecret } from '@/lib/secrets-vault'

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
                data: { id: 'proj-123', user_id: 'user-123' },
                error: null,
              }),
            }),
          }),
        }),
      }
    }
    if (table === 'project_secrets') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { id: 'sec-1', title: 'Stripe Key', category: 'api_key', notes: 'Live', created_at: new Date().toISOString() },
              ],
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'sec-1',
                  title: 'Stripe Key',
                  category: 'api_key',
                  encrypted_value: sealProjectSecret('test_secret_token_xyz987'),
                },
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

describe('Extension Secrets API', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'test-secret-salt-for-frevio-secrets-vault-32b'
    vi.clearAllMocks()
  })

  it('GET returns masked secrets for extension', async () => {
    const req = new Request('http://localhost/api/extension/secrets?projectId=proj-123', {
      headers: { Authorization: 'Bearer frev_live_xyz' },
    })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.secrets[0].maskedValue).toBe('••••••••••••••••')
  })

  it('POST /reveal returns decrypted secret value', async () => {
    const req = new Request('http://localhost/api/extension/secrets/reveal', {
      method: 'POST',
      headers: { Authorization: 'Bearer frev_live_xyz' },
      body: JSON.stringify({ projectId: 'proj-123', secretId: 'sec-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.secretValue).toBe('test_secret_token_xyz987')
  })
})

