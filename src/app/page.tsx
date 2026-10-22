import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// No marketing page for now: send visitors straight into the app.
export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? '/dashboard' : '/auth/login')
}
