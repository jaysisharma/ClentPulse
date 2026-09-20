/**
 * Provider registry — add new providers here only.
 * OAuth configs, display metadata, and scope definitions for all supported providers.
 */

export type IntegrationProvider = 'google' | 'github' | 'figma'

export type GoogleSubProvider = 'google_drive' | 'google_calendar'
export type AnyProvider = IntegrationProvider | GoogleSubProvider

export interface ProviderConfig {
  authUrl: string
  tokenUrl: string
  revokeUrl?: string
  scopes: string[]
  displayName: string
  description: string
  clientIdEnv: string
  clientSecretEnv: string
}

// Google Drive scopes — read-only, restricted to files the app creates/user selects
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
]

// Google Calendar scopes — read-only
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
]

const GOOGLE_USERINFO_SCOPES = [
  'openid',
  'email',
  'profile',
]

export const PROVIDERS: Record<IntegrationProvider, ProviderConfig> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    // Combined Drive + Calendar scopes in one connection
    scopes: [...GOOGLE_USERINFO_SCOPES, ...DRIVE_SCOPES, ...CALENDAR_SCOPES],
    displayName: 'Google',
    description: 'Connect Google Drive files and Google Calendar events to your projects.',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    // GitHub tokens cannot be revoked via API without a GitHub App
    scopes: ['public_repo', 'read:user', 'read:org'],
    displayName: 'GitHub',
    description: 'Link a GitHub repository and surface pull requests and commits.',
    clientIdEnv: 'GITHUB_CLIENT_ID',
    clientSecretEnv: 'GITHUB_CLIENT_SECRET',
  },
  figma: {
    authUrl: 'https://www.figma.com/oauth',
    tokenUrl: 'https://www.figma.com/api/oauth/token',
    revokeUrl: 'https://www.figma.com/api/oauth/token',
    scopes: ['files:read'],
    displayName: 'Figma',
    description: 'Connect a Figma design file for client review and approvals.',
    clientIdEnv: 'FIGMA_CLIENT_ID',
    clientSecretEnv: 'FIGMA_CLIENT_SECRET',
  },
}

export const ALLOWED_PROVIDERS = Object.keys(PROVIDERS) as IntegrationProvider[]

export function isValidProvider(p: string): p is IntegrationProvider {
  return ALLOWED_PROVIDERS.includes(p as IntegrationProvider)
}

export function getProvider(p: string): ProviderConfig | null {
  if (!isValidProvider(p)) return null
  return PROVIDERS[p]
}

/**
 * Returns the configured client credentials for a provider.
 * Returns null if either env var is missing.
 */
export function getProviderCredentials(provider: IntegrationProvider): {
  clientId: string
  clientSecret: string
} | null {
  const config = PROVIDERS[provider]
  const clientId = process.env[config.clientIdEnv]
  const clientSecret = process.env[config.clientSecretEnv]
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}
