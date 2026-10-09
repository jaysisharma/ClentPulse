import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

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
    <div className="min-h-screen bg-[#101113] text-[#F5F5F3] font-sans antialiased flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
          <span>Ready for Rebuild</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-[#F5F5F3]">
          Frevio Cloud
        </h1>
        <p className="text-sm text-[#A1A5AD]">
          Landing page cleared. Ready to design and build our next concept.
        </p>
      </div>
    </div>
  )
}
