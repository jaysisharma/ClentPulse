'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'

interface Approval { id: string; title: string; url: string | null; status: string; feedback: string | null }

export function ApprovalCard({ approval, accentColor }: { approval: Approval; accentColor: string }) {
  const [status, setStatus] = useState(approval.status)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(false)

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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold text-slate-900">{approval.title}</div>
          {approval.url && (
            <a href={approval.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-1 hover:underline"
              style={{ color: accentColor }}>
              <ExternalLink className="w-3 h-3" />View deliverable
            </a>
          )}
        </div>
        {status === 'pending' ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
            <Clock className="w-3 h-3" />Awaiting review
          </span>
        ) : status === 'approved' ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" />Approved
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full flex-shrink-0">
            <XCircle className="w-3 h-3" />Changes requested
          </span>
        )}
      </div>

      {status === 'pending' && (
        <div className="space-y-2">
          {showFeedback && (
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              rows={2}
              placeholder="Leave a note (optional)"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => respond('approved')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCircle2 className="w-4 h-4" />Approve
            </button>
            <button
              onClick={() => setShowFeedback(s => !s)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />Request changes
            </button>
          </div>
          {showFeedback && (
            <button onClick={() => respond('changes_requested')} disabled={loading}
              className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
              Submit changes request
            </button>
          )}
        </div>
      )}

      {status !== 'pending' && approval.feedback && (
        <p className="text-sm text-slate-500 italic mt-2 border-t border-slate-100 pt-2">{approval.feedback}</p>
      )}
    </div>
  )
}
