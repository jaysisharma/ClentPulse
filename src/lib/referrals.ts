/**
 * Referral tracking and referral link utilities.
 */

export const REFERRAL_COOKIE_NAME = 'frevio_ref'

/**
 * Builds a public referral URL for a given user handle or ID.
 */
export function buildReferralUrl(refHandle?: string | null): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frevio.app'
  if (!refHandle) return appUrl
  return `${appUrl}?ref=${encodeURIComponent(refHandle)}`
}

/**
 * Extracts a referral handle from a search parameter or cookie string.
 */
export function sanitizeReferralCode(rawCode?: string | null): string | null {
  if (!rawCode) return null
  const cleaned = rawCode.trim().slice(0, 50)
  return cleaned.length > 0 ? cleaned : null
}
