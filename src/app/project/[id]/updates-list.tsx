'use client'

import { useState } from 'react'
import { Check, ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import { formatDate, getWeekOf } from '@/lib/utils'
import { UpdateActions } from './update-actions'
import { UpdateCommentForm } from '@/app/p/[slug]/update-comment-form'
import { VideoEmbed } from '@/components/ui/video-embed'

interface Update {
  id: string
  created_at: string
  sent_at: string | null
  bullets: string[]
  note: string | null
  video_url?: string | null
  review_status?: 'draft' | 'review_ready' | 'approved' | 'published'
  author_id?: string | null
  approved_by?: string | null
  approved_at?: string | null
}

export function UpdatesList({
  updates: initialUpdates,
  projectColor,
  projectId,
  updateComments,
  ownerName,
  canApprove = false,
}: {
  updates: Update[]
  projectColor: string
  projectId: string
  updateComments: any[]
  ownerName: string
  canApprove?: boolean
}) {
  const [updates, setUpdates] = useState<Update[]>(initialUpdates)
  const [visibleCount, setVisibleCount] = useState(2)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const visibleUpdates = updates.slice(0, visibleCount)

  async function handleApprove(updateId: string) {
    setApprovingId(updateId)
    try {
      const res = await fetch(`/api/projects/${projectId}/updates/${updateId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_draft' }),
      })
      if (res.ok) {
        setUpdates(prev =>
          prev.map(u =>
            u.id === updateId ? { ...u, review_status: 'approved' as const } : u
          )
        )
      }
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {visibleUpdates.map(update => (
        <div key={update.id} className="bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans">{getWeekOf(update.created_at)}</span>
            <div className="flex items-center gap-2">
              {update.sent_at || update.review_status === 'published' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-sans">
                  <Check className="w-3 h-3" />Sent {formatDate(update.sent_at || update.created_at)}
                </span>
              ) : update.review_status === 'review_ready' ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-sans">
                    <Clock className="w-3 h-3" />Awaiting PM Review
                  </span>
                  {canApprove && (
                    <button
                      onClick={() => handleApprove(update.id)}
                      disabled={approvingId === update.id}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {approvingId === update.id ? 'Approving...' : 'Approve Draft'}
                    </button>
                  )}
                </div>
              ) : update.review_status === 'approved' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-sans">
                  <CheckCircle className="w-3 h-3" />Approved for Client
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full font-sans">
                  Draft
                </span>
              )}
              <UpdateActions updateId={update.id} projectId={projectId} />
            </div>
          </div>

          {update.video_url && (
            <div className="mb-4">
              <VideoEmbed url={update.video_url} accentColor={projectColor} />
            </div>
          )}

          <ul className="space-y-2.5">
            {(update.bullets ?? []).filter(Boolean).map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: projectColor }} />
                {b}
              </li>
            ))}
          </ul>
          {update.note && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-white/5 pt-3 mt-4 font-sans">{update.note}</p>
          )}
          <UpdateCommentForm
            updateId={update.id}
            projectId={projectId}
            accentColor={projectColor}
            existingComments={(updateComments ?? []).filter((c: any) => c.update_id === update.id)}
            defaultAuthorName={ownerName}
            allowInternal={true}
          />
        </div>
      ))}

      {visibleCount < updates.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          className="w-full py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/10 transition-colors mt-4 cursor-pointer shadow-xs font-sans"
        >
          Show more ({updates.length - visibleCount} remaining)
        </button>
      )}
    </div>
  )
}
