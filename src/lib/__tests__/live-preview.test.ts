import { describe, it, expect } from 'vitest'
import { sanitizePreviewUrl, extractDomain, isCommonFrameRestrictedDomain } from '../live-preview'

describe('live-preview utilities', () => {
  describe('sanitizePreviewUrl', () => {
    it('returns null for null, undefined, or empty values', () => {
      expect(sanitizePreviewUrl(null)).toBeNull()
      expect(sanitizePreviewUrl(undefined)).toBeNull()
      expect(sanitizePreviewUrl('')).toBeNull()
      expect(sanitizePreviewUrl('   ')).toBeNull()
    })

    it('preserves existing https:// and http:// protocols', () => {
      expect(sanitizePreviewUrl('https://staging.client.com')).toBe('https://staging.client.com')
      expect(sanitizePreviewUrl('http://localhost:3000')).toBe('http://localhost:3000')
    })

    it('prepends https:// when protocol is missing', () => {
      expect(sanitizePreviewUrl('staging.client.com')).toBe('https://staging.client.com')
      expect(sanitizePreviewUrl('app.vercel.app/demo')).toBe('https://app.vercel.app/demo')
    })
  })

  describe('extractDomain', () => {
    it('extracts domain properly', () => {
      expect(extractDomain('https://staging.client.com/login?demo=1')).toBe('staging.client.com')
      expect(extractDomain('my-site.vercel.app')).toBe('my-site.vercel.app')
      expect(extractDomain('')).toBe('')
    })
  })

  describe('isCommonFrameRestrictedDomain', () => {
    it('detects known restricted domains', () => {
      expect(isCommonFrameRestrictedDomain('https://google.com')).toBe(true)
      expect(isCommonFrameRestrictedDomain('https://github.com/repo')).toBe(true)
      expect(isCommonFrameRestrictedDomain('https://twitter.com')).toBe(true)
    })

    it('returns false for normal staging and client domains', () => {
      expect(isCommonFrameRestrictedDomain('https://mysite.vercel.app')).toBe(false)
      expect(isCommonFrameRestrictedDomain('https://staging.clientbrand.com')).toBe(false)
      expect(isCommonFrameRestrictedDomain('https://my-app.netlify.app')).toBe(false)
    })
  })
})
