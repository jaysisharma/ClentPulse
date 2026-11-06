import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { path, referrer, utm_source, utm_medium, utm_campaign } = body

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    const headersList = await headers()
    const rawIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
    
    // x-forwarded-for can be a list of IPs, get the first client one
    const clientIp = rawIp.split(',')[0].trim()
    const userAgent = headersList.get('user-agent') || ''

    // Insert visit via admin client to guarantee execution and bypass policy constraints
    const adminClient = createAdminClient()

    // Ensure we only insert one visit per IP address per 24 hours to prevent inflation
    const { data: recentVisit } = await adminClient
      .from('page_visits')
      .select('id')
      .eq('ip_address', clientIp)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle()

    if (recentVisit) {
      return NextResponse.json({ success: true, duplicated: true })
    }

    // Resolve user session if authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { country, city } = await resolveLocation(headersList, clientIp)

    const { error } = await adminClient.from('page_visits').insert({
      ip_address: clientIp,
      user_agent: userAgent,
      path,
      referrer: referrer || null,
      user_id: user?.id || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      country,
      city,
    })

    if (error) {
      console.error('[Analytics Track] DB Insert Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Analytics Track] Unexpected Exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

function countryName(code: string | null | undefined): string | null {
  if (!code || !/^[A-Za-z]{2}$/.test(code) || code.toUpperCase() === 'XX') return null
  try {
    return regionNames.of(code.toUpperCase()) ?? null
  } catch {
    return null
  }
}

/**
 * Visitor location without leaking IPs: prefer the geo headers our host or CDN
 * already adds (Vercel, Cloudflare, CloudFront). Only if IPINFO_TOKEN is set do we
 * ask a third party, and then over HTTPS. Otherwise the location stays Unknown.
 */
async function resolveLocation(headersList: Pick<Headers, 'get'>, clientIp: string): Promise<{ country: string; city: string }> {
  const headerCountry = countryName(
    headersList.get('x-vercel-ip-country') ||
    headersList.get('cf-ipcountry') ||
    headersList.get('cloudfront-viewer-country')
  )
  const rawCity = headersList.get('x-vercel-ip-city') || headersList.get('cloudfront-viewer-city')
  if (headerCountry) {
    let city = 'Unknown'
    if (rawCity) {
      try { city = decodeURIComponent(rawCity) } catch { city = rawCity }
    }
    return { country: headerCountry, city }
  }

  const token = process.env.IPINFO_TOKEN
  const isPrivate = !clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')
  if (token && !isPrivate) {
    try {
      const res = await fetch(`https://ipinfo.io/${encodeURIComponent(clientIp)}/json`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(1000),
      })
      if (res.ok) {
        const data = await res.json()
        return { country: countryName(data.country) ?? 'Unknown', city: data.city || 'Unknown' }
      }
    } catch (err) {
      console.error('[Analytics Track] Geo IP lookup failed:', err)
    }
  }

  return { country: 'Unknown', city: 'Unknown' }
}
