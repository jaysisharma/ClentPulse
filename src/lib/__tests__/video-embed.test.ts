import { describe, it, expect } from 'vitest'
import { parseVideoEmbedUrl } from '../video-embed'

describe('parseVideoEmbedUrl', () => {
  it('returns null for empty or invalid inputs', () => {
    expect(parseVideoEmbedUrl(null)).toBeNull()
    expect(parseVideoEmbedUrl(undefined)).toBeNull()
    expect(parseVideoEmbedUrl('')).toBeNull()
    expect(parseVideoEmbedUrl('not-a-url')).toBeNull()
    expect(parseVideoEmbedUrl('https://example.com')).toBeNull()
  })

  it('correctly parses Loom share and embed URLs', () => {
    const shareRes = parseVideoEmbedUrl('https://www.loom.com/share/d469fb5cf8f342008f1b135adab4cf58')
    expect(shareRes).not.toBeNull()
    expect(shareRes?.platform).toBe('loom')
    expect(shareRes?.embedUrl).toBe('https://www.loom.com/embed/d469fb5cf8f342008f1b135adab4cf58')

    const shortRes = parseVideoEmbedUrl('loom.com/share/abc1234')
    expect(shortRes?.embedUrl).toBe('https://www.loom.com/embed/abc1234')
  })

  it('correctly parses YouTube watch, youtu.be, and embed URLs', () => {
    const watchRes = parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(watchRes).not.toBeNull()
    expect(watchRes?.platform).toBe('youtube')
    expect(watchRes?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')

    const shortRes = parseVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')
    expect(shortRes?.platform).toBe('youtube')
    expect(shortRes?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')

    const embedRes = parseVideoEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(embedRes?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('correctly parses Vimeo standard and player URLs', () => {
    const vimeoRes = parseVideoEmbedUrl('https://vimeo.com/76979871')
    expect(vimeoRes).not.toBeNull()
    expect(vimeoRes?.platform).toBe('vimeo')
    expect(vimeoRes?.embedUrl).toBe('https://player.vimeo.com/video/76979871')

    const playerRes = parseVideoEmbedUrl('https://player.vimeo.com/video/76979871')
    expect(playerRes?.embedUrl).toBe('https://player.vimeo.com/video/76979871')
  })
})
