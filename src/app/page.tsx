import { createClient } from '@/lib/supabase/server'
import { SpatialLanding } from '@/components/landing/spatial-landing'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return <SpatialLanding isLoggedIn={isLoggedIn} signupHref={signupHref} />
}

