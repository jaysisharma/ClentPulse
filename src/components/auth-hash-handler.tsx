'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash) return

    // If OAuth or magic link returned tokens in the URL hash (#access_token=... or #error=...)
    if (hash.includes('access_token=') || hash.includes('error=')) {
      const supabase = createClient()
      supabase.auth.getSession().then((res: any) => {
        if (res?.data?.session && !res?.error) {
          // Clean hash from URL without causing reload
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          router.push('/dashboard')
          router.refresh()
        }
      })
    }
  }, [router])

  return null
}
