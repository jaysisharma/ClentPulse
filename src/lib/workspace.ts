import { Workspace, Organization, OrganizationMember } from '@/types'

export const ACTIVE_WORKSPACE_COOKIE = 'frevio_active_workspace'

/**
 * Normalizes text to a clean URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Gets the active workspace ID from cookie or falls back to 'personal'
 */
export function parseActiveWorkspaceId(cookieValue?: string | null): string {
  if (!cookieValue || cookieValue === 'personal') {
    return 'personal'
  }
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(cookieValue) ? cookieValue : 'personal'
}

/**
 * Client helper to set active workspace cookie
 */
export function setActiveWorkspaceCookie(workspaceId: string) {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${ACTIVE_WORKSPACE_COOKIE}=${encodeURIComponent(workspaceId)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Formats a user's joined organizations and personal workspace into a unified list of Workspaces
 */
export function formatWorkspaces(
  memberships: Array<{
    role: string
    organization: Organization
  }>,
  personalName?: string | null
): Workspace[] {
  const workspaces: Workspace[] = [
    {
      id: 'personal',
      type: 'personal',
      name: personalName ? `${personalName}'s Studio` : 'Personal Studio',
    },
  ]

  for (const m of memberships) {
    if (m.organization) {
      workspaces.push({
        id: m.organization.id,
        type: 'agency',
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role as 'owner' | 'admin' | 'member',
        logo_url: m.organization.logo_url,
        accent_color: m.organization.accent_color,
      })
    }
  }

  return workspaces
}

/**
 * Resolves the primary agency organization ID for a user based on their memberships.
 * If user belongs to any agency organization, returns their primary agency ID.
 * Otherwise returns null.
 */
export function resolvePrimaryAgencyId(
  memberships?: Array<{
    role?: string
    organization?: Organization | null
  }> | null
): string | null {
  if (!memberships || memberships.length === 0) return null
  const owned = memberships.find(m => m.organization && (m.role === 'owner' || m.role === 'admin'))
  if (owned?.organization?.id) return owned.organization.id
  const first = memberships.find(m => m.organization?.id)
  return first?.organization?.id ?? null
}

