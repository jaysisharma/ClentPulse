import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasPortalAccess } from '@/lib/client-files'
import type { User } from '@supabase/supabase-js'

export interface ProjectAccess {
  project: { id: string; user_id: string; org_id: string | null; slug: string; passcode: string | null; project_name: string }
  user: User | null
  /** Project owner or a member of the project's organization. */
  isWorkspaceMember: boolean
  /** Workspace member, or a portal visitor who passed the passcode gate (if any). */
  canActAsClient: boolean
}

/**
 * Resolves who may act on a project for routes shared by the studio and the public
 * portal. The project is loaded with the service role because `projects` has no
 * public read policy; callers must check the returned flags before writing.
 */
export async function getProjectAccess(projectId: string): Promise<ProjectAccess | null> {
  const admin = createAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id, org_id, slug, passcode, project_name')
    .eq('id', projectId)
    .maybeSingle()
  if (!project) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isWorkspaceMember = false
  if (user) {
    if (project.user_id === user.id) {
      isWorkspaceMember = true
    } else if (project.org_id) {
      const { data: member } = await admin
        .from('organization_members')
        .select('role')
        .eq('org_id', project.org_id)
        .eq('user_id', user.id)
        .maybeSingle()
      isWorkspaceMember = !!member
    }
  }

  const canActAsClient = isWorkspaceMember || (await hasPortalAccess(project))
  return { project, user, isWorkspaceMember, canActAsClient }
}
