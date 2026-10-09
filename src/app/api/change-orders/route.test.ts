import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUser, mockFrom } = vi.hoisted(() => {
  return {
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
  }
})

let mockProjectData: any = null
let mockInsertResult: any = { data: null, error: null }

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { POST } from './route'

function makePostRequest(body: object): Request {
  return new Request('http://localhost:3000/api/change-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/change-orders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'freelancer-1' } } })
    mockProjectData = { id: 'proj-1', user_id: 'freelancer-1', org_id: null }
    mockInsertResult = {
      data: {
        id: 'co-1',
        project_id: 'proj-1',
        user_id: 'freelancer-1',
        title: 'Extra Animation',
        amount: 450,
        currency: 'USD',
        status: 'pending',
      },
      error: null,
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProjectData, error: null }),
        } as any
      }
      if (table === 'organization_members') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        } as any
      }
      if (table === 'change_orders') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(mockInsertResult),
        } as any
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as any
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makePostRequest({ projectId: 'proj-1', title: 'Test' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when title or projectId is missing', async () => {
    const res = await POST(makePostRequest({ projectId: '', title: 'Test' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/required/i)
  })

  it('returns 403 when user does not own project', async () => {
    mockProjectData = { id: 'proj-1', user_id: 'different-user', org_id: null }
    const res = await POST(makePostRequest({ projectId: 'proj-1', title: 'Out of scope revision' }))
    expect(res.status).toBe(403)
  })

  it('successfully creates change order with parsed amount and timeline', async () => {
    const res = await POST(makePostRequest({
      projectId: 'proj-1',
      title: 'Additional 3D Hero Render',
      description: 'Custom blender asset creation',
      amount: 600,
      estimatedHours: 5,
      timelineDays: 3,
      requiresPayment: true,
    }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.changeOrder.title).toBe('Extra Animation')
  })
})
