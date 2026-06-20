import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Set (or update) the portal password for a project's client. Used from project
// settings so a client added without a password — e.g. during onboarding — can be
// granted portal access later. Scoped: only the project's owner can do this, and
// only for that project's client email.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, password } = await request.json()
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

  const clientEmail: string | null = project.client_email
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
    .eq('email', clientEmail)
    .maybeSingle()

  if (existing) {
    // Guard against account takeover: only (re)set a portal password for an
    // account that is ALREADY a client. If this email belongs to a freelancer
    // (or any non-client account), refuse — otherwise we'd overwrite their
    // password and demote them to a client, locking them out of their own work.
    const { data: existingAuth } = await admin.auth.admin.getUserById(existing.id)
    const role = existingAuth?.user?.user_metadata?.role as string | undefined
    if (role !== 'client') {
      return NextResponse.json(
        { error: 'That email already belongs to a Frevio account. Use a different email for this client.' },
        { status: 409 },
      )
    }

    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: { role: 'client' },
    })
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
