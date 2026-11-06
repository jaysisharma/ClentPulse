import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashToken } from '@/lib/extension-auth'

const createQueryBuilder = (config: {
  singleResult?: any
  selectResult?: any
  updateResult?: any
}) => {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
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

import { POST as createDeliverable } from '../deliverables/route'
import { GET as getFigmaFeedback } from './feedback/route'
import { POST as updateCanvasEmbed } from './canvas-embed/route'

describe('Figma Plugin Companion API Routes', () => {
  const validToken = 'frev_live_testtoken1234567890abcdef123456'
  const validTokenHash = hashToken(validToken)

  beforeEach(() => {
    vi.clearAllMocks()
    adminFromMap = {
      api_tokens: () =>
        createQueryBuilder({
          singleResult: {
            data: { id: 'tok_123', user_id: 'user_designer_1', token_hash: validTokenHash },
            error: null,
          },
        }),
      projects: () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'proj_123',
              user_id: 'user_designer_1',
              project_name: 'Acme Design System',
              client_name: 'Alice Corp',
              client_email: 'alice@example.com',
              slug: 'acme-design',
              canvas_embed_url: null,
            },
            error: null,
          },
        }),
      approvals: () =>
        createQueryBuilder({
          singleResult: {
            data: {
              id: 'appr_1',
              project_id: 'proj_123',
              title: 'Mobile Checkout Flow',
              preview_type: 'figma',
              status: 'pending',
            },
            error: null,
          },
          selectResult: {
            data: [
              {
                id: 'appr_rev_1',
                title: 'Homepage Hero',
                feedback: 'Please make CTA button emerald instead of purple.',
                responded_at: '2026-11-05T09:00:00Z',
              },
            ],
            error: null,
          },
        }),
      update_comments: () =>
        createQueryBuilder({
          selectResult: {
            data: [
              {
                id: 'comm_1',
                author_name: 'Alice',
                body: 'Typography in header feels too large on mobile.',
                created_at: '2026-11-05T09:30:00Z',
              },
            ],
            error: null,
          },
        }),
    }
  })

  describe('POST /api/extension/deliverables', () => {
    it('returns 401 without valid Bearer token', async () => {
      const res = await createDeliverable(new Request('http://localhost/api/extension/deliverables', { method: 'POST' }))
      expect(res.status).toBe(401)
    })

    it('returns 400 when missing title or projectId', async () => {
      const res = await createDeliverable(
        new Request('http://localhost/api/extension/deliverables', {
          method: 'POST',
          headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: 'proj_123' }),
        })
      )
      expect(res.status).toBe(400)
    })

    it('successfully creates deliverable with figma preview_type', async () => {
      const res = await createDeliverable(
        new Request('http://localhost/api/extension/deliverables', {
          method: 'POST',
          headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'proj_123',
            title: 'Mobile Checkout Flow',
            url: 'https://www.figma.com/design/xyz123/Checkout',
            previewType: 'figma',
            notes: 'Ready for client review and sign-off.',
          }),
        })
      )
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.approval.title).toBe('Mobile Checkout Flow')
      expect(data.portalUrl).toContain('/p/acme-design')
    })
  })

  describe('GET /api/extension/figma/feedback', () => {
    it('returns 401 without auth token', async () => {
      const res = await getFigmaFeedback(new Request('http://localhost/api/extension/figma/feedback?projectId=proj_123'))
      expect(res.status).toBe(401)
    })

    it('returns client revision requests and comments', async () => {
      const res = await getFigmaFeedback(
        new Request('http://localhost/api/extension/figma/feedback?projectId=proj_123', {
          headers: { Authorization: `Bearer ${validToken}` },
        })
      )
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data.feedback)).toBe(true)
      expect(data.feedback.length).toBe(2)
      expect(data.feedback[0].title).toBeDefined()
      expect(data.feedback[0].text).toBeDefined()
    })
  })

  describe('POST /api/extension/figma/canvas-embed', () => {
    it('updates canvas_embed_url on project', async () => {
      const res = await updateCanvasEmbed(
        new Request('http://localhost/api/extension/figma/canvas-embed', {
          method: 'POST',
          headers: { Authorization: `Bearer ${validToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'proj_123',
            canvasEmbedUrl: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fabc',
          }),
        })
      )
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.canvasEmbedUrl).toContain('figma.com')
    })
  })
})

