'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react'

interface Comment {
  id: string
  author_name: string
  body: string
  is_internal?: boolean
  created_at: string
}

export function UpdateCommentForm({
  updateId,
  projectId,
  accentColor,
  existingComments,
  defaultAuthorName,
  allowInternal = false,
}: {
  updateId: string
  projectId: string
  accentColor: string
  existingComments: Comment[]
  defaultAuthorName?: string
  allowInternal?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(defaultAuthorName || '')
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
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
      body: JSON.stringify({ updateId, projectId, authorName: name, body, isInternal: allowInternal ? isInternal : false }),
    })

    if (res.ok) {
      setComments(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          author_name: name.trim(),
          body: body.trim(),
          is_internal: allowInternal ? isInternal : false,
          created_at: new Date().toISOString(),
        },
      ])
      setBody('')
      setIsInternal(false)
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
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
      {/* Toggle trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {totalCount > 0 ? `${totalCount} discussion${totalCount !== 1 ? 's' : ''}` : 'Leave a comment'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Existing comments */}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-xs ring-1 ring-white/20"
                style={{ backgroundColor: accentColor }}
              >
                {c.author_name[0].toUpperCase()}
              </div>
              <div className="bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 rounded-2xl px-3.5 py-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.author_name}</span>
                  {c.is_internal && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                      🔒 Internal Note
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}

          {/* Comment form */}
          {submitted ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
              ✓ Comment posted — thanks for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                maxLength={60}
              />
              <div className="flex gap-2">
                <textarea
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors resize-none"
                  placeholder="Add a comment or note..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={2}
                  required
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !body.trim()}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-40 self-end shadow-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {allowInternal && (
                <div className="flex items-center px-1">
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      className="rounded border-slate-300 dark:border-white/20 text-amber-600 focus:ring-amber-500"
                    />
                    <span>🔒 Mark as Internal Note (Hidden from client)</span>
                  </label>
                </div>
              )}
              {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
