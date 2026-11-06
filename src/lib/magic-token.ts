import crypto from 'crypto'
import { deriveKey } from './server-secret'

const PURPOSE = 'client_magic_link'

interface MagicTokenPayload {
  projectId: string
  clientEmail: string
  exp: number
}

/**
 * Creates a tamper-proof cryptographic magic link token valid for a set number of hours.
 * Defaults to 30 days (720 hours) for smooth client onboarding.
 */
export function createClientMagicToken(
  projectId: string,
  clientEmail: string,
  expiresInHours = 720
): string {
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000
  const payload: MagicTokenPayload = {
    projectId,
    clientEmail: clientEmail.toLowerCase().trim(),
    exp,
  }

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const key = deriveKey(PURPOSE)
  const sig = crypto.createHmac('sha256', key).update(payloadStr).digest('base64url')

  return `v1.${payloadStr}.${sig}`
}

/**
 * Verifies a magic token in constant time.
 */
export function verifyClientMagicToken(token: string | null | undefined): {
  valid: boolean
  projectId?: string
  clientEmail?: string
} {
  if (!token || typeof token !== 'string') return { valid: false }

  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return { valid: false }

  const [, payloadStr, sig] = parts
  const key = deriveKey(PURPOSE)
  const expectedSig = crypto.createHmac('sha256', key).update(payloadStr).digest('base64url')

  const bufA = Buffer.from(sig, 'base64url')
  const bufB = Buffer.from(expectedSig, 'base64url')

  if (bufA.length !== bufB.length) return { valid: false }
  if (!crypto.timingSafeEqual(bufA, bufB)) return { valid: false }

  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf8')
    const payload: MagicTokenPayload = JSON.parse(jsonStr)

    if (Date.now() > payload.exp) {
      return { valid: false } // Expired
    }

    return {
      valid: true,
      projectId: payload.projectId,
      clientEmail: payload.clientEmail,
    }
  } catch {
    return { valid: false }
  }
}

