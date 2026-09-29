import { describe, it, expect } from 'vitest'
import { PRIORITY_ZONES, autoSuggestPriorities } from '../project-priority'

describe('Project Priority Canvas', () => {
  it('defines 4 distinct priority zones', () => {
    expect(PRIORITY_ZONES.p0.shortLabel).toBe('P0')
    expect(PRIORITY_ZONES.p1.shortLabel).toBe('P1')
    expect(PRIORITY_ZONES.p2.shortLabel).toBe('P2')
    expect(PRIORITY_ZONES.p3.shortLabel).toBe('P3')
  })

  it('suggests P0 for projects with pending approvals or unsigned contracts', () => {
    const mockProjects = [
      {
        id: 'proj_blocked',
        status: 'active',
        created_at: new Date().toISOString(),
        approvals: [{ status: 'pending' }],
        contracts: [],
        updates: [],
      },
      {
        id: 'proj_active',
        status: 'active',
        created_at: new Date().toISOString(),
        approvals: [{ status: 'approved' }],
        contracts: [{ signed_at: new Date().toISOString() }],
        updates: [{ sent_at: new Date().toISOString() }],
      },
      {
        id: 'proj_paused',
        status: 'paused',
        created_at: new Date().toISOString(),
        approvals: [],
        contracts: [],
        updates: [],
      },
    ]

    const suggestions = autoSuggestPriorities(mockProjects)
    expect(suggestions.proj_blocked).toBe('p0')
    expect(suggestions.proj_active).toBe('p1')
    expect(suggestions.proj_paused).toBe('p3')
  })
})
