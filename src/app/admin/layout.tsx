import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Resolve auth user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Validate admin privileges
  const { data: profile, error } = await supabase
    .from('users')
    .select('name, plan, is_admin')
    .eq('id', user.id)
    .single()

  if (error || !profile?.is_admin) {
    // Redirect standard users back to the dashboard
    redirect('/dashboard')
  }

  return (
    <AdminShell user={{ name: profile.name ?? null, plan: profile.plan as 'free' | 'pro' }}>
      {children}
    </AdminShell>
  )
}
