import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveModules } from '@/lib/modules'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('craft, enabled_modules')
      .eq('id', user.id)
      .single()

    const resolved = resolveModules(profile?.enabled_modules)
    return NextResponse.json({
      craft: profile?.craft || 'general',
      modules: resolved,
    })
  } catch (err: any) {
    console.error('[GET /api/users/modules error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const modules = body.modules ? resolveModules(body.modules) : undefined
    const craft = body.craft

    const updates: Record<string, any> = {}
    if (modules) updates.enabled_modules = modules
    if (craft) updates.craft = craft

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('craft, enabled_modules')
      .single()

    if (error) {
      console.error('[PATCH /api/users/modules error]:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      craft: data.craft,
      modules: resolveModules(data.enabled_modules),
    })
  } catch (err: any) {
    console.error('[PATCH /api/users/modules error]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
