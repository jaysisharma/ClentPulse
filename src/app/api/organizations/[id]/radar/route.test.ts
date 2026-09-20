import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
let mockMembership: { role: string } | null = { role: 'admin' }
let mockProjects: any[] = []
let mockOrgMembers: any[] = []
let mockTimeEntries: any[] = []

const mockFrom = vi.fn((table: string) => {
  if (table === 'organizations') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'org-123', name: 'Nova Agency', slug: 'nova-agency', billing_plan: 'agency_pro' },
          error: null,
        }),
      }),
    }
  }

  if (table === 'organization_members') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((col: string) => {
        if (col === 'org_id') {
          return {
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockMembership })),
            }),
            then: (resolve: any) => resolve({ data: mockOrgMembers, error: null }),
          }
        }
        return {
          maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: mockMembership })),
        }
      }),
    }
  }

  if (table === 'projects') {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockImplementation(() => Promise.resolve({ data: mockProjects, error: null })),
        }),
      }),
    }
  }

  if (table === 'time_entries') {
    return {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          gte: vi.fn().mockImplementation(() => Promise.resolve({ data: mockTimeEntries, error: null })),
        }),
      }),
    }
  }

  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

describe('GET /api/organizations/[id]/radar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMembership = { role: 'admin' }
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-admin', email: 'admin@nova.agency' } } })

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

    mockProjects = [
      {
        id: 'proj-1',
        project_name: 'Acme Mobile App',
        client_name: 'Acme Corp',
        client_email: 'ceo@acme.com',
        color: '#6366F1',
        status: 'active',
        budget: 15000,
        deposit_required: 5000,
        deposit_paid: false, // Blocked Cash!
        waiting_on_client: true,
        waiting_reason: 'Waiting on Apple App Store credentials',
        created_at: tenDaysAgo,
        slug: 'acme-mobile-app',
        updates: [
          { id: 'u-1', sent_at: tenDaysAgo, review_status: 'published' }, // Inactive >7 days!
        ],
        invoices: [
          { id: 'inv-1', invoice_number: 'INV-001', status: 'sent', items: [{ amount: 2500 }], due_date: null, currency: 'USD' },
        ],
        project_team_members: [
          { id: 'ptm-1', user_id: 'spec-1', role_title: 'Lead Architect', user: { id: 'spec-1', name: 'Dev One', email: 'dev1@nova.agency' } },
        ],
      },
      {
        id: 'proj-2',
        project_name: 'Beta SaaS Platform',
        client_name: 'Beta Inc',
        client_email: 'lead@beta.com',
        color: '#10B981',
        status: 'active',
        budget: 20000,
        deposit_required: 10000,
        deposit_paid: true,
        waiting_on_client: false,
        created_at: twoDaysAgo,
        slug: 'beta-saas',
        updates: [
          { id: 'u-2', sent_at: twoDaysAgo, review_status: 'published' },
        ],
        invoices: [],
        project_team_members: [
          { id: 'ptm-2', user_id: 'spec-1', role_title: 'Lead Architect', user: { id: 'spec-1', name: 'Dev One', email: 'dev1@nova.agency' } },
        ],
      },
    ]

    mockOrgMembers = [
      {
        id: 'mem-1',
        role: 'admin',
        user_id: 'user-admin',
        user: { id: 'user-admin', name: 'Admin Lead', email: 'admin@nova.agency' },
      },
      {
        id: 'mem-2',
        role: 'member',
        user_id: 'spec-1',
        user: { id: 'spec-1', name: 'Dev One', email: 'dev1@nova.agency', last_heartbeat_at: new Date().toISOString(), active_focus_area: 'src/api' },
      },
    ]

    mockTimeEntries = [
      { project_id: 'proj-1', user_id: 'spec-1', hours: 12, date: new Date().toISOString() },
      { project_id: 'proj-2', user_id: 'spec-1', hours: 8, date: new Date().toISOString() },
    ]
  })

  it('rejects unauthenticated requests with 401', async () => {
    const { GET } = await import('./route')
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const req = new Request('http://localhost/api/organizations/org-123/radar')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(401)
  })

  it('rejects non-members of the organization with 403', async () => {
    const { GET } = await import('./route')
    mockMembership = null
    const req = new Request('http://localhost/api/organizations/org-123/radar')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(403)
  })

  it('returns aggregated executive radar metrics for agency members', async () => {
    const { GET } = await import('./route')
    const req = new Request('http://localhost/api/organizations/org-123/radar')
    const res = await GET(req, { params: Promise.resolve({ id: 'org-123' }) })

    expect(res.status).toBe(200)
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(json.portfolio.activeProjects).toBe(2)
    expect(json.portfolio.totalContractedBudget).toBe(35000)

    // At-Risk Radar: proj-1 is overdue (>7d) and blocked on client
    expect(json.atRisk.count).toBe(1)
    expect(json.atRisk.items[0].projectName).toBe('Acme Mobile App')
    expect(json.atRisk.items[0].isBlocked).toBe(true)

    // Blocked Cash: $5000 deposit + $2500 sent invoice on blocked project = $7500
    expect(json.blockedCash.totalBlockedCash).toBe(7500)
    expect(json.blockedCash.count).toBe(2)

    // Team Workload: spec-1 is staffed on 2 projects with 20 hours logged
    const specialist = json.teamWorkload.find((t: any) => t.userId === 'spec-1')
    expect(specialist).toBeDefined()
    expect(specialist.assignedProjectCount).toBe(2)
    expect(specialist.hoursThisWeek).toBe(20)
    expect(specialist.capacityStatus).toBe('balanced')
  })
})
