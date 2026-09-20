import { describe, it, expect, beforeEach, vi } from 'vitest'
import { encryptToken, decryptToken, generateOAuthState, verifyOAuthState } from './oauth'

// Set required env vars before tests run
beforeEach(() => {
  process.env.INTEGRATION_ENCRYPTION_KEY = 'a'.repeat(64) // 32 bytes as hex
  process.env.INTEGRATION_STATE_SECRET = 'test-state-secret'
})

describe('encryptToken / decryptToken', () => {
  it('round-trips a plaintext token', () => {
    const original = 'ya29.access-token-abc123'
    const encrypted = encryptToken(original)
    expect(encrypted).not.toBe(original)
    expect(encrypted.split(':').length).toBe(3)
    const decrypted = decryptToken(encrypted)
    expect(decrypted).toBe(original)
  })

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    const token = 'same-token'
    const c1 = encryptToken(token)
    const c2 = encryptToken(token)
    expect(c1).not.toBe(c2)
    expect(decryptToken(c1)).toBe(token)
    expect(decryptToken(c2)).toBe(token)
  })

  it('throws on tampered ciphertext', () => {
    const encrypted = encryptToken('secret')
    const parts = encrypted.split(':')
    parts[0] = Buffer.from('tampered').toString('base64') // corrupt the ciphertext
    expect(() => decryptToken(parts.join(':'))).toThrow()
  })

  it('throws if INTEGRATION_ENCRYPTION_KEY is missing', () => {
    delete process.env.INTEGRATION_ENCRYPTION_KEY
    expect(() => encryptToken('test')).toThrow('INTEGRATION_ENCRYPTION_KEY is not set')
  })

  it('throws if key is wrong length', () => {
    process.env.INTEGRATION_ENCRYPTION_KEY = 'tooshort'
    expect(() => encryptToken('test')).toThrow('32 bytes')
  })
})

describe('generateOAuthState / verifyOAuthState', () => {
  it('generates a verifiable state for a valid provider + userId', () => {
    const state = generateOAuthState('google', 'user-uuid-123')
    const result = verifyOAuthState(state, 'google')
    expect(result).not.toBeNull()
    expect(result?.provider).toBe('google')
    expect(result?.userId).toBe('user-uuid-123')
  })

  it('returns null if the provider in state does not match expected', () => {
    const state = generateOAuthState('github', 'user-uuid-123')
    const result = verifyOAuthState(state, 'google')
    expect(result).toBeNull()
  })

  it('returns null for a tampered state', () => {
    const state = generateOAuthState('google', 'user-uuid-123')
    const tampered = state.slice(0, -4) + 'XXXX'
    expect(verifyOAuthState(tampered, 'google')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(verifyOAuthState('', 'google')).toBeNull()
  })

  it('returns null if INTEGRATION_STATE_SECRET is missing', () => {
    delete process.env.INTEGRATION_STATE_SECRET
    const state = Buffer.from('google:user:nonce.invalidsig').toString('base64url')
    expect(verifyOAuthState(state, 'google')).toBeNull()
  })
})
