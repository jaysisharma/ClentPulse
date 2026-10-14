import { createClient } from '@/lib/supabase/server'
import { TasteLanding } from '@/components/landing/taste-landing'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return <TasteLanding isLoggedIn={isLoggedIn} signupHref={signupHref} />
}
