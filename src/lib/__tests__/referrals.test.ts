import { describe, it, expect } from 'vitest'
import { buildReferralUrl, sanitizeReferralCode, REFERRAL_COOKIE_NAME } from '../referrals'

describe('Referral utilities', () => {
  it('exports the standard referral cookie name', () => {
    expect(REFERRAL_COOKIE_NAME).toBe('frevio_ref')
  })

  it('builds a referral url with encoded query parameter', () => {
    const url = buildReferralUrl('alex_design')
    expect(url).toContain('?ref=alex_design')
  })

  it('handles special characters safely in referral handles', () => {
    const url = buildReferralUrl('user+name@test')
    expect(url).toContain('?ref=user%2Bname%40test')
  })

  it('sanitizes and truncates overly long referral codes', () => {
    const longCode = 'a'.repeat(100)
    const sanitized = sanitizeReferralCode(longCode)
    expect(sanitized).toHaveLength(50)
  })

  it('returns null for empty or whitespace referral codes', () => {
    expect(sanitizeReferralCode('')).toBeNull()
    expect(sanitizeReferralCode('   ')).toBeNull()
    expect(sanitizeReferralCode(null)).toBeNull()
  })
})
