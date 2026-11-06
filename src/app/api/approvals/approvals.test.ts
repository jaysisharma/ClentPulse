import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './[id]/route'

const { mockDispatch, mockSupabase } = vi.hoisted(() => {
  const mockDispatch = vi.fn().mockResolvedValue({ success: true })
  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'approvals') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'app-1', project_id: 'proj-1', status: 'pending', title: 'Figma System' },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }
      }
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'proj-1',
                  project_name: 'Alpha App',
                  client_name: 'Bob',
                  passcode: null,
                  webhook_url: 'https://discord.com/api/webhooks/xyz',
                  webhook_enabled: true,
                },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    }),
  }
  return { mockDispatch, mockSupabase }
})

vi.mock('@/lib/notifications', () => ({
  notifyFreelancerOfApproval: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/webhooks', () => ({
  dispatchWebhook: (...args: any[]) => mockDispatch(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

describe('PATCH /api/approvals/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates approval status and dispatches webhook', async () => {
    const req = new Request('http://localhost/api/approvals/app-1', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Looks amazing!',
      }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'app-1' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockDispatch).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/xyz',
      expect.objectContaining({
        title: '✅ Milestone Deliverable Approved',
        type: 'approval',
      })
    )
  })
})
