import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@/lib/integrations/providers', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  getProviderCredentials: (p: string) =>
    p === 'unconfigured' ? null : { clientId: 'client-id', clientSecret: 'client-secret' },
  ALLOWED_PROVIDERS: ['google', 'github', 'figma'],
}))

vi.mock('@/lib/integrations/oauth', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  generateOAuthState: vi.fn().mockReturnValue('mock-state-token'),
  buildAuthUrl: vi.fn().mockReturnValue('https://provider.example/auth?state=mock-state-token'),
  buildRedirectUri: vi.fn().mockReturnValue('http://localhost:3000/api/integrations/google/callback'),
  getProviderCredentials: (p: string) =>
    p === 'unconfigured' ? null : { clientId: 'client-id', clientSecret: 'client-secret' },
}))

function makeRequest(provider: string): [Request, { params: Promise<{ provider: string }> }] {
  return [
    new Request(`http://localhost:3000/api/integrations/${provider}/connect`),
    { params: Promise.resolve({ provider }) },
  ]
}

describe('GET /api/integrations/[provider]/connect', () => {
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

  it('redirects to provider auth URL for valid provider', async () => {
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google')
    const res = await GET(req, ctx)
    // Should be a redirect (302/307/308)
    expect([302, 307, 308]).toContain(res.status)
  })
})
