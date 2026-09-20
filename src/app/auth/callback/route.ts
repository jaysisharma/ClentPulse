import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Only allow same-origin relative paths to avoid open-redirects
  const nextParam = searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
    ? nextParam
    : null

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

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
        .single()
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
