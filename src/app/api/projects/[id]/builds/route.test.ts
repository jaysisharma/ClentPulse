import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUser, mockFrom, mockSendEmail } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockSendEmail: vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return {
      emails: { send: mockSendEmail },
    }
  }),
}))

import { GET, POST } from './route'

function makeGetRequest(): Request {
  return new Request('http://localhost:3000/api/projects/proj-1/builds', {
    method: 'GET',
  })
}

function makePostRequest(body: object): Request {
  return new Request('http://localhost:3000/api/projects/proj-1/builds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/projects/[id]/builds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'dev-1' } } })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'proj-1',
              project_name: 'Super App',
              client_name: 'Acme Corp',
              client_email: 'client@acme.com',
              slug: 'super-app',
              user_id: 'dev-1',
              org_id: null,
            },
            error: null,
          }),
        } as any
      }
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { name: 'John Dev', email: 'john@example.com' },
            error: null,
          }),
        } as any
      }
      if (table === 'app_builds') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'build-1', version_name: 'v1.0.0', file_url: 'https://example.com/app.apk' }
            ],
            error: null,
          }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'build-new',
              version_name: 'v1.0.4',
              file_url: 'https://example.com/build-42.apk',
              build_number: '42',
              platform: 'android',
              environment: 'staging',
              is_active: true,
            },
            error: null,
          }),
        } as any
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as any
    })
  })

  describe('GET', () => {
    it('returns 401 when not logged in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await GET(makeGetRequest(), { params: Promise.resolve({ id: 'proj-1' }) })
      expect(res.status).toBe(401)
    })

    it('returns builds when logged in', async () => {
      const res = await GET(makeGetRequest(), { params: Promise.resolve({ id: 'proj-1' }) })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.builds).toHaveLength(1)
      expect(data.builds[0].version_name).toBe('v1.0.0')
    })
  })

  describe('POST', () => {
    it('returns 401 when unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const res = await POST(
        makePostRequest({ version_name: 'v1.0.1', file_url: 'https://example.com/app.apk' }),
        { params: Promise.resolve({ id: 'proj-1' }) }
      )
      expect(res.status).toBe(401)
    })

    it('returns 400 when version_name is missing', async () => {
      const res = await POST(
        makePostRequest({ file_url: 'https://example.com/app.apk' }),
        { params: Promise.resolve({ id: 'proj-1' }) }
      )
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Version name is required')
    })

    it('returns 400 when file_url is missing', async () => {
      const res = await POST(
        makePostRequest({ version_name: 'v1.0.1' }),
        { params: Promise.resolve({ id: 'proj-1' }) }
      )
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('APK file or download URL is required')
    })

    it('creates build successfully and sends notification when notify_client is true', async () => {
      const res = await POST(
        makePostRequest({
          version_name: 'v1.0.4',
          build_number: '42',
          file_url: 'https://example.com/build-42.apk',
          environment: 'client_review',
          changelog: 'Fixed login bug',
          notify_client: true,
        }),
        { params: Promise.resolve({ id: 'proj-1' }) }
      )

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.build.version_name).toBe('v1.0.4')
      expect(data.emailSent).toBe(true)
      expect(mockSendEmail).toHaveBeenCalled()
    })
  })
})
