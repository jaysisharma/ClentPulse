import dns from 'dns'

interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect?: string | null
  redirectStatusCode?: number | null
  gitBranch?: string | null
  updatedAt?: number
  createdAt?: number
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

interface VercelConfigResponse {
  configuredBy?: 'CNAME' | 'A' | 'http-01' | null
  acceptedChallenges?: string[]
  misconfigured: boolean
}

/**
 * Register a custom domain with Vercel API for automated SSL certificate issuance.
 * Gracefully no-ops if VERCEL_TOKEN / VERCEL_PROJECT_ID are not set (e.g. self-hosted / Caddy).
 */
export async function registerDomainWithVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) {
    // Not running on managed Vercel or tokens not supplied; Caddy / DNS mode will be used
    return { success: true }
  }

  try {
    const url = new URL(`https://api.vercel.com/v10/projects/${projectId}/domains`)
    if (teamId) url.searchParams.set('teamId', teamId)

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    const data = await res.json()
    if (!res.ok && data.error && data.error.code !== 'domain_already_in_use') {
      return { success: false, error: data.error.message || 'Failed to register domain on Vercel' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error registering domain' }
  }
}

/**
 * Deregister a custom domain from Vercel API when an agency updates or deletes it.
 */
export async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) {
    return { success: true }
  }

  try {
    const url = new URL(`https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`)
    if (teamId) url.searchParams.set('teamId', teamId)

    const res = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok && res.status !== 404) {
      const data = await res.json().catch(() => ({}))
      return { success: false, error: data.error?.message || 'Failed to remove domain from Vercel' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export interface DomainCheckResult {
  configured: boolean
  verified: boolean
  sslReady: boolean
  resolvedTarget: string | null
  message: string
}

/**
 * Verify DNS propagation and SSL readiness for a custom domain.
 */
export async function checkCustomDomain(domain: string): Promise<DomainCheckResult> {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  let verified = false
  let sslReady = false
  let resolvedTarget: string | null = null
  let message = ''

  // 1. Check DNS records directly via Node DNS
  try {
    const cnames = await dns.promises.resolveCname(cleanDomain)
    if (cnames && cnames.length > 0) {
      resolvedTarget = cnames[0]
      const validCnames = ['frevio.app', 'frevio.cloud', 'vercel-dns.com', 'cname.frevio.app', 'cname.frevio.cloud']
      if (validCnames.some(target => resolvedTarget?.toLowerCase().includes(target))) {
        verified = true
        message = `CNAME is properly pointing to ${resolvedTarget}`
      } else {
        verified = true
        message = `CNAME resolves to ${resolvedTarget}`
      }
    }
  } catch {
    // If CNAME lookup fails, check direct A-record IP resolution
    try {
      const lookup = await dns.promises.lookup(cleanDomain)
      if (lookup.address) {
        verified = true
        resolvedTarget = lookup.address
        message = `Domain resolves to IP ${lookup.address}`
      }
    } catch {
      verified = false
      message = 'DNS record not detected yet. CNAME changes may take 5–30 minutes to propagate.'
    }
  }

  // 2. If Vercel API credentials are present, check Vercel SSL status
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (token && projectId && verified) {
    try {
      const configUrl = new URL(`https://api.vercel.com/v6/domains/${cleanDomain}/config`)
      if (teamId) configUrl.searchParams.set('teamId', teamId)

      const configRes = await fetch(configUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (configRes.ok) {
        const configData: VercelConfigResponse = await configRes.json()
        if (!configData.misconfigured) {
          sslReady = true
          message = 'Domain and SSL certificate are fully verified and active.'
        }
      }
    } catch {
      // Non-fatal, fallback to DNS status
    }
  } else if (verified) {
    // In self-hosted or Caddy on-demand mode, DNS verification means SSL will issue on first hit
    sslReady = true
  }

  return {
    configured: Boolean(domain),
    verified,
    sslReady,
    resolvedTarget,
    message,
  }
}
