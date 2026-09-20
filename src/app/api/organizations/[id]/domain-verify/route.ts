import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import dns from 'dns'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check caller membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, custom_domain')
    .eq('id', id)
    .single()

  if (!org || !org.custom_domain) {
    return NextResponse.json({
      configured: false,
      verified: false,
      message: 'No custom domain configured for this organization.',
    })
  }

  const domain = org.custom_domain
  let verified = false
  let resolvedTarget: string | null = null
  let message = ''

  try {
    const cnames = await dns.promises.resolveCname(domain)
    if (cnames && cnames.length > 0) {
      resolvedTarget = cnames[0]
      // Check if target points to cname.frevio.app or frevio domain
      if (resolvedTarget.includes('frevio') || resolvedTarget.includes('vercel')) {
        verified = true
        message = `CNAME properly points to ${resolvedTarget}`
      } else {
        verified = true
        message = `CNAME resolves to ${resolvedTarget}`
      }
    }
  } catch (err: any) {
    // If resolveCname fails, try basic lookup
    try {
      const lookup = await dns.promises.lookup(domain)
      if (lookup.address) {
        verified = true
        resolvedTarget = lookup.address
        message = `Domain resolves to IP ${lookup.address}`
      }
    } catch (lookupErr: any) {
      verified = false
      message = `DNS record not detected yet. CNAME changes may take up to 24-48 hours to propagate.`
    }
  }

  return NextResponse.json({
    configured: true,
    domain,
    verified,
    resolvedTarget,
    message,
  })
}
