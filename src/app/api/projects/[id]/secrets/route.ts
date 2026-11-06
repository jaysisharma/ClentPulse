import { NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/project-access'
import { createAdminClient } from '@/lib/supabase/admin'
import { sealProjectSecret, maskSecretValue, type SecretCategory } from '@/lib/secrets-vault'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const access = await getProjectAccess(projectId)
    if (!access || !access.canActAsClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: rows, error } = await admin
      .from('project_secrets')
      .select('id, project_id, title, category, notes, created_by, last_revealed_at, reveal_count, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const maskedSecrets = (rows || []).map(r => ({
      ...r,
      maskedValue: maskSecretValue(),
    }))

    return NextResponse.json({ secrets: maskedSecrets })
  } catch (err: any) {
    console.error('[Get Project Secrets Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const access = await getProjectAccess(projectId)
    if (!access || !access.canActAsClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { title, category = 'api_key', secretValue, notes } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Secret title is required' }, { status: 400 })
    }
    if (!secretValue || typeof secretValue !== 'string' || !secretValue.trim()) {
      return NextResponse.json({ error: 'Secret value is required' }, { status: 400 })
    }

    const validCategories: SecretCategory[] = ['api_key', 'credentials', 'tokens', 'database', 'other']
    const safeCategory = validCategories.includes(category) ? category : 'other'

    const encryptedValue = sealProjectSecret(secretValue.trim())
    const createdByRole = access.isWorkspaceMember ? 'freelancer' : 'client'

    const admin = createAdminClient()
    const { data: inserted, error } = await admin
      .from('project_secrets')
      .insert({
        project_id: projectId,
        title: title.trim(),
        category: safeCategory,
        encrypted_value: encryptedValue,
        notes: notes ? String(notes).trim() : null,
        created_by: createdByRole,
      })
      .select('id, project_id, title, category, notes, created_by, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      secret: {
        ...inserted,
        maskedValue: maskSecretValue(),
      },
    })
  } catch (err: any) {
    console.error('[Add Project Secret Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

