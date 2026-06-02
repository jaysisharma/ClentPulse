import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const FREELANCER_PATHS = [
  '/dashboard', '/project', '/clients', '/settings', '/invoices', '/docs',
  '/time', '/earnings', '/testimonials', '/portfolio', '/archive', '/upgrade',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const onFreelancerRoute = FREELANCER_PATHS.some(p => pathname.startsWith(p))
  const onClientRoute     = pathname.startsWith('/client/dashboard')

  // Not authenticated — send everyone to the single login page
  if (!user) {
    if (onFreelancerRoute || onClientRoute) return redirect(request, '/auth/login')
    return supabaseResponse
  }

  // Determine role: metadata first, then fall back to users table presence
  let role = user.user_metadata?.role as string | undefined

  if (!role) {
    const { data } = await supabase.from('users').select('id').eq('id', user.id).maybeSingle()
    role = data ? 'freelancer' : 'client'
  }

  const isClient     = role === 'client'
  const isFreelancer = !isClient

  // Cross-portal access: redirect to the correct portal
  if (isClient     && onFreelancerRoute) return redirect(request, '/client/dashboard')
  if (isFreelancer && onClientRoute)     return redirect(request, '/dashboard')

  // Already logged in, hitting the login page
  if (pathname === '/auth/login') return redirect(request, isClient ? '/client/dashboard' : '/dashboard')

  return supabaseResponse
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url)
}
