'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react'

interface FeedbackWidgetProps {
  projectId: string
  accentColor: string
  updateId?: string
  updateTitle?: string
  variant?: 'card' | 'inline'
}

export function FeedbackWidget({
  projectId,
  accentColor,
  updateId,
  updateTitle,
  variant = 'card',
}: FeedbackWidgetProps) {
  const [reaction, setReaction] = useState<'thumbs_up' | 'thumbs_down' | null>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const storageKey = `frevio_fb_${projectId}_${updateId || 'global'}`

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setSubmitted(true)
          if (stored === 'thumbs_up' || stored === 'thumbs_down') {
            setReaction(stored)
          }
        }
      }
    } catch (_) {}
  }, [storageKey])

  async function submit(type: 'thumbs_up' | 'thumbs_down' | 'question', msg?: string) {
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          type,
          message: msg || null,
          updateId,
          updateTitle,
        }),
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, type)
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  // ── Render: Submitted state ──
  if (submitted) {
    if (variant === 'inline') {
      return (
        <div className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit animate-fade-in font-sans">
          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Feedback received — thank you!</span>
          {reaction === 'thumbs_up' && <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">(Looking good 👍)</span>}
          {reaction === 'thumbs_down' && <span className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold">(Concerns shared ⚠️)</span>}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full max-w-xs mx-auto my-4 animate-fade-in font-sans">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        Feedback received — thank you!
      </div>
    )
  }

  // ── Render: Inline variant (Attached directly to each update card) ──
  if (variant === 'inline') {
    return (
      <div className="space-y-2.5 font-sans">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            How does this update look?
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setReaction('thumbs_up')
                submit('thumbs_up')
              }}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                reaction === 'thumbs_up'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Looking good
            </button>
            <button
              type="button"
              onClick={() => {
                setReaction('thumbs_down')
                submit('thumbs_down')
              }}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                reaction === 'thumbs_down'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5 text-amber-500" /> Have questions
            </button>
            <button
              type="button"
              onClick={() => setShowMessage(m => !m)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Note
            </button>
          </div>
        </div>

        {showMessage && (
          <div className="pt-2 animate-fade-in">
            <textarea
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
              placeholder={updateTitle ? `Share your thoughts on "${updateTitle}" with the team…` : 'Share your thoughts on this update with the team…'}
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setShowMessage(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!message.trim() || loading}
                onClick={() => submit('question', message)}
                className="px-3.5 py-1 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? 'Submitting…' : 'Submit Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render: Card variant (Sidebar) ──
  return (
    <div className="py-6 text-center font-sans">
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
        Client Sentiment Check
      </p>
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => { setReaction('thumbs_up'); submit('thumbs_up') }}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            reaction === 'thumbs_up'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Looking good
        </button>
        <button
          type="button"
          onClick={() => { setReaction('thumbs_down'); submit('thumbs_down') }}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
            reaction === 'thumbs_down'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Have questions
        </button>
        <button
          type="button"
          onClick={() => setShowMessage(m => !m)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Send note
        </button>
      </div>

      {showMessage && (
        <div className="mt-4 max-w-sm mx-auto text-left animate-fade-in">
          <textarea
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
            placeholder="Share private thoughts with the studio team…"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            type="button"
            disabled={!message.trim() || loading}
            onClick={() => submit('question', message)}
            className="mt-2 w-full py-2.5 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-50 shadow-xs cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Submitting…' : 'Submit Note'}
          </button>
        </div>
      )}
    </div>
  )
}
