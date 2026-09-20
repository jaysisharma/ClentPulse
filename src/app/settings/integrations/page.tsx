'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Provider logo SVGs (inline, no external dependency)
// ---------------------------------------------------------------------------

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-900 dark:text-white" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

function FigmaLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#F24E1E" d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/>
      <path fill="#FF7262" d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"/>
      <path fill="#A259FF" d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"/>
      <path fill="#1ABCFE" d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"/>
      <path fill="#0ACF83" d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Connection status type
// ---------------------------------------------------------------------------

type ConnStatus = {
  connected: boolean
  status: 'active' | 'expired' | 'revoked' | null
  email: string | null
}

type StatusMap = {
  google: ConnStatus | null
  github: ConnStatus | null
  figma: ConnStatus | null
}

function mapCardStatus(
  s: ConnStatus | null,
  loading: boolean
): 'idle' | 'loading' | 'connected' | 'expired' | 'not_configured' {
  if (loading) return 'loading'
  if (!s) return 'idle'
  if (s.status === 'active') return 'connected'
  if (s.status === 'expired') return 'expired'
  return 'idle'
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [statuses, setStatuses] = useState<StatusMap>({ google: null, github: null, figma: null })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Read URL params for post-OAuth feedback
  const connected = searchParams.get('connected')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (connected) {
      setToast({ type: 'success', message: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully.` })
      router.replace('/settings/integrations')
    } else if (errorParam) {
      const messages: Record<string, string> = {
        access_denied: 'You declined the connection request.',
        invalid_state: 'Connection failed due to an invalid security token. Please try again.',
        exchange_failed: 'Could not complete the connection. Please try again.',
        not_configured: 'This integration is not configured on this server.',
      }
      setToast({ type: 'error', message: messages[errorParam] || 'Connection failed. Please try again.' })
      router.replace('/settings/integrations')
    }
  }, [connected, errorParam, router])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  const fetchStatuses = useCallback(async () => {
    setLoading(true)
    try {
      const [g, gh, fig] = await Promise.all([
        fetch('/api/integrations/google/status').then(r => r.ok ? r.json() : null),
        fetch('/api/integrations/github/status').then(r => r.ok ? r.json() : null),
        fetch('/api/integrations/figma/status').then(r => r.ok ? r.json() : null),
      ])
      setStatuses({ google: g, github: gh, figma: fig })
    } catch {
      // Non-fatal — statuses stay null (idle)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatuses() }, [fetchStatuses])

  const handleConnect = (provider: string) => {
    window.location.assign(`/api/integrations/${provider}/connect`)
  }

  const handleDisconnect = async (provider: keyof StatusMap) => {
    const res = await fetch(`/api/integrations/${provider}/disconnect`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to disconnect')
    setStatuses(prev => ({ ...prev, [provider]: { connected: false, status: 'revoked', email: null } }))
    setToast({ type: 'success', message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected.` })
  }

  const CATEGORIES = [
    {
      label: 'Files',
      providers: [
        {
          key: 'google' as const,
          displayName: 'Google Drive',
          description: 'Attach Drive files and folders to projects. Clients see them in the portal.',
          logo: <GoogleLogo />,
        },
      ],
    },
    {
      label: 'Calendar',
      providers: [
        {
          key: 'google' as const,
          displayName: 'Google Calendar',
          description: 'Connect project meetings and deadlines from Google Calendar.',
          logo: <GoogleLogo />,
        },
      ],
    },
    {
      label: 'Development',
      providers: [
        {
          key: 'github' as const,
          displayName: 'GitHub',
          description: 'Link a repository, surface pull requests and deployment status to clients.',
          logo: <GitHubLogo />,
        },
      ],
    },
    {
      label: 'Design',
      providers: [
        {
          key: 'figma' as const,
          displayName: 'Figma',
          description: 'Connect Figma design files for client review and in-flow approvals.',
          logo: <FigmaLogo />,
        },
      ],
    },
  ]

  // Deduplicate Google (shown in both Files and Calendar categories)
  const renderedKeys = new Set<string>()

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-4">
              <Link href="/settings" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Settings
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-white">Integrations</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Integrations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect the tools you already use. Frevio becomes the client-facing workspace.
            </p>
          </div>

          {/* Toast */}
          {toast && (
            <div
              role="alert"
              aria-live="polite"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-6 ${
                toast.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40'
              }`}
            >
              {toast.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />
              }
              {toast.message}
            </div>
          )}

          {/* Integration categories */}
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const cards = category.providers.filter(p => {
                const dedupKey = p.key
                if (renderedKeys.has(dedupKey)) return false
                // For Google, only show in the first category it appears in
                renderedKeys.add(dedupKey)
                return true
              })

              if (cards.length === 0) return null

              return (
                <section key={category.label} aria-labelledby={`cat-${category.label}`}>
                  <h2
                    id={`cat-${category.label}`}
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
                  >
                    {category.label}
                  </h2>
                  <div className="space-y-3">
                    {cards.map(p => {
                      const s = statuses[p.key]
                      const cardStatus = mapCardStatus(s, loading)
                      return (
                        <IntegrationCard
                          key={`${category.label}-${p.key}`}
                          provider={p.key}
                          displayName={p.displayName}
                          description={p.description}
                          logo={p.logo}
                          status={cardStatus}
                          connectedEmail={s?.email ?? null}
                          onConnect={() => handleConnect(p.key)}
                          onDisconnect={() => handleDisconnect(p.key)}
                        />
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Note on Google shared connection */}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-8">
            Google Drive and Google Calendar share a single Google account connection.
            Connecting Google once grants access to both.
          </p>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
