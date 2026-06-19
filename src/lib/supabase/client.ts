import { createBrowserClient } from '@supabase/ssr'
import { parse, serialize, type SerializeOptions } from 'cookie'

let client: ReturnType<typeof createBrowserClient> | undefined

const REMEMBER_KEY = 'cp-remember'

/**
 * Records the user's "Remember me" choice. Call this before signing in.
 * When false, auth cookies become session cookies and are dropped when the
 * browser closes; when true (default) they persist with Supabase's expiry.
 */
export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
}

function shouldPersist(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

export function createClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          const parsed = parse(document.cookie)
          return Object.entries(parsed).map(([name, value]) => ({
            name,
            value: value ?? '',
          }))
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          const persist = shouldPersist()
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts: SerializeOptions = { ...options }
            // No expiry => session cookie, cleared when the browser closes.
            if (!persist) {
              delete opts.maxAge
              delete opts.expires
            }
            document.cookie = serialize(name, value, opts)
          })
        },
      },
    }
  )
  return client
}
