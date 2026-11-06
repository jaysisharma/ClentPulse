import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadClientWorkspace } from '@/lib/client-workspace'

/** The signed-in client and everything they can see. Redirects to login if signed out. */
export const requireClientWorkspace = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const workspace = await loadClientWorkspace(user)
  return {
    email: user.email ?? '',
    fullName: (user.user_metadata?.full_name as string | undefined) ?? undefined,
    workspace,
  }
})
