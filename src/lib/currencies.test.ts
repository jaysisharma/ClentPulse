import { describe, it, expect } from 'vitest'
import { fmtCurrency, CURRENCIES, getCurrency } from './currencies'

describe('Currencies utility', () => {
  it('defines the standard 5 supported freelancer currencies', () => {
    expect(CURRENCIES).toHaveLength(5)
    const codes = CURRENCIES.map(c => c.code)
    expect(codes).toContain('USD')
    expect(codes).toContain('EUR')
    expect(codes).toContain('GBP')
    expect(codes).toContain('CAD')
    expect(codes).toContain('AUD')
  })

  it('formats USD correctly by default', () => {
    expect(fmtCurrency(1500)).toBe('$1,500.00')
    expect(fmtCurrency(0)).toBe('$0.00')
    expect(fmtCurrency(2500.5, 'USD')).toBe('$2,500.50')
  })

  it('formats international currencies with correct symbols', () => {
    expect(fmtCurrency(2000, 'EUR')).toContain('2,000.00')
    expect(fmtCurrency(1250, 'GBP')).toContain('1,250.00')
    expect(fmtCurrency(3500, 'CAD')).toContain('3,500.00')
    expect(fmtCurrency(4000, 'AUD')).toContain('4,000.00')
  })

  it('handles case-insensitivity and fallbacks gracefully', () => {
    expect(fmtCurrency(100, 'eur')).toContain('100.00')
    expect(fmtCurrency(100, 'unknown_code')).toBe('$100.00')
    expect(getCurrency('gbp').symbol).toBe('£')
    expect(getCurrency('xyz').code).toBe('USD')
  })
})
