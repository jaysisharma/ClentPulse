'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Feedback {
  id: string
  project_id: string
  type: string
  message: string | null
  created_at: string
}

export function ClientFeedbackList({ feedback }: { feedback: Feedback[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  if (!feedback || feedback.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-[#0c0d12]/60 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center ring-1 ring-slate-950/5 dark:ring-white/5">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light">No feedback submitted by the client yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(feedback.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFeedback = feedback.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-3">
        {paginatedFeedback.map(fb => (
          <div key={fb.id} className="bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
            {fb.type === 'thumbs_up' && (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="w-4 h-4" />
              </div>
            )}
            {fb.type === 'thumbs_down' && (
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <ThumbsDown className="w-4 h-4" />
              </div>
            )}
            {fb.type === 'question' && (
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white font-sans">
                  {fb.type === 'thumbs_up' && 'Looking good'}
                  {fb.type === 'thumbs_down' && 'Has concerns'}
                  {fb.type === 'question' && 'Message left'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {formatDate(fb.created_at)}
                </span>
              </div>
              {fb.message ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 mt-2 leading-relaxed font-sans">
                  {fb.message}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5 font-sans">No message attached.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 transition-all shadow-xs"
            >
              &larr; Prev
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 transition-all shadow-xs"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
