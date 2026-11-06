import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashToken } from '@/lib/extension-auth'

const createQueryBuilder = (config: {
  singleResult?: any
  selectResult?: any
}) => {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn().mockResolvedValue(config.singleResult ?? { data: null, error: null }),
    then: vi.fn((resolve?: any) =>
      typeof resolve === 'function' ? resolve(config.selectResult ?? { data: [], error: null }) : Promise.resolve()
    ),
  }
  return builder
}

let adminFromMap: Record<string, any> = {}

const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (adminFromMap[table]) {
      return adminFromMap[table]()
    }
    return createQueryBuilder({})
  }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

import { POST as recordTimeEntry } from './route'

describe('POST /api/extension/time-entry', () => {
  const validToken = 'frev_live_tokencatchup1234567890abcdef123'
  const validTokenHash = hashToken(validToken)

  beforeEach(() => {
    vi.clearAllMocks()
    adminFromMap = {
      api_tokens: () =>
        createQueryBuilder({
          singleResult: {
            data: { id: 'tok_1', user_id: 'user_dev_1', token_hash: validTokenHash },
            error: null,
          },
        }),
      projects: () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'proj_1',
              user_id: 'user_dev_1',
              project_name: 'Frevio Cloud',
              hourly_rate: 100,
            },
            error: null,
          },
        }),
      time_entries: () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'entry_1',
              project_id: 'proj_1',
              hours: 0.5,
              description: 'Browser testing (Chrome DevTools)',
              date: '2026-11-05',
            },
            error: null,
          },
          selectResult: {
            data: [{ hours: 0.5 }, { hours: 1.0 }],
            error: null,
          },
        }),
    }
  })

  it('rejects without auth token', async () => {
    const res = await recordTimeEntry(new Request('http://localhost/api/extension/time-entry', { method: 'POST' }))
    expect(res.status).toBe(401)
  })

  it('validates hours input', async () => {
    const res = await recordTimeEntry(
      new Request('http://localhost/api/extension/time-entry', {
        method: 'POST',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'proj_1', hours: -1 }),
      })
    )
    expect(res.status).toBe(400)
  })

  it('records catch-up time entry and returns calculated totals', async () => {
    const res = await recordTimeEntry(
      new Request('http://localhost/api/extension/time-entry', {
        method: 'POST',
        headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'proj_1',
          hours: 0.5,
          description: 'Browser testing in Chrome',
        }),
      })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.todayHours).toBe(1.5)
    expect(data.billableToday).toBe(150)
  })
})
