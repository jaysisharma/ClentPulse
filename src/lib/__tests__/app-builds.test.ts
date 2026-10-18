import { describe, it, expect } from 'vitest'
import { formatFileSize, getEnvironmentConfig, generateQrCodeDataUrl } from '../app-builds'

describe('app-builds utilities', () => {
  describe('formatFileSize', () => {
    it('returns empty string for undefined, null, or zero bytes', () => {
      expect(formatFileSize(undefined)).toBe('')
      expect(formatFileSize(null)).toBe('')
      expect(formatFileSize(0)).toBe('')
      expect(formatFileSize(-100)).toBe('')
    })

    it('formats bytes, KB, MB, and GB properly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(2048)).toBe('2 KB')
      expect(formatFileSize(52428800)).toBe('50 MB')
      expect(formatFileSize(45200000)).toBe('43.1 MB')
    })
  })

  describe('getEnvironmentConfig', () => {
    it('returns production configuration', () => {
      const config = getEnvironmentConfig('production')
      expect(config.label).toBe('Production Release')
      expect(config.shortLabel).toBe('Production')
      expect(config.badgeClass).toContain('emerald')
    })

    it('returns client review configuration', () => {
      const config = getEnvironmentConfig('client_review')
      expect(config.label).toBe('Client Review Ready')
      expect(config.shortLabel).toBe('Client Review')
      expect(config.badgeClass).toContain('indigo')
    })

    it('returns internal beta configuration', () => {
      const config = getEnvironmentConfig('internal_beta')
      expect(config.label).toBe('Internal Beta')
      expect(config.shortLabel).toBe('Beta')
      expect(config.badgeClass).toContain('purple')
    })

    it('defaults to staging for unknown environment', () => {
      const config = getEnvironmentConfig('unknown')
      expect(config.label).toBe('Staging / Test Build')
      expect(config.shortLabel).toBe('Staging')
      expect(config.badgeClass).toContain('amber')
    })
  })

  describe('generateQrCodeDataUrl', () => {
    it('generates a valid base64 data url for a download link', async () => {
      const url = 'https://example.com/app-v1.0.apk'
      const dataUrl = await generateQrCodeDataUrl(url)
      expect(dataUrl).toContain('data:image/png;base64,')
    })
  })
})
