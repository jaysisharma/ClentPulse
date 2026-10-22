/**
 * First-touch acquisition attribution.
 *
 * The proxy stores where a visitor first came from (UTM tags, ?ref=, or the
 * referring site) in a cookie; signup copies it onto the signup_completed
 * activation event so launches (Product Hunt, DevHunt, ...) can be compared.
 */

export const FIRST_TOUCH_COOKIE = 'frevio_src'

export interface SignupSource {
  source: string
  medium: string | null
  campaign: string | null
  referrer: string | null
}

function clean(value: string | null | undefined, max = 60): string | null {
  const v = (value ?? '').trim().toLowerCase().replace(/[^\w.\-]+/g, '-').slice(0, max)
  return v || null
}

// Redirect hops from sign-in and payment flows, not acquisition channels
const IGNORED_REFERRER_HOSTS = ['accounts.google.com', 'checkout.stripe.com', 'connect.stripe.com', 'supabase.co', 'vercel.app']

function referrerHost(referer: string | null, ownHost: string): string | null {
  if (!referer) return null
  try {
    const host = new URL(referer).hostname.replace(/^www\./, '')
    if (!host || host === ownHost.replace(/^www\./, '')) return null
    if (IGNORED_REFERRER_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) return null
    return clean(host)
  } catch {
    return null
  }
}

/** Returns the visitor's source for this request, or null for direct/internal traffic. */
export function firstTouchFromRequest(url: URL, referer: string | null): SignupSource | null {
  const params = url.searchParams
  const refHost = referrerHost(referer, url.hostname)
  const source = clean(params.get('utm_source')) ?? clean(params.get('ref')) ?? refHost
  if (!source) return null
  return {
    source,
    medium: clean(params.get('utm_medium')),
    campaign: clean(params.get('utm_campaign')),
    referrer: refHost,
  }
}

// Next.js URI-encodes cookie values on write and decodes them on read
export function serializeSignupSource(src: SignupSource): string {
  return JSON.stringify(src)
}

/** Parses the cookie value; falls back to "direct" so every signup has a source. */
export function parseSignupSource(raw: string | null | undefined): SignupSource {
  if (raw) {
    try {
      const parsed = JSON.parse(raw.startsWith('%') ? decodeURIComponent(raw) : raw)
      const source = clean(parsed?.source)
      if (source) {
        return {
          source,
          medium: clean(parsed.medium),
          campaign: clean(parsed.campaign),
          referrer: clean(parsed.referrer),
        }
      }
    } catch {
      // fall through to direct
    }
  }
  return { source: 'direct', medium: null, campaign: null, referrer: null }
}

// Launch platforms we greet by name on the homepage (keys match ?ref= / utm_source values)
const LAUNCH_PLATFORMS: Record<string, string> = {
  producthunt: 'Product Hunt',
  'producthunt.com': 'Product Hunt',
  devhunt: 'DevHunt',
  'devhunt.org': 'DevHunt',
  hackernews: 'Hacker News',
  hn: 'Hacker News',
  'news.ycombinator.com': 'Hacker News',
  indiehackers: 'Indie Hackers',
  'indiehackers.com': 'Indie Hackers',
  reddit: 'Reddit',
  'reddit.com': 'Reddit',
  peerlist: 'Peerlist',
  'peerlist.io': 'Peerlist',
  betalist: 'BetaList',
  'betalist.com': 'BetaList',
  uneed: 'Uneed',
  'uneed.best': 'Uneed',
  microlaunch: 'Microlaunch',
  'microlaunch.net': 'Microlaunch',
  fazier: 'Fazier',
  'fazier.com': 'Fazier',
}

export function launchPlatformName(source: string | null | undefined): string | null {
  return source ? LAUNCH_PLATFORMS[source.toLowerCase()] ?? null : null
}
