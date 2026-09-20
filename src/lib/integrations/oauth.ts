/**
 * Shared OAuth helpers for all integration providers.
 *
 * Responsibilities:
 *  - Build provider authorization URLs with CSRF state
 *  - Exchange authorization codes for tokens (server-side only)
 *  - Refresh expired access tokens
 *  - Encrypt/decrypt tokens using AES-256-GCM
 *  - Store/retrieve connection records in the DB
 *
 * Tokens NEVER leave the server — callers receive only safe metadata.
 */

import crypto from 'crypto'
import { SupabaseClient } from '@supabase/supabase-js'
import { IntegrationProvider, getProvider, getProviderCredentials, PROVIDERS, isValidProvider } from './providers'

export { isValidProvider }

// ---------------------------------------------------------------------------
// Encryption helpers — AES-256-GCM
// ---------------------------------------------------------------------------

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY
  if (!key) throw new Error('INTEGRATION_ENCRYPTION_KEY is not set')
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== 32) throw new Error('INTEGRATION_ENCRYPTION_KEY must be 32 bytes (64 hex chars)')
  return buf
}

/**
 * Encrypts a plaintext string.
 * Returns `ciphertext:iv:authTag` as a colon-joined base64 string.
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12) // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [
    encrypted.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
  ].join(':')
}

/**
 * Decrypts a token previously encrypted with encryptToken.
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  const [encPart, ivPart, tagPart] = ciphertext.split(':')
  if (!encPart || !ivPart || !tagPart) throw new Error('Invalid ciphertext format')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, 'base64'))
  decipher.setAuthTag(Buffer.from(tagPart, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encPart, 'base64')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

// ---------------------------------------------------------------------------
// CSRF state helpers
// ---------------------------------------------------------------------------

const STATE_HMAC_KEY_ENV = 'INTEGRATION_STATE_SECRET'

/**
 * Generates a signed OAuth state parameter.
 * Format: `randomHex.hmacSignature`
 */
export function generateOAuthState(provider: IntegrationProvider, userId: string): string {
  const secret = process.env[STATE_HMAC_KEY_ENV]
  if (!secret) throw new Error('INTEGRATION_STATE_SECRET is not set')
  const nonce = crypto.randomBytes(16).toString('hex')
  const payload = `${provider}:${userId}:${nonce}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  // Encode as base64url so it's URL-safe
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

/**
 * Verifies a state parameter. Returns decoded payload or null.
 */
export function verifyOAuthState(
  state: string,
  expectedProvider: IntegrationProvider
): { provider: IntegrationProvider; userId: string } | null {
  try {
    const secret = process.env[STATE_HMAC_KEY_ENV]
    if (!secret) return null
    const decoded = Buffer.from(state, 'base64url').toString('utf8')
    const dotIdx = decoded.lastIndexOf('.')
    if (dotIdx === -1) return null
    const payload = decoded.slice(0, dotIdx)
    const providedSig = decoded.slice(dotIdx + 1)
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(providedSig, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return null
    }
    const [provider, userId] = payload.split(':')
    if (!provider || !userId) return null
    if (provider !== expectedProvider) return null
    return { provider: provider as IntegrationProvider, userId }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Authorization URL
// ---------------------------------------------------------------------------

export function buildAuthUrl(
  provider: IntegrationProvider,
  state: string,
  redirectUri: string
): string {
  const config = getProvider(provider)
  if (!config) throw new Error(`Unknown provider: ${provider}`)
  const creds = getProviderCredentials(provider)
  if (!creds) throw new Error(`Missing credentials for provider: ${provider}`)

  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    state,
    response_type: 'code',
  })

  // Provider-specific extras
  if (provider === 'google') {
    params.set('access_type', 'offline')
    params.set('prompt', 'consent') // Always get refresh token
  }

  return `${config.authUrl}?${params.toString()}`
}

// ---------------------------------------------------------------------------
// Token Exchange
// ---------------------------------------------------------------------------

export interface TokenResponse {
  accessToken: string
  refreshToken: string | null
  expiresIn: number | null
  scope: string
  tokenType: string
  // Provider-specific extras (GitHub: none; Google: id_token)
  idToken?: string
}

export async function exchangeCode(
  provider: IntegrationProvider,
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const config = getProvider(provider)!
  const creds = getProviderCredentials(provider)!

  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  }

  const res = await fetch(config.tokenUrl, { method: 'POST', headers, body: body.toString() })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresIn: data.expires_in ?? null,
    scope: data.scope ?? '',
    tokenType: data.token_type ?? 'Bearer',
    idToken: data.id_token,
  }
}

// ---------------------------------------------------------------------------
// Token Refresh
// ---------------------------------------------------------------------------

export async function refreshAccessToken(
  provider: IntegrationProvider,
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number | null; newRefreshToken: string | null }> {
  const config = getProvider(provider)!
  const creds = getProviderCredentials(provider)!

  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status})`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in ?? null,
    newRefreshToken: data.refresh_token ?? null,
  }
}

// ---------------------------------------------------------------------------
// Token Revocation
// ---------------------------------------------------------------------------

export async function revokeToken(provider: IntegrationProvider, accessToken: string): Promise<void> {
  const config = getProvider(provider)
  if (!config?.revokeUrl) return // GitHub has no revoke endpoint

  try {
    if (provider === 'google') {
      await fetch(`${config.revokeUrl}?token=${encodeURIComponent(accessToken)}`, { method: 'POST' })
    } else if (provider === 'figma') {
      const creds = getProviderCredentials(provider)
      if (!creds) return
      await fetch(config.revokeUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: new URLSearchParams({ client_id: creds.clientId, client_secret: creds.clientSecret }).toString(),
      })
    }
  } catch {
    // Best-effort revocation — never block disconnect on this
  }
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

export interface ConnectionRecord {
  id: string
  user_id: string
  org_id: string | null
  provider: IntegrationProvider
  provider_account_id: string
  provider_account_email: string | null
  token_expires_at: string | null
  scopes: string[]
  status: 'active' | 'expired' | 'revoked'
  metadata: Record<string, any>
  // Raw encrypted fields — internal only
  access_token_enc: string | null
  refresh_token_enc: string | null
}

/**
 * Stores or updates an OAuth connection for a user.
 * Tokens are encrypted before storage.
 */
export async function storeConnection(
  supabase: SupabaseClient,
  userId: string,
  provider: IntegrationProvider,
  tokens: TokenResponse,
  accountInfo: { accountId: string; email?: string | null }
): Promise<string> {
  const expiresAt = tokens.expiresIn
    ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
    : null

  const row = {
    user_id: userId,
    provider,
    provider_account_id: accountInfo.accountId,
    provider_account_email: accountInfo.email ?? null,
    access_token_enc: encryptToken(tokens.accessToken),
    refresh_token_enc: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
    token_expires_at: expiresAt,
    scopes: tokens.scope ? tokens.scope.split(/[\s,]+/).filter(Boolean) : [],
    status: 'active' as const,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('integration_connections')
    .upsert(row, { onConflict: 'user_id,provider' })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to store connection: ${error.message}`)
  return data.id
}

/**
 * Retrieves the decrypted access token for a provider.
 * Attempts refresh if expired. Returns null if not connected.
 */
export async function getDecryptedConnection(
  supabase: SupabaseClient,
  userId: string,
  provider: IntegrationProvider
): Promise<{
  accessToken: string
  connection: ConnectionRecord
} | null> {
  const { data: conn, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !conn || !conn.access_token_enc) return null

  try {
    let accessToken = decryptToken(conn.access_token_enc)

    // Check if token is expired (with 2-minute buffer)
    const isExpired = conn.token_expires_at
      && new Date(conn.token_expires_at).getTime() < Date.now() + 2 * 60 * 1000

    if (isExpired && conn.refresh_token_enc) {
      const refreshToken = decryptToken(conn.refresh_token_enc)
      try {
        const refreshed = await refreshAccessToken(provider, refreshToken)
        accessToken = refreshed.accessToken

        // Persist the new token
        await supabase
          .from('integration_connections')
          .update({
            access_token_enc: encryptToken(refreshed.accessToken),
            ...(refreshed.newRefreshToken
              ? { refresh_token_enc: encryptToken(refreshed.newRefreshToken) }
              : {}),
            token_expires_at: refreshed.expiresIn
              ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conn.id)
      } catch {
        // Refresh failed — mark as expired
        await supabase
          .from('integration_connections')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('id', conn.id)
        return null
      }
    }

    return { accessToken, connection: conn as ConnectionRecord }
  } catch {
    return null
  }
}

/**
 * Returns safe connection metadata (no tokens) for display.
 */
export async function getConnectionStatus(
  supabase: SupabaseClient,
  userId: string,
  provider: IntegrationProvider
): Promise<{
  connected: boolean
  status: 'active' | 'expired' | 'revoked' | null
  email: string | null
  accountId: string | null
  connectedAt: string | null
} | null> {
  const { data } = await supabase
    .from('integration_connections')
    .select('status, provider_account_email, provider_account_id, created_at')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle()

  if (!data) return { connected: false, status: null, email: null, accountId: null, connectedAt: null }

  return {
    connected: data.status === 'active',
    status: data.status,
    email: data.provider_account_email,
    accountId: data.provider_account_id,
    connectedAt: data.created_at,
  }
}

/**
 * Builds the callback redirect URI for a given provider.
 */
export function buildRedirectUri(provider: IntegrationProvider, request: Request): string {
  const url = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`
  return `${appUrl}/api/integrations/${provider}/callback`
}
