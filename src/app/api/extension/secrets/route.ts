import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { maskSecretValue, openProjectSecret } from '@/lib/secrets-vault'

export async function GET(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify project ownership
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const { data: secrets, error } = await admin
    .from('project_secrets')
    .select('id, project_id, title, category, notes, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const maskedSecrets = (secrets || []).map(s => ({
    ...s,
    maskedValue: maskSecretValue(),
  }))

  return NextResponse.json({ success: true, secrets: maskedSecrets })
}

export async function POST(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { projectId, secretId } = body

  if (!projectId || !secretId) {
    return NextResponse.json({ error: 'Missing projectId or secretId' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify ownership
  const { data: project } = await admin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .eq('user_id', auth.userId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const { data: secret, error } = await admin
    .from('project_secrets')
    .select('id, title, category, encrypted_value')
    .eq('id', secretId)
    .eq('project_id', projectId)
    .single()

  if (error || !secret) {
    return NextResponse.json({ error: 'Secret not found' }, { status: 404 })
  }

  const decrypted = openProjectSecret(secret.encrypted_value)
  if (!decrypted) {
    return NextResponse.json({ error: 'Failed to decrypt secret' }, { status: 500 })
  }

  // Update audit timestamp
  await admin
    .from('project_secrets')
    .update({ last_revealed_at: new Date().toISOString() })
    .eq('id', secretId)

  return NextResponse.json({
    success: true,
    title: secret.title,
    category: secret.category,
    secretValue: decrypted,
  })
}

