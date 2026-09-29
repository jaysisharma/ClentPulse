/**
 * Canvas / Whiteboard & Strategy Embed Parser
 * Converts URLs from Figma, FigJam, Miro, Excalidraw, Loom, Google Slides, Canva, Whimsical, etc.
 * into safe, high-performance embeddable iframe URLs.
 */

export type CanvasPlatform =
  | 'figma'
  | 'figjam'
  | 'miro'
  | 'excalidraw'
  | 'loom'
  | 'google_slides'
  | 'canva'
  | 'whimsical'
  | 'generic'

export interface ParsedCanvasEmbed {
  platform: CanvasPlatform
  platformName: string
  embedUrl: string
  originalUrl: string
}

export const PLATFORM_NAMES: Record<CanvasPlatform, string> = {
  figma: 'Figma Design',
  figjam: 'FigJam Whiteboard',
  miro: 'Miro Board',
  excalidraw: 'Excalidraw',
  loom: 'Loom Video Walkthrough',
  google_slides: 'Google Slides',
  canva: 'Canva Deck',
  whimsical: 'Whimsical Wireframes',
  generic: 'Interactive Canvas',
}

export function parseCanvasEmbedUrl(url: string | null | undefined): ParsedCanvasEmbed | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    const path = parsed.pathname

    // 1. Figma & FigJam
    if (host.includes('figma.com')) {
      const isFigJam = path.includes('/board/') || path.includes('/jam/')
      // If already an embed URL, preserve it
      if (path.startsWith('/embed')) {
        return {
          platform: isFigJam ? 'figjam' : 'figma',
          platformName: isFigJam ? 'FigJam Whiteboard' : 'Figma Design',
          embedUrl: trimmed,
          originalUrl: trimmed,
        }
      }
      return {
        platform: isFigJam ? 'figjam' : 'figma',
        platformName: isFigJam ? 'FigJam Whiteboard' : 'Figma Design',
        embedUrl: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(trimmed)}`,
        originalUrl: trimmed,
      }
    }

    // 2. Miro
    if (host.includes('miro.com')) {
      // If already live-embed
      if (path.includes('/live-embed/')) {
        return {
          platform: 'miro',
          platformName: 'Miro Board',
          embedUrl: trimmed,
          originalUrl: trimmed,
        }
      }
      // Extract board ID: e.g. /app/board/uXjVO123=/
      const match = path.match(/\/board\/([a-zA-Z0-9_\-=%]+)/)
      if (match && match[1]) {
        return {
          platform: 'miro',
          platformName: 'Miro Board',
          embedUrl: `https://miro.com/app/live-embed/${match[1]}/?embedAutoplay=true`,
          originalUrl: trimmed,
        }
      }
      return {
        platform: 'miro',
        platformName: 'Miro Board',
        embedUrl: trimmed,
        originalUrl: trimmed,
      }
    }

    // 3. Excalidraw
    if (host.includes('excalidraw.com')) {
      return {
        platform: 'excalidraw',
        platformName: 'Excalidraw',
        embedUrl: trimmed,
        originalUrl: trimmed,
      }
    }

    // 4. Loom
    if (host.includes('loom.com')) {
      const match = path.match(/\/(?:share|embed)\/([a-zA-Z0-9]+)/)
      if (match && match[1]) {
        return {
          platform: 'loom',
          platformName: 'Loom Video Walkthrough',
          embedUrl: `https://www.loom.com/embed/${match[1]}`,
          originalUrl: trimmed,
        }
      }
    }

    // 5. Google Slides
    if (host.includes('docs.google.com') && path.includes('/presentation/')) {
      const match = path.match(/\/presentation\/d\/([a-zA-Z0-9_\-]+)/)
      if (match && match[1]) {
        return {
          platform: 'google_slides',
          platformName: 'Google Slides',
          embedUrl: `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`,
          originalUrl: trimmed,
        }
      }
    }

    // 6. Canva
    if (host.includes('canva.com')) {
      let embedUrl = trimmed
      if (!embedUrl.includes('embed')) {
        embedUrl = embedUrl.includes('?') ? `${embedUrl}&embed` : `${embedUrl}?embed`
      }
      return {
        platform: 'canva',
        platformName: 'Canva Deck',
        embedUrl,
        originalUrl: trimmed,
      }
    }

    // 7. Whimsical
    if (host.includes('whimsical.com')) {
      return {
        platform: 'whimsical',
        platformName: 'Whimsical Wireframes',
        embedUrl: trimmed,
        originalUrl: trimmed,
      }
    }

    // 8. Generic valid URL (Looker, Tableau, Notion public pages, Coda, etc.)
    return {
      platform: 'generic',
      platformName: 'Interactive Canvas',
      embedUrl: trimmed,
      originalUrl: trimmed,
    }
  } catch {
    return null
  }
}
