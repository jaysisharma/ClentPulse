'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { formatDate, getWeekOf } from '@/lib/utils'
import { UpdateActions } from './update-actions'
import { UpdateCommentForm } from '@/app/p/[slug]/update-comment-form'

interface Update {
  id: string
  created_at: string
  sent_at: string | null
  bullets: string[]
  note: string | null
}

export function UpdatesList({
  updates,
  projectColor,
  projectId,
  updateComments,
  ownerName,
}: {
  updates: Update[]
  projectColor: string
  projectId: string
  updateComments: any[]
  ownerName: string
}) {
  const [visibleCount, setVisibleCount] = useState(2)

  const visibleUpdates = updates.slice(0, visibleCount)

  return (
    <div className="space-y-4">
      {visibleUpdates.map(update => (
        <div key={update.id} className="bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900 font-sans">{getWeekOf(update.created_at)}</span>
            <div className="flex items-center gap-2">
              {update.sent_at ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-sans">
                  <Check className="w-3 h-3" />Sent {formatDate(update.sent_at)}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-sans">Draft</span>
              )}
              <UpdateActions updateId={update.id} projectId={projectId} />
            </div>
          </div>
          <ul className="space-y-2.5">
            {(update.bullets ?? []).filter(Boolean).map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed font-sans">
                <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: projectColor }} />
                {b}
              </li>
            ))}
          </ul>
          {update.note && (
            <p className="text-sm text-slate-500 italic border-t border-slate-100 pt-3 mt-4 font-sans">{update.note}</p>
          )}
          <UpdateCommentForm
            updateId={update.id}
            projectId={projectId}
            accentColor={projectColor}
            existingComments={(updateComments ?? []).filter((c: any) => c.update_id === update.id)}
            defaultAuthorName={ownerName}
          />
        </div>
      ))}

      {visibleCount < updates.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          className="w-full py-3 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200/60 rounded-2xl hover:bg-slate-100 transition-colors mt-4 cursor-pointer font-sans"
        >
          Show more ({updates.length - visibleCount} remaining)
        </button>
      )}
    </div>
  )
}
