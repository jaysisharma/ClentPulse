import { describe, it, expect } from 'vitest'
import { parseCanvasEmbedUrl } from '../canvas-embed'

describe('parseCanvasEmbedUrl', () => {
  it('handles null, undefined, or empty string', () => {
    expect(parseCanvasEmbedUrl(null)).toBeNull()
    expect(parseCanvasEmbedUrl(undefined)).toBeNull()
    expect(parseCanvasEmbedUrl('')).toBeNull()
    expect(parseCanvasEmbedUrl('   ')).toBeNull()
  })

  it('converts Figma design link to embed URL', () => {
    const raw = 'https://www.figma.com/design/abc123/Project-Mockups?node-id=0-1'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('figma')
    expect(res?.platformName).toBe('Figma Design')
    expect(res?.embedUrl).toContain('https://www.figma.com/embed?embed_host=share&url=')
  })

  it('detects FigJam whiteboard link', () => {
    const raw = 'https://www.figma.com/board/xyz789/Team-Brainstorm'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('figjam')
    expect(res?.platformName).toBe('FigJam Whiteboard')
  })

  it('converts Miro board link to live-embed URL', () => {
    const raw = 'https://miro.com/app/board/uXjVO123=/'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('miro')
    expect(res?.embedUrl).toContain('https://miro.com/app/live-embed/uXjVO123=/?embedAutoplay=true')
  })

  it('handles Excalidraw shared link', () => {
    const raw = 'https://excalidraw.com/#room=12345,key=abcde'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('excalidraw')
    expect(res?.platformName).toBe('Excalidraw')
    expect(res?.embedUrl).toBe(raw)
  })

  it('converts Google Slides link to embed URL', () => {
    const raw = 'https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#slide=id.p'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('google_slides')
    expect(res?.embedUrl).toContain('https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/embed')
  })

  it('converts Loom link to embed URL', () => {
    const raw = 'https://www.loom.com/share/abc123xyz'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('loom')
    expect(res?.embedUrl).toBe('https://www.loom.com/embed/abc123xyz')
  })

  it('handles generic https presentation / dashboard links', () => {
    const raw = 'https://lookerstudio.google.com/embed/reporting/123'
    const res = parseCanvasEmbedUrl(raw)
    expect(res).not.toBeNull()
    expect(res?.platform).toBe('generic')
    expect(res?.embedUrl).toBe(raw)
  })
})
