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

    let country = 'Unknown'
    let city = 'Unknown'

    // Look up location for remote clients (skip localhost/private ranges)
    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' && !clientIp.startsWith('192.168.')) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,city`, {
          signal: AbortSignal.timeout(1000)
        })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.status === 'success') {
            country = geoData.country || 'Unknown'
            city = geoData.city || 'Unknown'
          }
        }
      } catch (err) {
        console.error('[Analytics Track] Geo IP lookup failed:', err)
      }
    }

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
