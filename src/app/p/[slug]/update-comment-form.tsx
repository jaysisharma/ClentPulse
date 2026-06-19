'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Comment {
  id: string
  author_name: string
  body: string
  created_at: string
}

export function UpdateCommentForm({
  updateId,
  projectId,
  accentColor,
  existingComments,
  defaultAuthorName,
}: {
  updateId: string
  projectId: string
  accentColor: string
  existingComments: Comment[]
  defaultAuthorName?: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultAuthorName || '')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [comments, setComments] = useState<Comment[]>(existingComments)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !body.trim()) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/update-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updateId, projectId, authorName: name, body }),
    })

    if (res.ok) {
      setComments(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          author_name: name.trim(),
          body: body.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      setBody('')
      setSubmitted(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setSubmitted(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
    }
    setSubmitting(false)
  }

  const totalCount = comments.length

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {/* Toggle trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {totalCount > 0 ? `${totalCount} comment${totalCount !== 1 ? 's' : ''}` : 'Leave a comment'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Existing comments */}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {c.author_name[0].toUpperCase()}
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-700">{c.author_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}

          {/* Comment form */}
          {submitted ? (
            <p className="text-xs text-emerald-600 font-medium py-1">
              ✓ Comment posted — thanks for the feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={60}
              />
              <div className="flex gap-2">
                <textarea
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors resize-none"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                  placeholder="Add a comment on this update…"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={2}
                  required
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !body.trim()}
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40 self-end"
                  style={{ backgroundColor: accentColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
