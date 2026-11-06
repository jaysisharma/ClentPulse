import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { projectId, entityType, entityId, viewerSource = 'client' } = body

    if (!projectId || !entityType) {
      return NextResponse.json({ error: 'Missing projectId or entityType' }, { status: 400 })
    }

    const validTypes = ['portal', 'invoice', 'contract', 'doc']
    if (!validTypes.includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 })
    }

    const headersList = await headers()
    const rawIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
    const clientIp = rawIp.split(',')[0].trim()
    const userAgent = headersList.get('user-agent') || ''
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16)

    const admin = createAdminClient()

    // 1. Verify project exists
    const { data: project } = await admin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    // 2. Update project's client_last_viewed_at
    await admin
      .from('projects')
      .update({ client_last_viewed_at: now })
      .eq('id', projectId)

    // 3. Update specific entity view stats if provided
    if (entityId) {
      if (entityType === 'invoice') {
        const { data: inv } = await admin
          .from('invoices')
          .select('view_count')
          .eq('id', entityId)
          .maybeSingle()
        const currentCount = Number(inv?.view_count ?? 0)
        await admin
          .from('invoices')
          .update({ last_viewed_at: now, view_count: currentCount + 1 })
          .eq('id', entityId)
      } else if (entityType === 'contract') {
        const { data: cont } = await admin
          .from('contracts')
          .select('view_count')
          .eq('id', entityId)
          .maybeSingle()
        const currentCount = Number(cont?.view_count ?? 0)
        await admin
          .from('contracts')
          .update({ last_viewed_at: now, view_count: currentCount + 1 })
          .eq('id', entityId)
      } else if (entityType === 'doc') {
        const { data: doc } = await admin
          .from('documents')
          .select('view_count')
          .eq('id', entityId)
          .maybeSingle()
        const currentCount = Number(doc?.view_count ?? 0)
        await admin
          .from('documents')
          .update({ last_viewed_at: now, view_count: currentCount + 1 })
          .eq('id', entityId)
      }
    }

    // 4. Log detailed view in client_activity_views (catch table missing gracefully)
    await admin
      .from('client_activity_views')
      .insert({
        project_id: projectId,
        entity_type: entityType,
        entity_id: entityId || null,
        viewer_source: viewerSource,
        user_agent: userAgent.slice(0, 255),
        ip_hash: ipHash,
        viewed_at: now,
      })
      .then(() => {}, () => {}) // silent catch if table pending migration

    return NextResponse.json({ success: true, timestamp: now })
  } catch (error: any) {
    console.error('[Telemetry Read Receipt Error]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

