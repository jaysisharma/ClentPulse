export interface ParsedVideoEmbed {
  platform: 'loom' | 'youtube' | 'vimeo'
  embedUrl: string
  originalUrl: string
}

/**
 * Parses video URLs (Loom, YouTube, Vimeo) and returns an embeddable iframe URL.
 * Returns null if the URL is not a supported video platform or invalid.
 */
export function parseVideoEmbedUrl(url: string | null | undefined): ParsedVideoEmbed | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    const path = parsed.pathname

    // 1. Loom
    // e.g. loom.com/share/abc123xyz or loom.com/embed/abc123xyz
    if (host.includes('loom.com')) {
      const match = path.match(/\/(share|embed)\/([a-zA-Z0-9]+)/)
      if (match && match[2]) {
        return {
          platform: 'loom',
          embedUrl: `https://www.loom.com/embed/${match[2]}`,
          originalUrl: trimmed,
        }
      }
    }

    // 2. YouTube
    // e.g. youtube.com/watch?v=abc123xyz or youtu.be/abc123xyz or youtube.com/embed/abc123xyz
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId: string | null = null
      if (host.includes('youtu.be')) {
        videoId = path.slice(1).split('/')[0] || null
      } else if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v')
      } else {
        const match = path.match(/\/embed\/([a-zA-Z0-9_-]+)/)
        if (match) videoId = match[1]
      }

      if (videoId) {
        return {
          platform: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          originalUrl: trimmed,
        }
      }
    }

    // 3. Vimeo
    // e.g. vimeo.com/123456789 or player.vimeo.com/video/123456789
    if (host.includes('vimeo.com')) {
      const match = path.match(/\/(?:video\/)?([0-9]+)/)
      if (match && match[1]) {
        return {
          platform: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${match[1]}`,
          originalUrl: trimmed,
        }
      }
    }

    return null
  } catch {
    return null
  }
}
