'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={signOut}
      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
    >
      <LogOut className="w-4 h-4" />Sign out
    </button>
  )
}
