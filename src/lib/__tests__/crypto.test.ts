import { describe, it, expect } from 'vitest'
import { timingSafeCompare, createPasscodeTicket, verifyPasscodeTicket } from '../passcode-crypto'
import { signWebhookPayload, verifyWebhookSignature } from '../webhooks'
import { generateDigitalSeal } from '../audit-crypto'

describe('passcode-crypto', () => {
  it('correctly compares strings in constant time', () => {
    expect(timingSafeCompare('secret123', 'secret123')).toBe(true)
    expect(timingSafeCompare('secret123', 'secret124')).toBe(false)
    expect(timingSafeCompare('short', 'longer-string')).toBe(false)
    expect(timingSafeCompare('', '')).toBe(true)
  })

  it('generates and validates HMAC-signed session tickets', () => {
    const projectId = 'proj-abc-123'
    const slug = 'acme-rebrand'

    const ticket = createPasscodeTicket(projectId, slug, 7)
    expect(ticket.startsWith('v1.')).toBe(true)

    // Valid ticket should pass verification
    expect(verifyPasscodeTicket(ticket, projectId, slug)).toBe(true)

    // Tampered project ID or slug should fail
    expect(verifyPasscodeTicket(ticket, 'different-project', slug)).toBe(false)
    expect(verifyPasscodeTicket(ticket, projectId, 'different-slug')).toBe(false)

    // Tampered ticket string should fail
    const tampered = ticket.slice(0, -4) + 'abcd'
    expect(verifyPasscodeTicket(tampered, projectId, slug)).toBe(false)

    // Invalid formats should fail
    expect(verifyPasscodeTicket('invalid.format', projectId, slug)).toBe(false)
    expect(verifyPasscodeTicket('', projectId, slug)).toBe(false)
    expect(verifyPasscodeTicket(null, projectId, slug)).toBe(false)
  })

  it('rejects expired tickets', () => {
    const projectId = 'proj-expired'
    const slug = 'expired-slug'

    // Create ticket that expired in the past (-1 day)
    const ticket = createPasscodeTicket(projectId, slug, -1)
    expect(verifyPasscodeTicket(ticket, projectId, slug)).toBe(false)
  })
})

describe('webhook-crypto', () => {
  it('signs and verifies webhook payloads with HMAC-SHA256', () => {
    const payload = JSON.stringify({ event: 'approval', id: '123' })
    const secret = 'my-webhook-secret-key'

    const signature = signWebhookPayload(payload, secret)
    expect(signature).toBeDefined()
    expect(signature.length).toBe(64) // SHA-256 hex length

    // Valid signature passes
    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true)
    expect(verifyWebhookSignature(payload, `sha256=${signature}`, secret)).toBe(true)

    // Tampered payload fails
    const tamperedPayload = JSON.stringify({ event: 'approval', id: '124' })
    expect(verifyWebhookSignature(tamperedPayload, signature, secret)).toBe(false)

    // Wrong secret fails
    expect(verifyWebhookSignature(payload, signature, 'wrong-secret')).toBe(false)
  })
})

describe('audit-crypto', () => {
  it('generates deterministic SHA-256 digital seals for agreements', async () => {
    const receipt1 = await generateDigitalSeal(
      'doc-100',
      'Master Services Agreement',
      'Sarah Connor',
      '2026-10-14T10:00:00.000Z'
    )

    expect(receipt1.seal.startsWith('SEAL-')).toBe(true)
    expect(receipt1.hash.length).toBe(64)
    expect(receipt1.algorithm).toBe('SHA-256-DIGITAL-RECORD')

    // Same inputs produce identical seal
    const receipt2 = await generateDigitalSeal(
      'doc-100',
      'Master Services Agreement',
      'Sarah Connor',
      '2026-10-14T10:00:00.000Z'
    )
    expect(receipt1.seal).toBe(receipt2.seal)
    expect(receipt1.hash).toBe(receipt2.hash)

    // Altered signer name produces completely different seal
    const receipt3 = await generateDigitalSeal(
      'doc-100',
      'Master Services Agreement',
      'John Connor',
      '2026-10-14T10:00:00.000Z'
    )
    expect(receipt1.seal).not.toBe(receipt3.seal)
  })
})
