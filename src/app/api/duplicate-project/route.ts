import { createClient } from '@/lib/supabase/server'
import { checkAndSyncPromoPlan } from '@/lib/plans'
import { NextResponse } from 'next/server'

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).slice(2, 6)
}

export async function POST(request: Request) {
  const { projectId } = await request.json()
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: source } = await supabase
    .from('projects')
    .select('project_name, client_name, client_email, color, budget, hourly_rate')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!source) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Free plan check
  const { data: profile } = await supabase.from('users').select('id, plan, promo_pro, created_at').eq('id', user.id).single()
  const syncedPlan = await checkAndSyncPromoPlan(profile, supabase)
  if (syncedPlan !== 'pro') {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Free plan is limited to 3 projects. Upgrade to Pro.' }, { status: 403 })
    }
  }

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert({
      user_id:      user.id,
      project_name: `${source.project_name} (copy)`,
      client_name:  source.client_name,
      client_email: source.client_email,
      color:        source.color,
      budget:       source.budget,
      hourly_rate:  source.hourly_rate,
      slug:         generateSlug(source.project_name),
      status:       'active',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: newProject.id })
}
