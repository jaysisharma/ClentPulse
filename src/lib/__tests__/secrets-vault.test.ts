import { describe, it, expect, beforeEach } from 'vitest'
import { sealProjectSecret, openProjectSecret, maskSecretValue } from '../secrets-vault'

describe('secrets-vault crypto helpers', () => {
  beforeEach(() => {
    process.env.APP_SECRET = 'test-secret-salt-for-frevio-secrets-vault-32b'
  })

  it('encrypts and decrypts a plain text secret correctly', () => {
    const raw = 'mock_env_secret_key_12345'
    const sealed = sealProjectSecret(raw)

    expect(sealed).not.toBe(raw)
    expect(sealed.startsWith('v1.')).toBe(true)

    const decrypted = openProjectSecret(sealed)
    expect(decrypted).toBe(raw)
  })

  it('returns null if cipher text has been tampered with', () => {
    const raw = 'db_password_top_secret_123'
    const sealed = sealProjectSecret(raw)
    const tampered = sealed.slice(0, -4) + 'abcd'

    const decrypted = openProjectSecret(tampered)
    expect(decrypted).toBeNull()
  })

  it('throws on empty or non-string input', () => {
    expect(() => sealProjectSecret('')).toThrow()
    // @ts-expect-error
    expect(() => sealProjectSecret(null)).toThrow()
  })

  it('masks secret value properly', () => {
    expect(maskSecretValue()).toBe('••••••••••••••••')
  })
})

