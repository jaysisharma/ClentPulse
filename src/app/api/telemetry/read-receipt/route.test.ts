import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSelect = vi.fn()

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'projects') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'proj-123' }, error: null }),
          }),
        }),
        update: mockUpdate,
      }
    }
    if (table === 'invoices') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { view_count: 2 }, error: null }),
          }),
        }),
        update: mockUpdate,
      }
    }
    if (table === 'client_activity_views') {
      return {
        insert: mockInsert,
      }
    }
    return {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) }) }),
      update: mockUpdate,
      insert: mockInsert,
    }
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Map([
      ['x-forwarded-for', '203.0.113.195'],
      ['user-agent', 'Mozilla/5.0 Chrome/120.0'],
    ])
  ),
}))

describe('POST /api/telemetry/read-receipt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects requests with missing required fields', async () => {
    const req = new Request('http://localhost/api/telemetry/read-receipt', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Missing projectId/)
  })

  it('rejects requests with invalid entityType', async () => {
    const req = new Request('http://localhost/api/telemetry/read-receipt', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'proj-123', entityType: 'invalid-type' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Invalid entityType/)
  })

  it('records portal read receipt and updates project client_last_viewed_at', async () => {
    const req = new Request('http://localhost/api/telemetry/read-receipt', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        entityType: 'portal',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
  })

  it('increments view_count when entityType is invoice', async () => {
    const req = new Request('http://localhost/api/telemetry/read-receipt', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-123',
        entityType: 'invoice',
        entityId: 'inv-456',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ view_count: 3 })
    )
  })
})

