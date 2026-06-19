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
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next ?? '/dashboard'}`)
}
