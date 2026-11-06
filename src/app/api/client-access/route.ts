import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

// Create (or reset) the portal login for a project's client. Used when creating a
// project and from project settings. Scoped: only the project's owner can do this,
// and only for that project's client email.
//
// Body: { projectId, password, createOnly? }
//   createOnly — never touch an existing account; return 409 { existed: true } instead.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await rateLimit(`client-access:${user.id}`, 20, 60 * 60_000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { projectId, password, createOnly } = await request.json()
  if (!projectId || !password) return NextResponse.json({ error: 'Missing project or password' }, { status: 400 })
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // Verify the requester owns this project and pull its client email.
  const { data: project } = await supabase
    .from('projects')
    .select('client_email')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const clientEmail: string | null = project.client_email?.trim() || null
  if (!clientEmail) return NextResponse.json({ error: 'Add a client email to this project first.' }, { status: 400 })
  if (clientEmail.toLowerCase() === (user.email ?? '').toLowerCase()) {
    return NextResponse.json({ error: 'Use a different email for the client than your own account.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Every auth user gets a public.users row (handle_new_user trigger) keyed by
  // their auth id, so we can resolve an existing client by email there.
  const { data: existing } = await admin
    .from('users')
    .select('id')
    .ilike('email', clientEmail.replace(/[\\%_]/g, '\\$&'))
    .maybeSingle()

  if (existing) {
    const existedResponse = (error: string) =>
      NextResponse.json({ error, existed: true, email: clientEmail }, { status: 409 })

    if (createOnly) {
      return existedResponse('This client already has a Frevio account. Share the login link with them instead.')
    }

    // Guard against account takeover: only (re)set a portal password for an
    // account that is ALREADY a client. If this email belongs to a freelancer
    // (or any non-client account), refuse — otherwise we'd overwrite their
    // password and demote them to a client, locking them out of their own work.
    const { data: existingAuth } = await admin.auth.admin.getUserById(existing.id)
    const role = existingAuth?.user?.user_metadata?.role as string | undefined
    if (role !== 'client') {
      return existedResponse('That email already belongs to a Frevio account. Use a different email for this client.')
    }

    // A client can work with several studios. Only reset the password if every
    // project this client can see belongs to the requester (or their orgs) —
    // otherwise one studio could take over a client shared with another.
    const [{ data: linkedById }, { data: linkedByEmail }, { data: memberships }] = await Promise.all([
      admin.from('projects').select('user_id, org_id').eq('client_user_id', existing.id),
      admin.from('projects').select('user_id, org_id').eq('client_email', clientEmail),
      admin.from('organization_members').select('org_id').eq('user_id', user.id),
    ])
    const myOrgIds = new Set((memberships ?? []).map(m => m.org_id))
    const linked = [...(linkedById ?? []), ...(linkedByEmail ?? [])]
    const sharedWithOthers = linked.some(p => p.user_id !== user.id && !(p.org_id && myOrgIds.has(p.org_id)))
    if (sharedWithOthers) {
      return existedResponse(
        'This client also works with another studio on Frevio, so their password can’t be changed here. They can reset it from the login page.'
      )
    }

    const { error } = await admin.auth.admin.updateUserById(existing.id, { password })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, email: clientEmail, updated: true })
  }

  const { error } = await admin.auth.admin.createUser({
    email: clientEmail,
    password,
    email_confirm: true,
    user_metadata: { role: 'client' },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, email: clientEmail, updated: false })
}
