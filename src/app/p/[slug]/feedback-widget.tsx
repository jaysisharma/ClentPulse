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
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
        <Check className="w-4 h-4 text-emerald-500" />
        Thanks for your feedback!
      </div>
    )
  }

  return (
    <div className="py-6 text-center">
      <p className="text-sm text-slate-500 mb-4">How are things looking?</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => { setReaction('thumbs_up'); submit('thumbs_up') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${reaction === 'thumbs_up' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <ThumbsUp className="w-4 h-4" /> Looking good
        </button>
        <button
          onClick={() => { setReaction('thumbs_down'); submit('thumbs_down') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${reaction === 'thumbs_down' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <ThumbsDown className="w-4 h-4" /> Have concerns
        </button>
        <button
          onClick={() => setShowMessage(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <MessageSquare className="w-4 h-4" /> Leave a message
        </button>
      </div>

      {showMessage && (
        <div className="mt-4 max-w-sm mx-auto">
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
            placeholder="Your message to the team…"
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            disabled={!message.trim() || loading}
            onClick={() => submit('question', message)}
            className="mt-2 w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Sending…' : 'Send message'}
          </button>
        </div>
      )}
    </div>
  )
}
