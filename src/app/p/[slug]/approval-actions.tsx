'use client'

import { useState } from 'react'
import {
  CheckCircle2, XCircle, Clock, ExternalLink,
  Globe, Palette, GitPullRequest, FileText, Archive,
  Megaphone, FileEdit, BarChart3, AppWindow
} from 'lucide-react'
import { ensureExternalProtocol } from '@/lib/utils'

interface Approval {
  id: string
  title: string
  url: string | null
  preview_type?: string | null
  status: string
  feedback: string | null
}

const PREVIEW_CONFIG: Record<string, { label: string; action: string; icon: typeof Globe }> = {
  ad_creative: { label: 'Ad Creative', action: 'Inspect Ad Creative & Assets', icon: Megaphone },
  copy_deck: { label: 'Copy Deck', action: 'Review Ad & Campaign Copy', icon: FileEdit },
  analytics_report: { label: 'Analytics Report', action: 'Open Performance Dashboard', icon: BarChart3 },
  landing_page: { label: 'Landing Page', action: 'Preview Landing Page & Funnel', icon: AppWindow },
  staging: { label: 'Live Staging', action: 'Open Staging Environment', icon: Globe },
  figma: { label: 'Figma Prototype', action: 'Inspect Figma Prototype', icon: Palette },
  code_pr: { label: 'Code Review', action: 'Review Pull Request', icon: GitPullRequest },
  document: { label: 'Specification', action: 'View Deliverable Document', icon: FileText },
  asset_zip: { label: 'Asset Archive', action: 'Download Asset Package', icon: Archive },
}

export function ApprovalCard({ approval, accentColor }: { approval: Approval; accentColor: string }) {
  const [status, setStatus] = useState(approval.status)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(false)

  const config = PREVIEW_CONFIG[approval.preview_type || 'staging'] || PREVIEW_CONFIG.staging
  const PreviewIcon = config.icon

  async function respond(s: 'approved' | 'changes_requested') {
    setLoading(true)
    await fetch(`/api/approvals/${approval.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s, feedback: feedback || null }),
    })
    setStatus(s)
    setShowFeedback(false)
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xs dark:shadow-none p-5 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{approval.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              <PreviewIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
        </div>
        {status === 'pending' ? (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <Clock className="w-3 h-3" />Awaiting review
          </span>
        ) : status === 'approved' ? (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" />Approved
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
            <XCircle className="w-3 h-3" />Changes requested
          </span>
        )}
      </div>

      {/* Deliverable preview button */}
      {approval.url && (
        <div className="my-3">
          <a
            href={ensureExternalProtocol(approval.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.07] transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <PreviewIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {config.action}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                  {approval.url}
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white flex-shrink-0 transition-colors" />
          </a>
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
          {showFeedback && (
            <textarea
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
              rows={2}
              placeholder="Leave a note or reason for changes (optional)..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => respond('approved')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />Approve
            </button>
            <button
              onClick={() => setShowFeedback(s => !s)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5" />Request changes
            </button>
          </div>
          {showFeedback && (
            <button onClick={() => respond('changes_requested')} disabled={loading}
              className="w-full py-2 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors disabled:opacity-50">
              Submit changes request
            </button>
          )}
        </div>
      )}

      {status !== 'pending' && approval.feedback && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-3 border-t border-slate-100 dark:border-white/5 pt-2.5">{approval.feedback}</p>
      )}
    </div>
  )
}
