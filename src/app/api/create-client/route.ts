import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'client' },
  })

  if (error) {
    // Client already has an account — update their password so the freelancer's chosen one is set
    if (error.message.toLowerCase().includes('already registered')) {
      const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
      const existing = list?.users.find(u => u.email === email)
      if (existing) {
        await admin.auth.admin.updateUserById(existing.id, { password, user_metadata: { role: 'client' } })
        return NextResponse.json({ existed: true })
      }
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ created: true, userId: data.user.id })
}
