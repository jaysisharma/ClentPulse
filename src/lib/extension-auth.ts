import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

export function generateToken(): { token: string; hash: string; preview: string } {
  const raw = crypto.randomBytes(32).toString('hex')
  const token = `frev_live_${raw}`
  const hash = hashToken(token)
  const preview = `frev_live_...${token.slice(-4)}`
  return { token, hash, preview }
}

export async function verifyExtensionRequest(request: Request): Promise<{ userId: string; tokenId: string } | null> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token || !token.startsWith('frev_live_')) {
    return null
  }

  const tokenHash = hashToken(token)
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('api_tokens')
    .select('id, user_id')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !data) {
    return null
  }

  // Update last_used_at in the background (fire & forget)
  admin
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {}, () => {})

  return { userId: data.user_id, tokenId: data.id }
}

/** Loads a project if the extension user owns it or belongs to its organization. */
export async function getManageableProject<T = any>(
  admin: ReturnType<typeof createAdminClient>,
  projectId: string,
  userId: string,
  columns: string
): Promise<T | null> {
  const { data: project } = await admin
    .from('projects')
    .select(`user_id, org_id, ${columns}`)
    .eq('id', projectId)
    .maybeSingle()

  if (!project) return null
  const row = project as any
  if (row.user_id === userId) return project as T

  if (row.org_id) {
    const { data: member } = await admin
      .from('organization_members')
      .select('role')
      .eq('org_id', row.org_id)
      .eq('user_id', userId)
      .maybeSingle()
    if (member) return project as T
  }
  return null
}
