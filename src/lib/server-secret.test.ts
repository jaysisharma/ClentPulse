import { describe, it, expect, beforeEach } from 'vitest'
import { deriveKey, generateOtpCode, openSecret, sealSecret } from './server-secret'

describe('server-secret', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'test-root-secret'
  })

  it('round-trips a sealed secret', () => {
    const sealed = sealSecret('hunter22', 'otp-signup-password')
    expect(sealed).not.toContain('hunter22')
    expect(openSecret(sealed, 'otp-signup-password')).toBe('hunter22')
  })

  it('refuses to open with a different purpose or after tampering', () => {
    const sealed = sealSecret('hunter22', 'otp-signup-password')
    expect(openSecret(sealed, 'something-else')).toBeNull()
    const [v, iv, tag, ct] = sealed.split('.')
    const flipped = ct.slice(0, -1) + (ct.endsWith('A') ? 'B' : 'A')
    expect(openSecret([v, iv, tag, flipped].join('.'), 'otp-signup-password')).toBeNull()
    expect(openSecret('plaintext-password', 'otp-signup-password')).toBeNull()
  })

  it('derives distinct keys per purpose', () => {
    expect(deriveKey('a').equals(deriveKey('b'))).toBe(false)
    expect(deriveKey('a')).toHaveLength(32)
  })

  it('generates 6-digit codes', () => {
    for (let i = 0; i < 50; i++) expect(generateOtpCode()).toMatch(/^[1-9]\d{5}$/)
  })
})
