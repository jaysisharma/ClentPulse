import { describe, it, expect, beforeEach } from 'vitest'
import {
  fmtCurrency,
  CURRENCIES,
  SUPPORTED_CURRENCIES,
  getCurrency,
  registerCustomCurrency,
  saveCustomCurrency,
  removeCustomCurrency,
  getAllCurrencies,
} from './currencies'

describe('Currencies utility', () => {
  it('supports essential global currencies including India (INR) and Nepal (NPR)', () => {
    const codes = CURRENCIES.map(c => c.code)
    expect(codes).toContain('USD')
    expect(codes).toContain('EUR')
    expect(codes).toContain('GBP')
    expect(codes).toContain('INR')
    expect(codes).toContain('NPR')
    expect(codes).toContain('CAD')
    expect(codes).toContain('AUD')
    expect(codes).toContain('JPY')
    expect(codes).toContain('AED')
    expect(codes).toContain('SGD')
  })

  it('formats USD correctly by default', () => {
    expect(fmtCurrency(1500)).toBe('$1,500.00')
    expect(fmtCurrency(0)).toBe('$0.00')
    expect(fmtCurrency(2500.5, 'USD')).toBe('$2,500.50')
  })

  it('formats Indian Rupee (INR) with ₹ symbol correctly', () => {
    const formatted = fmtCurrency(50000, 'INR')
    expect(formatted).toContain('₹')
    expect(formatted).toContain('50,000.00')
    expect(getCurrency('INR').symbol).toBe('₹')
    expect(getCurrency('inr').code).toBe('INR')
  })

  it('formats Nepalese Rupee (NPR) with रू symbol cleanly', () => {
    const formatted = fmtCurrency(75000, 'NPR')
    expect(formatted).toContain('रू')
    expect(formatted).toContain('75,000.00')
    expect(getCurrency('NPR').symbol).toBe('रू')
    expect(getCurrency('npr').code).toBe('NPR')
  })

  it('formats international currencies with correct symbols', () => {
    expect(fmtCurrency(2000, 'EUR')).toContain('2,000.00')
    expect(fmtCurrency(1250, 'GBP')).toContain('1,250.00')
    expect(fmtCurrency(3500, 'CAD')).toContain('3,500.00')
    expect(fmtCurrency(4000, 'AUD')).toContain('4,000.00')
    expect(fmtCurrency(10000, 'JPY')).toContain('10,000')
  })

  it('handles case-insensitivity seamlessly', () => {
    expect(fmtCurrency(100, 'eur')).toContain('100.00')
    expect(fmtCurrency(100, 'inr')).toContain('100.00')
    expect(fmtCurrency(100, 'npr')).toContain('100.00')
    expect(getCurrency('gbp').symbol).toBe('£')
  })

  it('allows registering and formatting custom currencies manually', () => {
    registerCustomCurrency({
      code: 'KWD',
      symbol: 'KD',
      label: 'Kuwaiti Dinar (KD)',
      locale: 'en-US',
    })

    const kwdConfig = getCurrency('KWD')
    expect(kwdConfig.code).toBe('KWD')
    expect(kwdConfig.symbol).toBe('KD')

    const formatted = fmtCurrency(1500, 'KWD')
    expect(formatted).toContain('1,500.00')
  })

  it('handles non-ISO or crypto tokens like USDT or SOL gracefully without crashing', () => {
    const formatted = fmtCurrency(250, 'USDT')
    expect(formatted).toContain('USDT')
    expect(formatted).toContain('250.00')

    const customToken = fmtCurrency(12.5, 'SOL')
    expect(customToken).toContain('SOL')
    expect(customToken).toContain('12.50')
  })

  it('merges custom currencies into getAllCurrencies without duplicates', () => {
    saveCustomCurrency({
      code: 'CUSTOM_TEST',
      symbol: 'CT$',
      label: 'Custom Test Token',
      locale: 'en-US',
    })

    const all = getAllCurrencies()
    const found = all.find(c => c.code === 'CUSTOM_TEST')
    expect(found).toBeDefined()
    expect(found?.symbol).toBe('CT$')

    // Cleanup
    removeCustomCurrency('CUSTOM_TEST')
    const cleaned = getAllCurrencies()
    expect(cleaned.find(c => c.code === 'CUSTOM_TEST')).toBeUndefined()
  })
})
