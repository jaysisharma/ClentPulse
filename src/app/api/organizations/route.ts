import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/workspace'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Try standard joined query
    const { data: members, error } = await supabase
      .from('organization_members')
      .select('role, org_id, organization:organizations(*)')
      .eq('user_id', user.id)

    if (error) {
      console.warn('[GET /api/organizations] Primary query notice:', error.message)

      // Check if table does not exist yet (migration pending)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.info('[GET /api/organizations] organization_members table not yet migrated. Returning empty memberships.')
        return NextResponse.json({ memberships: [] })
      }

      // 2. Fallback: query organization_members and organizations separately
      // (Handles PostgREST relationship cache or schema reload delays)
      const { data: rawMembers, error: rawError } = await supabase
        .from('organization_members')
        .select('role, org_id')
        .eq('user_id', user.id)

      if (rawError || !rawMembers || rawMembers.length === 0) {
        return NextResponse.json({ memberships: [] })
      }

      const orgIds = rawMembers.map(m => m.org_id).filter(Boolean)
      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)

      const orgMap = new Map((orgs || []).map(o => [o.id, o]))
      const formatted = rawMembers
        .map(m => ({
          role: m.role,
          org_id: m.org_id,
          organization: orgMap.get(m.org_id) || null,
        }))
        .filter(m => m.organization !== null)

      return NextResponse.json({ memberships: formatted })
    }

    return NextResponse.json({ memberships: members ?? [] })
  } catch (err: any) {
    console.error('[GET /api/organizations unexpected error]:', err)
    return NextResponse.json({ memberships: [] })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const name = (body.name || '').trim()
  if (!name) return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })

  let baseSlug = slugify(body.slug || name)
  if (!baseSlug) baseSlug = 'agency'

  // Ensure unique slug
  let slug = baseSlug
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`
  }

  // 1. Create Organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      accent_color: body.accent_color || '#6366F1',
      created_by: user.id,
      billing_plan: 'free',
    })
    .select()
    .single()

  if (orgError) {
    console.error('[POST /api/organizations error]:', orgError)
    const isMissingTable = orgError.code === '42P01' || orgError.message?.includes('does not exist')
    const message = isMissingTable
      ? 'Database setup required: Please run deploy/agency-full-suite-migration.sql in your Supabase SQL Editor.'
      : orgError.message
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // 2. Add creator as Owner in organization_members
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    console.error('[POST /api/organizations memberError]:', memberError)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ organization: org }, { status: 201 })
}
