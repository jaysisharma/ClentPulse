'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Loader2, Plug, PlugZap, ExternalLink, RefreshCw } from 'lucide-react'

export interface IntegrationCardProps {
  provider: string              // 'google' | 'github' | 'figma'
  displayName: string
  description: string
  logo: React.ReactNode
  status: 'idle' | 'loading' | 'connected' | 'expired' | 'not_configured' | 'error'
  connectedEmail?: string | null
  onConnect: () => void
  onDisconnect: () => Promise<void>
  error?: string | null
}

export function IntegrationCard({
  provider,
  displayName,
  description,
  logo,
  status,
  connectedEmail,
  onConnect,
  onDisconnect,
  error,
}: IntegrationCardProps) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [disconnectError, setDisconnectError] = useState<string | null>(null)

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true)
    setDisconnectError(null)
    try {
      await onDisconnect()
    } catch (err: any) {
      setDisconnectError(err?.message || 'Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }, [onDisconnect])

  const isConnected = status === 'connected'
  const isExpired = status === 'expired'
  const isLoading = status === 'loading'
  const isNotConfigured = status === 'not_configured'

  return (
    <div
      className={`
        rounded-2xl border bg-white dark:bg-[#0c0d12] p-5 transition-colors
        ${isConnected
          ? 'border-green-200 dark:border-green-900/40'
          : isExpired
          ? 'border-yellow-200 dark:border-yellow-900/40'
          : 'border-slate-200 dark:border-white/10'
        }
      `}
      aria-label={`${displayName} integration`}
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5">
          {logo}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</span>
              {isLoading && (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" aria-label="Loading" />
              )}
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              )}
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="w-3 h-3" />
                  Reconnect required
                </span>
              )}
            </div>
          </div>

          {/* Email / account */}
          {connectedEmail && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {connectedEmail}
            </p>
          )}

          {/* Description */}
          {!isConnected && !isExpired && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Not configured */}
          {isNotConfigured && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Provider credentials not configured. Add{' '}
              <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded text-[10px]">
                {provider.toUpperCase()}_CLIENT_ID
              </code>{' '}
              to your environment.
            </p>
          )}

          {/* Errors */}
          {(error || disconnectError) && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
              {error || disconnectError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading ? null : isConnected ? (
            <>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Disconnect ${displayName}`}
              >
                {disconnecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Disconnect'
                )}
              </button>
            </>
          ) : isExpired ? (
            <button
              onClick={onConnect}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors border border-yellow-200 dark:border-yellow-900/40"
              aria-label={`Reconnect ${displayName}`}
            >
              <RefreshCw className="w-3 h-3" />
              Reconnect
            </button>
          ) : isNotConfigured ? (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Not available</span>
          ) : (
            <button
              onClick={onConnect}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
              aria-label={`Connect ${displayName}`}
            >
              <PlugZap className="w-3 h-3" />
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
