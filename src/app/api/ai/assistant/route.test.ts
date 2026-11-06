import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'studio@example.com' } }, error: null }),
    },
  }),
}))

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                project_name: 'Stripe Integration',
                client_name: 'Acme Corp',
                active_focus_area: 'Payment Gateway',
              },
              error: null,
            }),
          }),
        }),
      }
    }
    if (table === 'checklist_items') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              { title: 'Setup Stripe webhook endpoint', done: true },
              { title: 'Test card decline flow', done: false },
            ],
            error: null,
          }),
        }),
      }
    }
    if (table === 'milestones') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ title: 'MVP Checkout', done: true, due_date: null }],
            error: null,
          }),
        }),
      }
    }
    if (table === 'time_entries') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ description: 'Checkout Session API integration', hours: 4 }],
                error: null,
              }),
            }),
          }),
        }),
      }
    }
    return {
      select: vi.fn(),
    }
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

describe('POST /api/ai/assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates structured weekly digest from project activity and milestones', async () => {
    const req = new Request('http://localhost/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({
        action: 'weekly_digest',
        projectId: 'proj-123',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.bullets).toHaveLength(3)
    expect(json.bullets[0]).toContain('MVP Checkout')
    expect(json.note).toContain('Acme Corp')
  })

  it('generates polite scope defense response and itemized change order proposal', async () => {
    const req = new Request('http://localhost/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({
        action: 'scope_defender',
        clientMessage: 'Could we also add Apple Pay, Google Pay, and multi-currency exchange rates?',
        projectRate: 150,
        currency: 'USD',
        estimatedHours: 6,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.amount).toBe(900)
    expect(json.politeResponse).toContain('Change Order')
    expect(json.politeResponse).toContain('USD 900')
  })

  it('rejects invalid action with 400', async () => {
    const req = new Request('http://localhost/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({
        action: 'unsupported_action',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
