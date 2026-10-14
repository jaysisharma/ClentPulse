import crypto from 'crypto'

/**
 * Secret key used for signing client portal session cookies and tickets.
 */
function getPasscodeSecret(): string {
  return (
    process.env.PASSCODE_SIGNING_SECRET ||
    process.env.INTEGRATION_ENCRYPTION_KEY ||
    process.env.SUPABASE_JWT_SECRET ||
    'frevio-client-portal-session-secret-salt-2026'
  )
}

/**
 * Constant-time comparison between two strings to prevent timing side-channel attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')

  if (bufA.length !== bufB.length) {
    // Compare dummy buffer of same length to keep execution time constant
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}

export interface PasscodeTicketPayload {
  projectId: string
  slug: string
  exp: number // timestamp in ms
}

/**
 * Creates a cryptographically signed session ticket for a client portal.
 * This ticket is stored in the browser cookie instead of the raw plaintext passcode.
 */
export function createPasscodeTicket(projectId: string, slug: string, validDays = 30): string {
  const exp = Date.now() + validDays * 24 * 60 * 60 * 1000
  const payload: PasscodeTicketPayload = { projectId, slug, exp }
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')

  const secret = getPasscodeSecret()
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${payloadBase64}:${projectId}:${slug}`)
    .digest('base64url')

  return `v1.${payloadBase64}.${signature}`
}

/**
 * Verifies a client portal session ticket against the target project and slug.
 */
export function verifyPasscodeTicket(ticket: string | undefined | null, projectId: string, slug: string): boolean {
  if (!ticket || typeof ticket !== 'string') return false

  const parts = ticket.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false

  const [, payloadBase64, providedSig] = parts
  const secret = getPasscodeSecret()

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${payloadBase64}:${projectId}:${slug}`)
    .digest('base64url')

  if (!timingSafeCompare(providedSig, expectedSig)) {
    return false
  }

  try {
    const payload: PasscodeTicketPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    )

    if (payload.projectId !== projectId || payload.slug !== slug) {
      return false
    }

    if (Date.now() > payload.exp) {
      return false
    }

    return true
  } catch {
    return false
  }
}
