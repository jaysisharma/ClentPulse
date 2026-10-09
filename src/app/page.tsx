import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { OveradsNavbar } from '@/components/landing/overads-navbar'

export const metadata: Metadata = {
  title: 'Frevio Cloud — Client Workspace & Business Management',
  description:
    'The client workspace that keeps projects moving and clients informed.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const signupHref = isLoggedIn ? '/dashboard' : '/auth/login?mode=signup'

  return (
    <div className="min-h-screen bg-[#101113] text-[#F5F5F3] font-sans antialiased selection:bg-indigo-500/30 selection:text-white flex flex-col">
      {/* ── Navigation Bar ── */}
      <OveradsNavbar isLoggedIn={isLoggedIn} signupHref={signupHref} />

      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-light tracking-tight text-[#F5F5F3]">
            Frevio Cloud
          </h1>
          <p className="text-sm text-[#A1A5AD]">
            Navbar active. What should we build next?
          </p>
        </div>
      </main>
    </div>
  )
}
