import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  isValidProvider,
  verifyOAuthState,
  exchangeCode,
  storeConnection,
  buildRedirectUri,
} from '@/lib/integrations/oauth'
import { logAgencyActivity } from '@/lib/activity'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.frevio.cloud'
  const failUrl = (reason: string) =>
    `${appUrl}/settings/integrations?error=${reason}&provider=${provider}`
  const successUrl = `${appUrl}/settings/integrations?connected=${provider}`

  if (!isValidProvider(provider)) {
    return NextResponse.redirect(failUrl('invalid_provider'))
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  // User denied access
  if (errorParam === 'access_denied') {
    return NextResponse.redirect(failUrl('access_denied'))
  }

  if (!code || !state) {
    return NextResponse.redirect(failUrl('missing_params'))
  }

  // Verify CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get(`oauth_state_${provider}`)?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(failUrl('invalid_state'))
  }

  // Authenticate the Frevio user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/auth/login`)

  // Verify state payload matches authenticated user
  const statePayload = verifyOAuthState(state, provider)
  if (!statePayload || statePayload.userId !== user.id) {
    return NextResponse.redirect(failUrl('state_mismatch'))
  }

  try {
    const redirectUri = buildRedirectUri(provider, request)
    const tokens = await exchangeCode(provider, code, redirectUri)

    // Fetch account identity from provider
    let accountId: string
    let accountEmail: string | null = null

    if (provider === 'google') {
      const { getGoogleAccountInfo } = await import('@/lib/integrations/google')
      const info = await getGoogleAccountInfo(tokens.accessToken)
      accountId = info.id
      accountEmail = info.email
    } else if (provider === 'github') {
      const { getGitHubUser } = await import('@/lib/integrations/github')
      const info = await getGitHubUser(tokens.accessToken)
      accountId = String(info.id)
      accountEmail = info.email
    } else if (provider === 'figma') {
      const { getFigmaUser } = await import('@/lib/integrations/figma')
      const info = await getFigmaUser(tokens.accessToken)
      accountId = info.id
      accountEmail = info.email
    } else {
      return NextResponse.redirect(failUrl('unknown_provider'))
    }

    await storeConnection(supabase, user.id, provider, tokens, {
      accountId,
      email: accountEmail,
    })

    // Log for agencies
    const { data: org } = await supabase
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (org?.org_id) {
      logAgencyActivity({
        supabase,
        orgId: org.org_id,
        userId: user.id,
        action: 'integration_connected',
        entityType: 'integration',
        entityId: provider,
        details: { provider, email: accountEmail },
      }).catch(() => {})
    }
  } catch (err: any) {
    console.error(`[Integration callback/${provider}] Error:`, err?.message)
    return NextResponse.redirect(failUrl('exchange_failed'))
  }

  // Clear the state cookie and redirect to success
  const response = NextResponse.redirect(successUrl)
  response.cookies.set(`oauth_state_${provider}`, '', { maxAge: 0, path: '/' })
  return response
}
