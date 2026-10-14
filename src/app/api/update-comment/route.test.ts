import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const { mockGetUser, getStore, setStore, mockCookieGet } = vi.hoisted(() => {
  const store = {
    user: null as any,
    project: { id: 'proj-1', user_id: 'user-owner', org_id: null, project_name: 'Nova Portal', passcode: null, slug: 'nova' } as any,
    member: null as any,
  }
  const mockGetUser = vi.fn()
  const mockCookieGet = vi.fn()
  return {
    mockGetUser,
    mockCookieGet,
    getStore: () => store,
    setStore: (updates: Partial<typeof store>) => Object.assign(store, updates),
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockCookieGet,
  }),
}))

vi.mock('@/lib/notifications', () => ({
  notifyFreelancerOfComment: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/activity', () => ({
  logAgencyActivity: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: getStore().project,
            error: null,
          }),
        }
      }
      if (table === 'organization_members') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: getStore().member,
            error: null,
          }),
        }
      }
      if (table === 'update_comments') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
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
  return new Request('http://localhost/api/update-comment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/update-comment POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setStore({
      user: null,
      project: { id: 'proj-1', user_id: 'user-owner', org_id: null, project_name: 'Nova Portal', passcode: null, slug: 'nova' },
      member: null,
    })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockCookieGet.mockReturnValue(undefined)
  })

  it('rejects internal notes from unauthenticated callers', async () => {
    const res = await POST(makeRequest({
      updateId: 'up-1',
      projectId: 'proj-1',
      authorName: 'Attacker',
      body: 'Internal note',
      isInternal: true,
    }))
    expect(res.status).toBe(403)
  })

  it('rejects internal notes from authenticated users who do not own the project', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-intruder' } } })
    const res = await POST(makeRequest({
      updateId: 'up-1',
      projectId: 'proj-1',
      authorName: 'Intruder',
      body: 'Internal note attempt',
      isInternal: true,
    }))
    expect(res.status).toBe(403)
  })

  it('allows internal notes from authorized project owner', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner' } } })
    const res = await POST(makeRequest({
      updateId: 'up-1',
      projectId: 'proj-1',
      authorName: 'Studio Lead',
      body: 'Authorized internal note',
      isInternal: true,
    }))
    expect(res.status).toBe(200)
  })

  it('rejects public comment on passcode-gated project if client has no valid passcode ticket', async () => {
    setStore({
      project: { id: 'proj-1', user_id: 'user-owner', org_id: null, project_name: 'Nova Portal', passcode: 'secret456', slug: 'nova' },
    })
    const res = await POST(makeRequest({
      updateId: 'up-1',
      projectId: 'proj-1',
      authorName: 'Client',
      body: 'Comment without passcode',
      isInternal: false,
    }))
    expect(res.status).toBe(401)
  })
})
