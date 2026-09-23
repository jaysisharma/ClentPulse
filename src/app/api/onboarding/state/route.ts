import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { trackActivationEvent } from '@/lib/activation'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch user profile with onboarding fields
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, email, name, studio_name, accent_color, logo_url, onboarding_step, onboarding_persona, onboarding_project_id, onboarding_org_id, onboarded, plan, craft, enabled_modules')
      .eq('id', user.id)
      .single()

    if (error) {
      // Fallback query if migration columns not yet present in schema cache
      const { data: fallback } = await supabase
        .from('users')
        .select('id, email, name, accent_color, logo_url, onboarded, plan')
        .eq('id', user.id)
        .single()

      return NextResponse.json({
        profile: fallback ? {
          ...fallback,
          studio_name: null,
          onboarding_step: 'welcome',
          onboarding_persona: 'freelancer',
          craft: 'general',
          enabled_modules: null,
          onboarding_project_id: null,
          onboarding_org_id: null,
        } : null,
        project: null,
        organization: null,
      })
    }

    let project = null
    if (profile?.onboarding_project_id) {
      const { data: proj } = await supabase
        .from('projects')
        .select('id, project_name, client_name, client_email, slug, color, passcode, created_at')
        .eq('id', profile.onboarding_project_id)
        .maybeSingle()
      project = proj
    }

    let organization = null
    if (profile?.onboarding_org_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, name, slug, accent_color, logo_url')
        .eq('id', profile.onboarding_org_id)
        .maybeSingle()
      organization = org
    }

    return NextResponse.json({
      profile,
      project,
      organization,
    })
  } catch (err: any) {
    console.error('[GET /api/onboarding/state error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const updates: Record<string, any> = {}

    if (body.name !== undefined) updates.name = String(body.name).trim()
    if (body.studio_name !== undefined) updates.studio_name = String(body.studio_name).trim()
    if (body.accent_color !== undefined) updates.accent_color = body.accent_color
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url
    if (body.onboarding_step !== undefined) updates.onboarding_step = body.onboarding_step
    if (body.onboarding_persona !== undefined) updates.onboarding_persona = body.onboarding_persona
    if (body.craft !== undefined) updates.craft = body.craft
    if (body.enabled_modules !== undefined) updates.enabled_modules = body.enabled_modules
    if (body.onboarding_project_id !== undefined) updates.onboarding_project_id = body.onboarding_project_id
    if (body.onboarding_org_id !== undefined) updates.onboarding_org_id = body.onboarding_org_id
    if (body.onboarded !== undefined) updates.onboarded = Boolean(body.onboarded)

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.warn('[POST /api/onboarding/state update warning]:', error.message)
      // If error is due to missing columns before migration, attempt base fields update
      const baseUpdates: Record<string, any> = {}
      if (updates.name !== undefined) baseUpdates.name = updates.name
      if (updates.accent_color !== undefined) baseUpdates.accent_color = updates.accent_color
      if (updates.logo_url !== undefined) baseUpdates.logo_url = updates.logo_url
      if (updates.onboarded !== undefined) baseUpdates.onboarded = updates.onboarded

      await supabase.from('users').update(baseUpdates).eq('id', user.id)
    }

    if (updates.onboarded === true) {
      await trackActivationEvent({
        supabase,
        userId: user.id,
        eventName: 'onboarding_completed',
        projectId: updates.onboarding_project_id || null,
        metadata: { persona: updates.onboarding_persona || 'freelancer' },
      })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    console.error('[POST /api/onboarding/state error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
