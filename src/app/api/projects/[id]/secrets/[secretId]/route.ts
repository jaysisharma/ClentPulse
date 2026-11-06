import { NextResponse } from 'next/server'
import { getProjectAccess } from '@/lib/project-access'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
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
    const { error } = await admin
      .from('project_secrets')
      .delete()
      .eq('id', secretId)
      .eq('project_id', projectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedId: secretId })
  } catch (err: any) {
    console.error('[Delete Secret Error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

