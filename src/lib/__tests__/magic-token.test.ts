import { describe, it, expect, beforeEach } from 'vitest'
import { createClientMagicToken, verifyClientMagicToken } from '../magic-token'

describe('magic-token crypto module', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'super-secret-frevio-root-key-32b-length'
  })

  it('generates and successfully validates valid token', () => {
    const token = createClientMagicToken('proj-123', 'client@acme.com', 24)
    expect(token.startsWith('v1.')).toBe(true)

    const verification = verifyClientMagicToken(token)
    expect(verification.valid).toBe(true)
    expect(verification.projectId).toBe('proj-123')
    expect(verification.clientEmail).toBe('client@acme.com')
  })

  it('rejects tampered token', () => {
    const token = createClientMagicToken('proj-123', 'client@acme.com', 24)
    const tampered = token.slice(0, -4) + 'zzzz'

    const verification = verifyClientMagicToken(tampered)
    expect(verification.valid).toBe(false)
  })

  it('rejects expired token', () => {
    // Expired -1 hour
    const token = createClientMagicToken('proj-123', 'client@acme.com', -1)
    const verification = verifyClientMagicToken(token)
    expect(verification.valid).toBe(false)
  })

  it('handles null, undefined or empty strings safely', () => {
    expect(verifyClientMagicToken(null).valid).toBe(false)
    expect(verifyClientMagicToken(undefined).valid).toBe(false)
    expect(verifyClientMagicToken('').valid).toBe(false)
    expect(verifyClientMagicToken('not.a.valid.token').valid).toBe(false)
  })
})

