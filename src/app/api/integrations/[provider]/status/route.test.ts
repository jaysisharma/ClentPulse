import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockMaybeSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
    }),
  }),
}))

vi.mock('@/lib/integrations/providers', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  ALLOWED_PROVIDERS: ['google', 'github', 'figma'],
}))

vi.mock('@/lib/integrations/oauth', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  getConnectionStatus: vi.fn().mockResolvedValue({
    connected: true,
    status: 'active',
    email: 'user@example.com',
    accountId: 'google-uid',
    connectedAt: '2024-01-01T00:00:00Z',
  }),
}))

function makeRequest(provider: string): [Request, { params: Promise<{ provider: string }> }] {
  return [
    new Request(`http://localhost:3000/api/integrations/${provider}/status`),
    { params: Promise.resolve({ provider }) },
  ]
}

describe('GET /api/integrations/[provider]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google')
    const res = await GET(req, ctx)
    expect(res.status).toBe(401)
  })

  it('returns 400 for unknown provider', async () => {
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('unknown')
    const res = await GET(req, ctx)
    expect(res.status).toBe(400)
  })

  it('returns connection status for a valid connected provider', async () => {
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google')
    const res = await GET(req, ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.connected).toBe(true)
    expect(data.email).toBe('user@example.com')
    // Tokens must NOT be present in the response
    expect(data.accessToken).toBeUndefined()
    expect(data.access_token_enc).toBeUndefined()
    expect(data.refresh_token_enc).toBeUndefined()
  })

  it('returns connected=false for unconnected provider', async () => {
    const { getConnectionStatus } = await import('@/lib/integrations/oauth')
    ;(getConnectionStatus as any).mockResolvedValueOnce({
      connected: false,
      status: null,
      email: null,
      accountId: null,
      connectedAt: null,
    })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('github')
    const res = await GET(req, ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.connected).toBe(false)
  })
})
