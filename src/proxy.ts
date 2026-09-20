import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const SYSTEM_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  'frevio.app',
  'www.frevio.app',
  'frevio.cloud',
  'www.frevio.cloud',
])

export async function proxy(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const cleanHost = host.split(':')[0].toLowerCase()

  const isCustomDomain =
    cleanHost.length > 0 &&
    !SYSTEM_HOSTS.has(cleanHost) &&
    !cleanHost.endsWith('.frevio.cloud') &&
    !cleanHost.endsWith('.frevio.app') &&
    !cleanHost.endsWith('.vercel.app') &&
    !cleanHost.endsWith('.railway.app')

  const { pathname } = request.nextUrl

  // Handle custom domain CNAME routing for agency client portals
  if (isCustomDomain) {
    // If request is on a custom domain, rewrite root or bare slug to /p/[slug]
    // e.g. status.youragency.com/launch -> /p/launch
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico')) {
      const targetPath = pathname.startsWith('/p/')
        ? pathname
        : pathname === '/'
        ? '/client/login'
        : `/p${pathname}`

      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = targetPath

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-custom-domain', cleanHost)

      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    }
  }

  const response = await updateSession(request)

  const refParam = request.nextUrl.searchParams.get('ref')
  if (refParam && refParam.trim().length > 0) {
    response.cookies.set('frevio_ref', refParam.trim().slice(0, 50), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
