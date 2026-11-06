'use client'

import { useState } from 'react'
import {
  CheckCircle2, XCircle, Clock, ExternalLink, Loader2,
  Globe, Palette, GitPullRequest, FileText, Archive,
  Megaphone, FileEdit, BarChart3, AppWindow
} from 'lucide-react'
import { cn, ensureExternalProtocol } from '@/lib/utils'
import { MUTED, PRIMARY_BUTTON, SECONDARY_BUTTON } from './portal-ui'

export interface Approval {
  id: string
  title: string
  url: string | null
  preview_type?: string | null
  status: string
  feedback: string | null
}

const PREVIEW_CONFIG: Record<string, { label: string; action: string; icon: typeof Globe }> = {
  ad_creative: { label: 'Ad creative', action: 'Open ad creative', icon: Megaphone },
  copy_deck: { label: 'Copy deck', action: 'Open copy deck', icon: FileEdit },
  analytics_report: { label: 'Analytics report', action: 'Open report', icon: BarChart3 },
  landing_page: { label: 'Landing page', action: 'Open landing page', icon: AppWindow },
  staging: { label: 'Staging site', action: 'Open staging site', icon: Globe },
  figma: { label: 'Figma prototype', action: 'Open prototype', icon: Palette },
  code_pr: { label: 'Code review', action: 'Open pull request', icon: GitPullRequest },
  document: { label: 'Document', action: 'Open document', icon: FileText },
  asset_zip: { label: 'Asset package', action: 'Download assets', icon: Archive },
}

function previewConfig(type: string | null | undefined) {
  return PREVIEW_CONFIG[type || 'staging'] || PREVIEW_CONFIG.staging
}

export function ApprovalStatusPill({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
        <Clock className="w-3 h-3" />Awaiting you
      </span>
    )
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
        <CheckCircle2 className="w-3 h-3" />Approved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
      <XCircle className="w-3 h-3" />{status === 'declined' ? 'Declined' : 'Changes requested'}
    </span>
  )
}

/** A deliverable waiting for the client's sign-off. */
export function ApprovalCard({
  approval,
  accentColor,
  onDecided,
}: {
  approval: Approval
  accentColor: string
  onDecided?: (approval: Approval) => void
}) {
  const [status, setStatus] = useState(approval.status)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = previewConfig(approval.preview_type)
  const PreviewIcon = config.icon

  async function respond(next: 'approved' | 'changes_requested') {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/approvals/${approval.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, feedback: feedback.trim() || null }),
    }).catch(() => null)
    setLoading(false)
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}))
      setError(data?.error || 'We couldn’t record your response. Please try again.')
      return
    }
    setStatus(next)
    setShowFeedback(false)
    onDecided?.({ ...approval, status: next, feedback: feedback.trim() || null })
  }

  return (
    <div className="p-4 rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-white/[0.02] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: accentColor }}>
            <PreviewIcon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold break-words">{approval.title}</p>
            <p className={cn('text-xs mt-0.5', MUTED)}>{config.label} · ready for your sign-off</p>
          </div>
        </div>
        <ApprovalStatusPill status={status} />
      </div>

      {approval.preview_type === 'ad_creative' && (
        <div className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-black/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Sponsored Ad Creative
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">Sign-off required before spend</span>
          </div>
          {approval.url && /\.(png|jpe?g|webp|gif|svg)$/i.test(approval.url) && (
            <div className="relative rounded overflow-hidden max-h-56 flex items-center justify-center bg-slate-900/10 dark:bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={approval.url} alt={approval.title} className="max-h-56 w-auto object-contain" />
            </div>
          )}
        </div>
      )}

      {approval.preview_type === 'copy_deck' && (
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Copy Deck Verification</span>
            <span className="text-emerald-600 dark:text-emerald-400">Review Copy</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Please verify headlines, offer details, and compliance copy before campaign launch.
          </p>
        </div>
      )}

      {status === 'pending' && (
        <>
          {showFeedback && (
            <div>
              <label htmlFor={`fb-${approval.id}`} className="block text-xs font-semibold mb-1.5">What should change?</label>
              <textarea
                id={`fb-${approval.id}`}
                className="w-full px-3 py-2 text-sm rounded-md border border-[#eaecf2] dark:border-white/10 bg-white dark:bg-white/[0.03] placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none"
                rows={3}
                maxLength={2000}
                placeholder="Be as specific as you can — the team sees this right away."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {approval.url && (
              <a href={ensureExternalProtocol(approval.url)} target="_blank" rel="noopener noreferrer" className={cn(SECONDARY_BUTTON, 'mr-auto')}>
                <ExternalLink className="w-3.5 h-3.5" /> {config.action}
              </a>
            )}
            {showFeedback ? (
              <>
                <button type="button" onClick={() => setShowFeedback(false)} disabled={loading} className={SECONDARY_BUTTON}>Cancel</button>
                <button
                  type="button"
                  onClick={() => respond('changes_requested')}
                  disabled={loading || !feedback.trim()}
                  className={PRIMARY_BUTTON}
                  style={{ backgroundColor: accentColor }}
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Send change request
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setShowFeedback(true)} disabled={loading} className={SECONDARY_BUTTON}>Request changes</button>
                <button type="button" onClick={() => respond('approved')} disabled={loading} className={PRIMARY_BUTTON} style={{ backgroundColor: accentColor }}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                </button>
              </>
            )}
          </div>
        </>
      )}

      {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}

/** A past sign-off, for the Review tab's history. */
export function ApprovalHistoryRow({ approval }: { approval: Approval }) {
  const config = previewConfig(approval.preview_type)
  return (
    <li className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold break-words">{approval.title}</p>
        <p className={cn('text-xs mt-0.5', MUTED)}>
          {config.label}
          {approval.url && (
            <>
              {' · '}
              <a href={ensureExternalProtocol(approval.url)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-900 dark:hover:text-white">
                Open
              </a>
            </>
          )}
        </p>
        {approval.feedback && <p className={cn('text-xs mt-1.5 italic break-words', MUTED)}>“{approval.feedback}”</p>}
      </div>
      <ApprovalStatusPill status={approval.status} />
    </li>
  )
}
