import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH } from './route'

const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
  from: vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
    eq: mockEq,
    single: mockSingle,
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

describe('Users Modules API (/api/users/modules)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnThis()
    mockUpdate.mockReturnThis()
    mockEq.mockReturnThis()
  })

  it('GET returns 401 if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('GET returns default resolved modules if user has none configured', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'usr-1' } } })
    mockSingle.mockResolvedValueOnce({
      data: { craft: 'marketer', enabled_modules: null },
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.craft).toBe('marketer')
    expect(json.modules.marketing).toBe(true)
    expect(json.modules.developer).toBe(true)
  })

  it('PATCH updates modules and craft successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'usr-1' } } })
    mockSingle.mockResolvedValueOnce({
      data: {
        craft: 'developer',
        enabled_modules: { developer: true, marketing: false, design: false, time_tracking: true, contracts_billing: true },
      },
    })

    const req = new Request('http://localhost/api/users/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        craft: 'developer',
        modules: { developer: true, marketing: false },
      }),
    })

    const res = await PATCH(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.modules.developer).toBe(true)
    expect(json.modules.marketing).toBe(false)
  })
})
