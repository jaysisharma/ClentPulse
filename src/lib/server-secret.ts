import crypto from 'crypto'

// Server-only keys for app-level signing and encryption, derived per purpose from
// one root secret. APP_SECRET is preferred; the Supabase service-role key is a
// safe fallback because every server deployment already needs it and it never
// reaches the browser. There is deliberately no hardcoded default.

function rootSecret(): string {
  const secret = process.env.APP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('APP_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set')
  return secret
}

/** A 32-byte key unique to `purpose`, so one use can't be replayed as another. */
export function deriveKey(purpose: string): Buffer {
  return crypto.createHmac('sha256', rootSecret()).update(`frevio:${purpose}`).digest()
}

/** AES-256-GCM encrypt a short secret for storage. */
export function sealSecret(plaintext: string, purpose: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(purpose), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.')
}

/** Decrypts a value from sealSecret; null if it was tampered with or isn't sealed. */
export function openSecret(sealed: string, purpose: string): string | null {
  const [version, iv, tag, ciphertext] = sealed.split('.')
  if (version !== 'v1' || !iv || !tag || !ciphertext) return null
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(purpose), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

/** A uniformly random 6-digit one-time code from a CSPRNG. */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString()
}
