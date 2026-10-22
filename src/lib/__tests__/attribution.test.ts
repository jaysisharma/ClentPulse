import { describe, it, expect } from 'vitest'
import { firstTouchFromRequest, parseSignupSource, serializeSignupSource } from '@/lib/attribution'

const url = (q = '') => new URL(`https://www.frevio.cloud/${q}`)

describe('firstTouchFromRequest', () => {
  it('prefers utm_source and keeps medium and campaign', () => {
    expect(firstTouchFromRequest(url('?utm_source=ProductHunt&utm_medium=launch&utm_campaign=Oct 2026'), null)).toEqual({
      source: 'producthunt',
      medium: 'launch',
      campaign: 'oct-2026',
      referrer: null,
    })
  })

  it('falls back to ?ref= and then the referring site', () => {
    expect(firstTouchFromRequest(url('?ref=devhunt'), null)?.source).toBe('devhunt')
    expect(firstTouchFromRequest(url(), 'https://www.producthunt.com/posts/frevio')?.source).toBe('producthunt.com')
  })

  it('ignores direct visits, internal navigation and auth/payment redirects', () => {
    expect(firstTouchFromRequest(url(), null)).toBeNull()
    expect(firstTouchFromRequest(url(), 'https://www.frevio.cloud/pricing')).toBeNull()
    expect(firstTouchFromRequest(url('auth/callback'), 'https://accounts.google.com/')).toBeNull()
    expect(firstTouchFromRequest(url(), 'https://checkout.stripe.com/c/pay/cs_test')).toBeNull()
  })
})

describe('parseSignupSource', () => {
  it('round-trips a serialized source', () => {
    const src = { source: 'producthunt', medium: 'launch', campaign: null, referrer: 'producthunt.com' }
    expect(parseSignupSource(serializeSignupSource(src))).toEqual(src)
  })

  it('defaults to direct for missing or tampered cookies', () => {
    expect(parseSignupSource(undefined).source).toBe('direct')
    expect(parseSignupSource('%7Bnot-json').source).toBe('direct')
    expect(parseSignupSource(encodeURIComponent(JSON.stringify({ source: '<script>' }))).source).toBe('-script-')
  })
})
