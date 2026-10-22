import type { Viewport } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HomeLanding } from '@/components/landing/home/home-landing'

export const viewport: Viewport = {
  themeColor: '#0B0B0C',
  colorScheme: 'dark',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return <HomeLanding isLoggedIn={isLoggedIn} signupHref={signupHref} />
}
