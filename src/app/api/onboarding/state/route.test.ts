import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'

const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()

const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
  from: vi.fn((table: string) => {
    return {
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
      eq: mockEq,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
    }
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

vi.mock('@/lib/activation', () => ({
  trackActivationEvent: vi.fn().mockResolvedValue(true),
}))

describe('Onboarding State API (/api/onboarding/state)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnThis()
    mockUpdate.mockReturnThis()
    mockInsert.mockReturnThis()
    mockEq.mockReturnThis()
  })

  it('GET returns 401 if unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('GET returns user onboarding profile and existing project', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'usr-1' } } })
    
    // First query: users profile
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'usr-1',
        name: 'Alex',
        studio_name: 'Alex Studio',
        onboarding_step: 'project',
        onboarding_persona: 'freelancer',
        onboarding_project_id: 'proj-1',
      },
      error: null,
    })

    // Second query: project details
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'proj-1',
        project_name: 'Brand Redesign',
        client_name: 'Acme',
        slug: 'brand-redesign',
      },
      error: null,
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.profile.name).toBe('Alex')
    expect(json.project.project_name).toBe('Brand Redesign')
  })

  it('POST updates onboarding step and persona', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'usr-1' } } })
    mockSingle.mockResolvedValueOnce({
      data: { id: 'usr-1', onboarding_step: 'update', onboarding_persona: 'agency' },
      error: null,
    })

    const req = new Request('http://localhost:3000/api/onboarding/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        onboarding_step: 'update',
        onboarding_persona: 'agency',
        studio_name: 'Super Studio',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
