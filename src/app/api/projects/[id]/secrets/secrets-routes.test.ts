import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { POST as REVEAL_POST } from './[secretId]/reveal/route'
import { sealProjectSecret } from '@/lib/secrets-vault'

vi.mock('@/lib/project-access', () => ({
  getProjectAccess: vi.fn().mockResolvedValue({
    canActAsClient: true,
    isWorkspaceMember: true,
    project: { id: 'proj-123' },
  }),
}))

const mockSecretsTable = [
  {
    id: 'sec-1',
    project_id: 'proj-123',
    title: 'Stripe Secret Key',
    category: 'api_key',
    encrypted_value: '',
    notes: 'Production key',
    created_by: 'freelancer',
    last_revealed_at: null,
    reveal_count: 0,
    created_at: new Date().toISOString(),
  },
]

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'project_secrets') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockSecretsTable, error: null }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockSecretsTable[0],
                  encrypted_value: sealProjectSecret('test_secret_token_123456789'),
                },
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'sec-2',
                project_id: 'proj-123',
                title: 'Database URL',
                category: 'database',
                notes: null,
                created_by: 'freelancer',
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }
    }
    return {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

describe('Project Secrets API', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'test-secret-salt-for-frevio-secrets-vault-32b'
    vi.clearAllMocks()
  })

  it('GET returns masked secrets list', async () => {
    const req = new Request('http://localhost/api/projects/proj-123/secrets')
    const res = await GET(req, { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.secrets).toHaveLength(1)
    expect(json.secrets[0].maskedValue).toBe('••••••••••••••••')
  })

  it('POST inserts sealed secret', async () => {
    const req = new Request('http://localhost/api/projects/proj-123/secrets', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Database URL',
        category: 'database',
        secretValue: 'postgres://user:pass@host:5432/db',
      }),
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'proj-123' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.secret.title).toBe('Database URL')
  })

  it('POST /reveal decrypts and logs access timestamp', async () => {
    const req = new Request('http://localhost/api/projects/proj-123/secrets/sec-1/reveal', {
      method: 'POST',
    })
    const res = await REVEAL_POST(req, {
      params: Promise.resolve({ id: 'proj-123', secretId: 'sec-1' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.secretValue).toBe('test_secret_token_123456789')
    expect(json.revealCount).toBe(1)
  })
})

