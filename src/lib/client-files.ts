import { cookies } from 'next/headers'
import { verifyPasscodeTicket, timingSafeCompare } from '@/lib/passcode-crypto'

export * from '@/lib/client-files-shared'

/**
 * Same rule as the public portal page: anyone with the link can view, unless the
 * project has a passcode, in which case the signed session cookie is required.
 */
export async function hasPortalAccess(project: { id: string; slug: string; passcode?: string | null }): Promise<boolean> {
  if (!project.passcode) return true
  const cookieStore = await cookies()
  const ticketOrPass = cookieStore.get(`client_project_passcode_${project.slug}`)?.value
  if (verifyPasscodeTicket(ticketOrPass, project.id, project.slug)) return true
  return Boolean(ticketOrPass && timingSafeCompare(ticketOrPass, project.passcode))
}
