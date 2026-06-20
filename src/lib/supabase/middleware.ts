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
  const onOnboardingRoute = pathname === '/onboarding'

  // Not authenticated — send everyone to the single login page
  if (!user) {
    if (onFreelancerRoute || onClientRoute || onOnboardingRoute) {
      return redirect(request, '/auth/login')
    }
    return supabaseResponse
  }

  // Determine role and onboarding status
  let role = user.user_metadata?.role as string | undefined
  let onboarded = false

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, onboarded')
    .eq('id', user.id)
    .maybeSingle()

  if (!role) {
    role = dbUser ? 'freelancer' : 'client'
  }
  onboarded = dbUser?.onboarded ?? false

  const isClient     = role === 'client'
  const isFreelancer = !isClient

  // Client routing rules
  if (isClient) {
    if (onFreelancerRoute || onOnboardingRoute || pathname === '/auth/login') {
      return redirect(request, '/client/dashboard')
    }
    return supabaseResponse
  }

  // Freelancer routing rules
  if (isFreelancer) {
    if (!onboarded) {
      // Freelancer not onboarded: must go to /onboarding
      if (onFreelancerRoute || pathname === '/auth/login') {
        return redirect(request, '/onboarding')
      }
    } else {
      // Freelancer onboarded: cannot go to /onboarding, /client/dashboard, or /auth/login
      if (onOnboardingRoute || onClientRoute || pathname === '/auth/login') {
        return redirect(request, '/dashboard')
      }
    }
    return supabaseResponse
  }

  return supabaseResponse
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url)
}
