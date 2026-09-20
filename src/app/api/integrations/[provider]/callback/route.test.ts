import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockUpsert = vi.fn()
const mockMaybeSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: { id: 'conn-1' }, error: null }),
      maybeSingle: mockMaybeSingle,
    }),
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'valid-state' }),
    set: vi.fn(),
  }),
}))

vi.mock('@/lib/integrations/providers', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  ALLOWED_PROVIDERS: ['google', 'github', 'figma'],
}))

vi.mock('@/lib/integrations/oauth', () => ({
  isValidProvider: (p: string) => ['google', 'github', 'figma'].includes(p),
  verifyOAuthState: vi.fn().mockReturnValue({ provider: 'google', userId: 'user-123' }),
  exchangeCode: vi.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    scope: 'drive.readonly',
    tokenType: 'Bearer',
  }),
  storeConnection: vi.fn().mockResolvedValue('conn-1'),
  buildRedirectUri: vi.fn().mockReturnValue('http://localhost:3000/api/integrations/google/callback'),
}))

vi.mock('@/lib/integrations/google', () => ({
  getGoogleAccountInfo: vi.fn().mockResolvedValue({ id: 'google-uid', email: 'user@gmail.com', name: 'Test' }),
}))

vi.mock('@/lib/activity', () => ({
  logAgencyActivity: vi.fn().mockResolvedValue(undefined),
}))

function makeRequest(provider: string, params: Record<string, string> = {}): [Request, { params: Promise<{ provider: string }> }] {
  const url = new URL(`http://localhost:3000/api/integrations/${provider}/callback`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return [new Request(url.toString()), { params: Promise.resolve({ provider }) }]
}

describe('GET /api/integrations/[provider]/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockMaybeSingle.mockResolvedValue({ data: null })
  })

  it('redirects to error when provider is invalid', async () => {
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('badprovider', { code: 'code', state: 'state' })
    const res = await GET(req, ctx)
    expect([302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('invalid_provider')
  })

  it('redirects to error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google', { code: 'code', state: 'valid-state' })
    const res = await GET(req, ctx)
    expect([302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('login')
  })

  it('redirects to error when state cookie is missing', async () => {
    const nextHeaders = await import('next/headers')
    ;(nextHeaders.cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google', { code: 'code', state: 'valid-state' })
    const res = await GET(req, ctx)
    expect([302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('invalid_state')
  })

  it('redirects to error when state does not match cookie', async () => {
    const nextHeaders = await import('next/headers')
    ;(nextHeaders.cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'different-state' }),
      set: vi.fn(),
    })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google', { code: 'code', state: 'valid-state' })
    const res = await GET(req, ctx)
    expect([302, 307, 308]).toContain(res.status)
    expect(res.headers.get('location')).toContain('invalid_state')
  })

  it('redirects to success when everything is valid', async () => {
    const nextHeaders = await import('next/headers')
    ;(nextHeaders.cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'valid-state' }),
      set: vi.fn(),
    })
    const { GET } = await import('./route')
    const [req, ctx] = makeRequest('google', { code: 'auth-code', state: 'valid-state' })
    const res = await GET(req, ctx)
    expect([302, 307, 308]).toContain(res.status)
    const loc = res.headers.get('location') || ''
    expect(loc).toContain('connected=google')
  })
})
