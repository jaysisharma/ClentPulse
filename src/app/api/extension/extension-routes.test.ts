import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashToken } from '@/lib/extension-auth'

const mockGetUser = vi.fn()
const mockInsertSingle = vi.fn()

const createQueryBuilder = (config: {
  singleResult?: any
  maybeSingleResult?: any
  selectResult?: any
  insertResult?: any
  updateResult?: any
}) => {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn().mockResolvedValue(config.singleResult ?? { data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue(config.maybeSingleResult ?? { data: null, error: null }),
    then: vi.fn((resolve?: any) => (typeof resolve === 'function' ? resolve(config.selectResult ?? { data: [], error: null }) : Promise.resolve())),
  }
  return builder
}

let adminFromMap: Record<string, any> = {}

const mockServerClient = {
  auth: { getUser: mockGetUser },
  from: vi.fn((table: string) => {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: mockInsertSingle,
        })),
      })),
      delete: vi.fn().mockReturnThis(),
    }
  }),
}

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (adminFromMap[table]) {
      return adminFromMap[table]()
    }
    return createQueryBuilder({})
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

describe('Extension API Routes', () => {
  const validToken = 'frev_live_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

  beforeEach(() => {
    vi.clearAllMocks()
    adminFromMap = {}
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u123', email: 'test@example.com' } } })
  })

  describe('POST /api/extension/token', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } })
      const { POST } = await import('./token/route')
      const res = await POST(new Request('http://localhost/api/extension/token', { method: 'POST' }))
      expect(res.status).toBe(401)
    })

    it('generates a token and returns it once', async () => {
      mockInsertSingle.mockResolvedValueOnce({
        data: { id: 'tok_1', token_preview: 'frev_live_...cdef', name: 'Laptop Extension', created_at: '2026-09-08' },
        error: null,
      })

      const { POST } = await import('./token/route')
      const res = await POST(
        new Request('http://localhost/api/extension/token', {
          method: 'POST',
          body: JSON.stringify({ name: 'Laptop Extension' }),
          headers: { 'Content-Type': 'application/json' },
        })
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.token).toMatch(/^frev_live_[a-f0-9]{64}$/)
      expect(data.tokenPreview).toContain('frev_live_...')
      expect(data.id).toBe('tok_1')
    })
  })

  describe('GET /api/extension/projects', () => {
    it('returns 401 when Bearer token is missing or invalid', async () => {
      const { GET } = await import('./projects/route')
      const res = await GET(new Request('http://localhost/api/extension/projects'))
      expect(res.status).toBe(401)
    })

    it('returns projects when token is valid', async () => {
      adminFromMap['api_tokens'] = () =>
        createQueryBuilder({
          singleResult: { data: { id: 'tok_1', user_id: 'u123' }, error: null },
        })

      const dummyProjects = [
        { id: 'p1', project_name: 'Client Redesign', client_name: 'Acme', slug: 'acme-redesign' },
      ]

      adminFromMap['projects'] = () => {
        const b = createQueryBuilder({})
        b.order.mockResolvedValueOnce({ data: dummyProjects, error: null })
        return b
      }

      const { GET } = await import('./projects/route')
      const res = await GET(
        new Request('http://localhost/api/extension/projects', {
          headers: { Authorization: `Bearer ${validToken}` },
        })
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.projects).toEqual(dummyProjects)
    })
  })

  describe('POST /api/extension/heartbeat', () => {
    it('returns 401 when Bearer token is invalid', async () => {
      const { POST } = await import('./heartbeat/route')
      const res = await POST(
        new Request('http://localhost/api/extension/heartbeat', {
          method: 'POST',
          body: JSON.stringify({ projectId: 'p1' }),
        })
      )
      expect(res.status).toBe(401)
    })

    it('records heartbeat and updates project presence', async () => {
      // 1. Auth check for token
      adminFromMap['api_tokens'] = () =>
        createQueryBuilder({
          singleResult: { data: { id: 'tok_1', user_id: 'u123' }, error: null },
        })

      // 2. Project check & update
      adminFromMap['projects'] = () =>
        createQueryBuilder({
          singleResult: {
            data: { id: 'p1', user_id: 'u123', project_name: 'Acme App', status: 'active' },
            error: null,
          },
        })

      // 3. Time entries recent query
      adminFromMap['time_entries'] = () =>
        createQueryBuilder({
          maybeSingleResult: { data: null, error: null },
        })

      const { POST } = await import('./heartbeat/route')
      const res = await POST(
        new Request('http://localhost/api/extension/heartbeat', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${validToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'p1',
            focusArea: 'Frontend / UI',
            intervalSeconds: 120,
          }),
        })
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.projectName).toBe('Acme App')
      expect(data.focusArea).toBe('Frontend / UI')
    })
  })
})
