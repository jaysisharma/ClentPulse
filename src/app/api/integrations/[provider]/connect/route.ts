import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  isValidProvider,
  buildAuthUrl,
  generateOAuthState,
  buildRedirectUri,
} from '@/lib/integrations/oauth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check provider credentials are configured
  const { getProviderCredentials } = await import('@/lib/integrations/providers')
  if (!getProviderCredentials(provider)) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.frevio.cloud'
    return NextResponse.redirect(
      `${appUrl}/settings/integrations?error=not_configured&provider=${provider}`
    )
  }

  const state = generateOAuthState(provider, user.id)
  const redirectUri = buildRedirectUri(provider, request)
  const authUrl = buildAuthUrl(provider, state, redirectUri)

  // Store state in a short-lived cookie for CSRF verification
  const response = NextResponse.redirect(authUrl)
  response.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
