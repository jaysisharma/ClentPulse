import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    rpc: mockRpc,
    from: mockFrom,
  }),
}))

import { POST } from './route'

function makePostRequest(): Request {
  return new Request('http://localhost:3000/api/builds/build-1/download', {
    method: 'POST',
  })
}

describe('/api/builds/[buildId]/download', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('increments download count via RPC when available', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null })
    const res = await POST(makePostRequest(), { params: Promise.resolve({ buildId: 'build-1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.count).toBe(5)
  })

  it('falls back to table update when RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'function not found' } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { download_count: 2 }, error: null }),
      update: vi.fn().mockReturnThis(),
    })

    const res = await POST(makePostRequest(), { params: Promise.resolve({ buildId: 'build-1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.count).toBe(3)
  })
})
