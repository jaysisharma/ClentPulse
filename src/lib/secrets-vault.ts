import { sealSecret, openSecret } from './server-secret'

export type SecretCategory = 'api_key' | 'credentials' | 'tokens' | 'database' | 'other'

const PURPOSE = 'project_secret_vault'

/**
 * Seals a secret with AES-256-GCM authenticated encryption.
 */
export function sealProjectSecret(plainText: string): string {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Secret value must be a non-empty string')
  }
  return sealSecret(plainText, PURPOSE)
}

/**
 * Decrypts an authenticated sealed secret.
 * Returns null if tampering or decryption fails.
 */
export function openProjectSecret(sealed: string): string | null {
  if (!sealed) return null
  return openSecret(sealed, PURPOSE)
}

/**
 * Masks a secret string for safe display in UI lists.
 */
export function maskSecretValue(): string {
  return '••••••••••••••••'
}

