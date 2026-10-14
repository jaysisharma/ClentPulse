import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * On-Demand TLS verification check endpoint.
 *
 * Used by reverse proxies like Caddy or Cloudflare for Platforms to ask:
 * "Is this domain authorized to receive an SSL certificate?"
 *
 * Query: /api/domains/check?domain=status.youragency.com
 * Response: 200 OK if authorized, 404 Not Found if unauthorized.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')?.trim().toLowerCase()

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 })
  }

  // Prevent wildcard / system domain abuse
  const systemHosts = ['frevio.app', 'frevio.cloud', 'localhost', '127.0.0.1']
  if (systemHosts.some(h => domain === h || domain.endsWith(`.${h}`))) {
    return NextResponse.json({ allowed: true, system: true }, { status: 200 })
  }

  // Query database using service role (or anon with public read policy)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database unconfigured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, custom_domain')
    .eq('custom_domain', domain)
    .maybeSingle()

  if (error || !org) {
    return NextResponse.json({ allowed: false, message: 'Domain not registered' }, { status: 404 })
  }

  return NextResponse.json({
    allowed: true,
    orgId: org.id,
    orgName: org.name,
    domain: org.custom_domain,
  }, { status: 200 })
}
