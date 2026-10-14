import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

const { mockGetUser, getStore, setStore } = vi.hoisted(() => {
  const store = {
    callerRole: 'owner',
    targetMember: null as any,
    ownerCount: 1,
  }
  const mockGetUser = vi.fn()
  return {
    mockGetUser,
    getStore: () => store,
    setStore: (updates: Partial<typeof store>) => Object.assign(store, updates),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'organization_members') {
        return {
          select: vi.fn((cols: string, opts?: any) => {
            if (opts?.count === 'exact') {
              return {
                eq: vi.fn().mockReturnThis(),
                then: (resolve: any) => resolve({ count: getStore().ownerCount, error: null }),
              }
            }
            return {
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { role: getStore().callerRole },
                error: null,
              }),
              single: vi.fn().mockResolvedValue({
                data: getStore().targetMember,
                error: null,
              }),
            }
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'mem-1', role: 'admin' },
              error: null,
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
    }),
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/organizations/org-123/members/mem-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/organizations/[id]/members/[memberId] PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner' } } })
    setStore({
      callerRole: 'owner',
      targetMember: { id: 'mem-1', user_id: 'user-owner', role: 'owner' },
      ownerCount: 1,
    })
  })

  it('rejects demoting sole owner to admin', async () => {
    setStore({ ownerCount: 1 })
    const res = await PATCH(makeRequest({ role: 'admin' }), {
      params: Promise.resolve({ id: 'org-123', memberId: 'mem-1' }),
    })
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error).toMatch(/sole owner/)
  })

  it('allows demoting owner if another owner remains', async () => {
    setStore({ ownerCount: 2 })
    const res = await PATCH(makeRequest({ role: 'admin' }), {
      params: Promise.resolve({ id: 'org-123', memberId: 'mem-1' }),
    })
    expect(res.status).toBe(200)
  })

  it('rejects non-owner callers from updating roles', async () => {
    setStore({ callerRole: 'admin' })
    const res = await PATCH(makeRequest({ role: 'member' }), {
      params: Promise.resolve({ id: 'org-123', memberId: 'mem-1' }),
    })
    expect(res.status).toBe(403)
  })
})
