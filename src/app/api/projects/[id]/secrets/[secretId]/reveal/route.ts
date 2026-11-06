import { NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/project-access'
import { createAdminClient } from '@/lib/supabase/admin'
import { openProjectSecret } from '@/lib/secrets-vault'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; secretId: string }> }
) {
  try {
    const { id: projectId, secretId } = await params
    const access = await getProjectAccess(projectId)
    if (!access || !access.canActAsClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: secret, error } = await admin
      .from('project_secrets')
      .select('id, project_id, title, encrypted_value, reveal_count')
      .eq('id', secretId)
      .eq('project_id', projectId)
      .single()

    if (error || !secret) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 })
    }

    const decrypted = openProjectSecret(secret.encrypted_value)
    if (!decrypted) {
      return NextResponse.json({ error: 'Unable to decrypt secret' }, { status: 500 })
    }

    const now = new Date().toISOString()
    const nextCount = Number(secret.reveal_count ?? 0) + 1

    // Update audit timestamp and reveal count
    await admin
      .from('project_secrets')
      .update({
        last_revealed_at: now,
        reveal_count: nextCount,
      })
      .eq('id', secretId)

    return NextResponse.json({
      success: true,
      id: secret.id,
      title: secret.title,
      secretValue: decrypted,
      lastRevealedAt: now,
      revealCount: nextCount,
    })
  } catch (err: any) {
    console.error('[Reveal Secret Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

