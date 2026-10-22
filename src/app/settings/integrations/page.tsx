'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ShieldCheck, Banknote } from 'lucide-react'
import Link from 'next/link'
import {
  GoogleDriveIcon,
  GoogleCalendarIcon,
  GitHubIcon,
  FigmaIcon,
} from '@/components/ui/brand-icons'

// ---------------------------------------------------------------------------
// Provider logo SVGs
// ---------------------------------------------------------------------------

function StripeLogo() {
  return (
    <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="8" fill="#635BFF" />
      <path
        d="M19.7 16.5c0-1.2 1-1.7 2.6-1.7 2.3 0 5.2.7 7.5 2V12c-2.4-1-5-1.4-7.5-1.4-6.2 0-10.4 3.2-10.4 8.7 0 8.5 11.6 7.1 11.6 10.8 0 1.4-1.2 1.9-2.9 1.9-2.6 0-5.9-1.1-8.5-2.5v4.9c2.8 1.2 5.7 1.7 8.5 1.7 6.4 0 10.8-3.1 10.8-8.7 0-9.2-11.7-7.5-11.7-10.9z"
        fill="white"
      />
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

type ConnectStatus = {
  connected: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted?: boolean
  stripe_account_id?: string | null
  status?: string
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
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Read URL params for post-OAuth feedback
  const connected = searchParams.get('connected')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (connected === 'stripe') {
      setToast({ type: 'success', message: 'Stripe Direct Payouts onboarding updated.' })
      router.replace('/settings/integrations')
    } else if (connected) {
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
      const [g, gh, fig, conn] = await Promise.all([
        fetch('/api/integrations/google/status').then(r => r.ok ? r.json() : null),
        fetch('/api/integrations/github/status').then(r => r.ok ? r.json() : null),
        fetch('/api/integrations/figma/status').then(r => r.ok ? r.json() : null),
        fetch('/api/connect/status').then(r => r.ok ? r.json() : null),
      ])
      setStatuses({ google: g, github: gh, figma: fig })
      if (conn) setConnectStatus(conn)
    } catch {
      // Non-fatal
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

  const handleStripeConnect = async () => {
    try {
      setConnectingStripe(true)
      const res = await fetch('/api/connect/onboard', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to start Stripe onboarding')
      }
      window.location.href = data.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect Stripe'
      setToast({ type: 'error', message: msg })
      setConnectingStripe(false)
    }
  }

  const CATEGORIES = [
    {
      label: 'Files',
      providers: [
        {
          key: 'google' as const,
          displayName: 'Google Drive',
          description: 'Attach Drive files and folders to projects. Clients see them in the portal.',
          logo: <GoogleDriveIcon className="w-5 h-5" />,
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
          logo: <GoogleCalendarIcon className="w-5 h-5" />,
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
          logo: <GitHubIcon className="w-5 h-5 text-slate-900 dark:text-white" />,
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
          logo: <FigmaIcon className="w-4 h-5" />,
        },
      ],
    },
  ]

  const renderedKeys = new Set<string>()

  const isStripeActive = Boolean(connectStatus?.charges_enabled && connectStatus?.payouts_enabled)
  const isStripePending = Boolean(connectStatus?.connected && !isStripeActive)

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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Integrations & Payouts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect payment payouts and creative workflow tools to your client-facing portal.
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

          {/* Direct Payouts Section */}
          <section aria-labelledby="cat-payouts" className="mb-8">
            <h2
              id="cat-payouts"
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3"
            >
              Client Payments & Bank Payouts
            </h2>
            <div className="rounded-2xl border bg-white dark:bg-[#0c0d12] p-5 border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#635BFF]/10">
                  <StripeLogo />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Stripe Direct Payouts</span>
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                      ) : isStripeActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Payouts Active
                        </span>
                      ) : isStripePending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Action Required
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Direct-to-bank settlement for milestone invoices and scope changes. No Frevio transaction fee taken — 100% of your earnings route to your bank via Stripe Connect.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {isStripeActive ? (
                      <button
                        type="button"
                        onClick={handleStripeConnect}
                        disabled={connectingStripe}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                      >
                        {connectingStripe ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>Stripe Account Dashboard</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStripeConnect}
                        disabled={connectingStripe || loading}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-[#635BFF] hover:bg-[#5349e4] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {connectingStripe ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                        <span>{isStripePending ? 'Complete Stripe Verification' : 'Connect Stripe Payouts'}</span>
                      </button>
                    )}
                  </div>

                  {/* Fallback note for unsupported countries */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                      <strong>Country not supported by Stripe Connect?</strong> Frevio does not lock you out. You can still create invoices, attach manual bank or wire transfer instructions, and mark payments as received offline with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Integration categories */}
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const cards = category.providers.filter(p => {
                const dedupKey = p.key
                if (renderedKeys.has(dedupKey)) return false
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
