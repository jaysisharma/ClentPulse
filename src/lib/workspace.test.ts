import { describe, it, expect } from 'vitest'
import { slugify, parseActiveWorkspaceId, formatWorkspaces, resolvePrimaryAgencyId } from './workspace'

describe('Workspace utilities', () => {
  it('slugifies organization names accurately', () => {
    expect(slugify('Apex Digital Studio')).toBe('apex-digital-studio')
    expect(slugify('  Studio & Co. -- v2  ')).toBe('studio-co-v2')
    expect(slugify('Creative Agency #1!')).toBe('creative-agency-1')
  })

  it('parses active workspace id correctly', () => {
    expect(parseActiveWorkspaceId(null)).toBe('personal')
    expect(parseActiveWorkspaceId(undefined)).toBe('personal')
    expect(parseActiveWorkspaceId('personal')).toBe('personal')
    expect(parseActiveWorkspaceId('invalid-string')).toBe('personal')

    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(parseActiveWorkspaceId(validUuid)).toBe(validUuid)
  })

  it('formats workspaces with personal workspace as default first item', () => {
    const memberships = [
      {
        role: 'owner',
        organization: {
          id: 'org-1',
          name: 'Acme Agency',
          slug: 'acme-agency',
          billing_plan: 'agency_pro' as const,
          created_at: new Date().toISOString(),
        },
      },
    ]

    const result = formatWorkspaces(memberships, 'Alex')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'personal',
      type: 'personal',
      name: "Alex's Studio",
    })
    expect(result[1]).toMatchObject({
      id: 'org-1',
      type: 'agency',
      name: 'Acme Agency',
      role: 'owner',
    })
  })

  it('resolves primary agency id preferring owned organizations', () => {
    expect(resolvePrimaryAgencyId([])).toBeNull()
    expect(resolvePrimaryAgencyId(null)).toBeNull()

    const memberships = [
      {
        role: 'member',
        organization: { id: 'org-member', name: 'Member Org' },
      },
      {
        role: 'owner',
        organization: { id: 'org-owner', name: 'Owner Org' },
      },
    ] as any
    expect(resolvePrimaryAgencyId(memberships)).toBe('org-owner')
  })
})
