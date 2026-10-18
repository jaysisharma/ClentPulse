export function sanitizePreviewUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function extractDomain(url: string | null | undefined): string {
  const sanitized = sanitizePreviewUrl(url)
  if (!sanitized) return ''

  try {
    const parsed = new URL(sanitized)
    return parsed.hostname
  } catch {
    return sanitized.replace(/^https?:\/\//, '').split('/')[0]
  }
}

export function isCommonFrameRestrictedDomain(url: string): boolean {
  const domain = extractDomain(url).toLowerCase()
  const restrictedPatterns = [
    'google.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'instagram.com',
    'github.com',
  ]
  return restrictedPatterns.some(p => domain === p || domain.endsWith(`.${p}`))
}
