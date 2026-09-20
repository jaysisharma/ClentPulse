'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react'

export function FeedbackWidget({ projectId, accentColor }: { projectId: string; accentColor: string }) {
  const [reaction, setReaction] = useState<'thumbs_up' | 'thumbs_down' | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(type: 'thumbs_up' | 'thumbs_down' | 'question', msg?: string) {
    setLoading(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, type, message: msg || null }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full max-w-xs mx-auto my-4">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        Feedback received — thank you!
      </div>
    )
  }

  return (
    <div className="py-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Client Sentiment Check
      </p>
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <button
          onClick={() => { setReaction('thumbs_up'); submit('thumbs_up') }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
            reaction === 'thumbs_up'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Looking good
        </button>
        <button
          onClick={() => { setReaction('thumbs_down'); submit('thumbs_down') }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
            reaction === 'thumbs_down'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Have questions
        </button>
        <button
          onClick={() => setShowMessage(m => !m)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Send note
        </button>
      </div>

      {showMessage && (
        <div className="mt-4 max-w-sm mx-auto text-left">
          <textarea
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
            placeholder="Share private thoughts with the studio team…"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            disabled={!message.trim() || loading}
            onClick={() => submit('question', message)}
            className="mt-2 w-full py-2.5 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Submitting…' : 'Submit Note'}
          </button>
        </div>
      )}
    </div>
  )
}
