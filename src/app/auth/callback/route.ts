import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const oauthError = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Derive origin respecting reverse proxies (Vercel, Railway, Nginx)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocal = process.env.NODE_ENV === 'development'
  const origin = (!isLocal && forwardedHost)
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin

  if (oauthError) {
    console.error('[Auth Callback] OAuth error from provider:', oauthError, errorDescription)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDescription || oauthError)}`)
  }

  // Only allow same-origin relative paths to avoid open-redirects
  const nextParam = requestUrl.searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
    ? nextParam
    : null

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] exchangeCodeForSession failed:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    // An explicit, validated next (e.g. password reset → /settings) wins
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile?.onboarded) {
        // Send Welcome email and track signup asynchronously
        const { sendWelcomeEmail } = await import('@/lib/emails/onboarding')
        sendWelcomeEmail({
          email: user.email || '',
          name: (user.user_metadata?.full_name || user.user_metadata?.name || '') as string
        }).catch(() => {})

        const { trackActivationEvent } = await import('@/lib/activation')
        trackActivationEvent({
          supabase,
          userId: user.id,
          eventName: 'signup_completed',
          metadata: { auth_method: 'google_oauth' }
        }).catch(() => {})

        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next ?? '/dashboard'}`)
}
