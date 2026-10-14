import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

const { mockGetUser, getStore, setStore, mockCookieGet } = vi.hoisted(() => {
  const store = {
    user: null as any,
    item: { id: 'item-1', project_id: 'proj-1', assigned_to: 'freelancer' } as any,
    project: { id: 'proj-1', user_id: 'user-owner', org_id: null, passcode: null, slug: 'test-slug' } as any,
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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: vi.fn((table: string) => {
      if (table === 'checklist_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: getStore().item,
            error: null,
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
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
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
    }),
  }),
}))

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/checklist-item/item-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('/api/checklist-item/[id] PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setStore({
      user: null,
      item: { id: 'item-1', project_id: 'proj-1', assigned_to: 'freelancer' },
      project: { id: 'proj-1', user_id: 'user-owner', org_id: null, passcode: null, slug: 'test-slug' },
      member: null,
    })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockCookieGet.mockReturnValue(undefined)
  })

  it('rejects unauthenticated client from modifying freelancer-assigned item', async () => {
    const res = await PATCH(makeRequest({ done: true }), {
      params: Promise.resolve({ id: 'item-1' }),
    })
    expect(res.status).toBe(403)
  })

  it('allows unauthenticated client to toggle client-assigned item when no passcode', async () => {
    setStore({
      item: { id: 'item-1', project_id: 'proj-1', assigned_to: 'client' },
    })
    const res = await PATCH(makeRequest({ done: true }), {
      params: Promise.resolve({ id: 'item-1' }),
    })
    expect(res.status).toBe(200)
  })

  it('rejects unauthenticated client on passcode project if ticket cookie is missing', async () => {
    setStore({
      item: { id: 'item-1', project_id: 'proj-1', assigned_to: 'client' },
      project: { id: 'proj-1', user_id: 'user-owner', org_id: null, passcode: 'secret123', slug: 'test-slug' },
    })
    const res = await PATCH(makeRequest({ done: true }), {
      params: Promise.resolve({ id: 'item-1' }),
    })
    expect(res.status).toBe(401)
  })

  it('allows authenticated project owner to toggle any item', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-owner' } } })
    setStore({
      item: { id: 'item-1', project_id: 'proj-1', assigned_to: 'freelancer' },
    })
    const res = await PATCH(makeRequest({ done: true }), {
      params: Promise.resolve({ id: 'item-1' }),
    })
    expect(res.status).toBe(200)
  })
})
