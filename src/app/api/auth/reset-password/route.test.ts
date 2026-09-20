import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockResendSend = vi.fn().mockResolvedValue({ error: null })
vi.mock('resend', () => ({
  Resend: function Resend() {
    return { emails: { send: mockResendSend } }
  }
}))

const mockFrom = vi.fn()
const mockUpdateUserById = vi.fn()
const mockListUsers = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: (...args: any[]) => mockFrom(...args),
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
        listUsers: mockListUsers,
      }
    }
  })
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake_tok', refresh_token: 'fake_ref' } },
        error: null
      })
    }
  })
}))

function makeRequest(url: string, body: object): Request {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('Forgot & Reset Password Auth Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake_key'
  })

  describe('POST /api/auth/forgot-password', () => {
    it('returns 400 if email is missing', async () => {
      const { POST } = await import('../forgot-password/route')
      const res = await POST(makeRequest('http://localhost/api/auth/forgot-password', {}))
      expect(res.status).toBe(400)
    })

    it('returns 404 if user is not found', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          })
        })
      })
      mockListUsers.mockResolvedValue({ data: { users: [] }, error: null })

      const { POST } = await import('../forgot-password/route')
      const res = await POST(makeRequest('http://localhost/api/auth/forgot-password', { email: 'unknown@pulse.io' }))
      expect(res.status).toBe(404)
    })

    it('sends a 6-digit reset code via Resend if user exists', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'usr_1', email: 'user@pulse.io' }, error: null })
              })
            })
          }
        }
        if (table === 'otp_codes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            }),
            upsert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return {}
      })
      mockResendSend.mockResolvedValue({ error: null })

      const { POST } = await import('../forgot-password/route')
      const res = await POST(makeRequest('http://localhost/api/auth/forgot-password', { email: 'user@pulse.io' }))
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(mockResendSend).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('validates password length and code format', async () => {
      const { POST } = await import('./route')
      const res = await POST(makeRequest('http://localhost/api/auth/reset-password', {
        email: 'user@pulse.io',
        code: '123',
        newPassword: 'pass'
      }))
      expect(res.status).toBe(400)
    })

    it('updates password and logs user in if code is valid', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'otp_codes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    email: 'user@pulse.io',
                    code: '123456',
                    expires_at: new Date(Date.now() + 600000).toISOString(),
                    failed_verifications: 0
                  },
                  error: null
                })
              })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'usr_1' }, error: null })
              })
            })
          }
        }
        if (table === 'login_attempts') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }
        }
        return {}
      })

      mockUpdateUserById.mockResolvedValue({ error: null })

      const { POST } = await import('./route')
      const res = await POST(makeRequest('http://localhost/api/auth/reset-password', {
        email: 'user@pulse.io',
        code: '123456',
        newPassword: 'new-secure-password'
      }))

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(mockUpdateUserById).toHaveBeenCalledWith('usr_1', { password: 'new-secure-password' })
    })
  })
})
