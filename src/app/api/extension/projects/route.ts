import { NextResponse } from 'next/server'
import { verifyExtensionRequest } from '@/lib/extension-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const auth = await verifyExtensionRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Invalid or missing API token.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: projects, error } = await admin
    .from('projects')
    .select('id, project_name, client_name, slug, color, status, hourly_rate, show_live_presence')
    .eq('user_id', auth.userId)
    .neq('status', 'completed')
    .order('project_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: projects || [] })
}
