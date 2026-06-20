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
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200/80 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-sm text-slate-400">No feedback submitted by the client yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(feedback.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFeedback = feedback.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-4">
        {paginatedFeedback.map(fb => (
          <div key={fb.id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-2xl p-5 flex items-start gap-4">
            {fb.type === 'thumbs_up' && (
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
            )}
            {fb.type === 'thumbs_down' && (
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <ThumbsDown className="w-5 h-5" />
              </div>
            )}
            {fb.type === 'question' && (
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                  {fb.type === 'thumbs_up' && 'Looking good'}
                  {fb.type === 'thumbs_down' && 'Has concerns'}
                  {fb.type === 'question' && 'Message left'}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  {formatDate(fb.created_at)}
                </span>
              </div>
              {fb.message ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2 mt-2 leading-relaxed font-sans">
                  {fb.message}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mt-0.5 font-sans">No message attached.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-sans">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="text-xs font-semibold px-3 py-1.5 h-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"
            >
              &larr; Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="text-xs font-semibold px-3 py-1.5 h-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 disabled:opacity-50"
            >
              Next &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
