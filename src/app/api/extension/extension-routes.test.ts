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

  describe('POST /api/extension/updates', () => {
    it('returns 401 when Bearer token is invalid', async () => {
      const { POST } = await import('./updates/route')
      const res = await POST(
        new Request('http://localhost/api/extension/updates', {
          method: 'POST',
          body: JSON.stringify({ projectId: 'p1', bullets: ['Built new feature'] }),
        })
      )
      expect(res.status).toBe(401)
    })

    it('returns 400 when bullets are missing or empty', async () => {
      adminFromMap['api_tokens'] = () =>
        createQueryBuilder({
          singleResult: { data: { id: 'tok_1', user_id: 'u123' }, error: null },
        })

      const { POST } = await import('./updates/route')
      const res = await POST(
        new Request('http://localhost/api/extension/updates', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${validToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'p1',
            bullets: [],
          }),
        })
      )
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('bullet')
    })

    it('successfully creates and publishes client update', async () => {
      // 1. Auth check
      adminFromMap['api_tokens'] = () =>
        createQueryBuilder({
          singleResult: { data: { id: 'tok_1', user_id: 'u123' }, error: null },
        })

      // 2. Project check
      adminFromMap['projects'] = () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'p1',
              user_id: 'u123',
              project_name: 'Acme Dashboard',
              client_name: 'Sarah Connor',
              client_email: 'sarah@acme.test',
              slug: 'acme-dashboard',
              color: '#6366f1',
            },
            error: null,
          },
        })

      // 3. User plan check
      adminFromMap['users'] = () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'u123',
              email: 'dev@frevio.test',
              plan: 'free',
            },
            error: null,
          },
        })

      // 4. Updates insert
      adminFromMap['updates'] = () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'upd_999',
              created_at: '2026-10-06T09:00:00Z',
              sent_at: '2026-10-06T09:00:00Z',
            },
            error: null,
          },
        })

      const { POST } = await import('./updates/route')
      const res = await POST(
        new Request('http://localhost/api/extension/updates', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${validToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'p1',
            bullets: ['Implemented automated wrap-up trigger', 'Fixed responsive grid for mobile'],
            note: 'Ready for client staging review.',
          }),
        })
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.updateId).toBe('upd_999')
      expect(data.clientName).toBe('Sarah Connor')
      expect(data.bulletsCount).toBe(2)
      expect(data.portalUrl).toContain('/p/acme-dashboard')
    })
  })
})

