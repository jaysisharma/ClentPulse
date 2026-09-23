import { describe, it, expect } from 'vitest'
import { resolveModules, CRAFT_PRESETS, DEFAULT_MODULES } from '../modules'

describe('modules helper', () => {
  it('returns DEFAULT_MODULES when input is null or undefined', () => {
    expect(resolveModules(null)).toEqual(DEFAULT_MODULES)
    expect(resolveModules(undefined)).toEqual(DEFAULT_MODULES)
  })

  it('preserves explicit true and false settings', () => {
    const custom = {
      marketing: true,
      developer: false,
      design: false,
      time_tracking: true,
      contracts_billing: false,
    }
    const res = resolveModules(custom)
    expect(res.marketing).toBe(true)
    expect(res.developer).toBe(false)
    expect(res.design).toBe(false)
    expect(res.time_tracking).toBe(true)
    expect(res.contracts_billing).toBe(false)
  })

  it('falls back to default true for missing keys', () => {
    const partial = {
      developer: false,
    }
    const res = resolveModules(partial)
    expect(res.developer).toBe(false)
    expect(res.marketing).toBe(true)
    expect(res.design).toBe(true)
    expect(res.time_tracking).toBe(true)
    expect(res.contracts_billing).toBe(true)
  })

  it('has correct presets for developer and marketer crafts', () => {
    expect(CRAFT_PRESETS.developer.developer).toBe(true)
    expect(CRAFT_PRESETS.developer.marketing).toBe(false)

    expect(CRAFT_PRESETS.marketer.marketing).toBe(true)
    expect(CRAFT_PRESETS.marketer.developer).toBe(false)

    expect(CRAFT_PRESETS.designer.design).toBe(true)
    expect(CRAFT_PRESETS.designer.developer).toBe(false)

    expect(CRAFT_PRESETS.consultant.contracts_billing).toBe(true)
    expect(CRAFT_PRESETS.consultant.developer).toBe(false)
  })
})
