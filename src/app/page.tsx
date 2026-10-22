import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/landing/landing-page'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return <LandingPage isLoggedIn={isLoggedIn} signupHref={signupHref} />
}
