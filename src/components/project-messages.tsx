'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Comment = {
  id: string
  body: string
  author_name: string
  author_role: 'owner' | 'client'
  created_at: string
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function timeLabel(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// Two-way thread shared by the freelancer's project page and the client portal.
// Reads/writes go straight through Supabase — RLS scopes rows to the project's
// owner and client (see the comments policies in supabase-migration.sql).
export function ProjectMessages({
  projectId,
  viewerRole,
  viewerName,
  className,
}: {
  projectId: string
  viewerRole: 'owner' | 'client'
  viewerName: string
  className?: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialScrolled, setInitialScrolled] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 20

  const load = useCallback(async () => {
    setLoading(true)
    setInitialScrolled(false)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .select('id, body, author_name, author_role, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (!error && data) {
      const reversed = [...data].reverse()
      setComments(reversed)
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!loading && comments.length > 0 && !initialScrolled) {
      endRef.current?.scrollIntoView({ behavior: 'auto' })
      setInitialScrolled(true)
    }
  }, [loading, comments, initialScrolled])

  const loadMore = async () => {
    if (loadingMore || !hasMore || comments.length === 0) return
    setLoadingMore(true)
    const supabase = createClient()
    const oldestCreatedAt = comments[0].created_at

    const { data, error } = await supabase
      .from('comments')
      .select('id, body, author_name, author_role, created_at')
      .eq('project_id', projectId)
      .lt('created_at', oldestCreatedAt)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (!error && data) {
      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }
      const reversed = [...data].reverse()
      setComments(prev => [...reversed, ...prev])
    }
    setLoadingMore(false)
  }

  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastBroadcastRef = useRef<number>(0)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Live updates: append messages from the other participant as they arrive.
  // Also receive Realtime broadcast typing indicator from the counterpart.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments:${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` },
        (payload: { new: Comment }) => {
          const c = payload.new
          setComments(prev => (prev.some(x => x.id === c.id) ? prev : [...prev, c]))
          setTypingUser(null)
          requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
        },
      )
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: { role: string; name: string } }) => {
        if (payload.role !== viewerRole) {
          setTypingUser(payload.name)
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      supabase.removeChannel(channel)
    }
  }, [projectId, viewerRole])

  const handleTyping = (text: string) => {
    setBody(text)
    const now = Date.now()
    if (text.trim() && now - lastBroadcastRef.current > 2000) {
      lastBroadcastRef.current = now
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { role: viewerRole, name: viewerName },
      })
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Your session expired — please sign in again.'); setSending(false); return }

    const { data, error } = await supabase
      .from('comments')
      .insert({ project_id: projectId, user_id: user.id, body: text, author_role: viewerRole, author_name: viewerName })
      .select('id, body, author_name, author_role, created_at')
      .single()

    setSending(false)
    if (error || !data) { setError('Could not send your message. Please try again.'); return }
    setComments(prev => [...prev, data])
    setBody('')
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Thread */}
      <div className={cn('space-y-4 overflow-y-auto pr-1', className ? 'flex-1' : 'max-h-80')}>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No messages yet. Say hello or ask a question — it goes straight to {viewerRole === 'client' ? 'your freelancer' : 'your client'}.
          </p>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center pb-2">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent dark:border-white/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingMore && <Loader2 className="w-3 h-3 animate-spin" />}
                  {loadingMore ? 'Loading older messages...' : 'Load older messages'}
                </button>
              </div>
            )}
            {comments.map(c => {
              const mine = c.author_role === viewerRole
              return (
                <div key={c.id} className={cn('flex items-end gap-2.5', mine ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                      c.author_role === 'owner'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
                    )}
                  >
                    {initials(c.author_name)}
                  </div>
                  <div className={cn('min-w-0 max-w-[75%]', mine ? 'items-end text-right' : 'items-start')}>
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words text-left',
                        mine
                          ? 'bg-indigo-600 text-white rounded-br-md shadow-2xs'
                          : 'bg-slate-100 dark:bg-[#12131a] border border-transparent dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-2xs',
                      )}
                    >
                      {c.body}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                      {mine ? 'You' : c.author_name} · {timeLabel(c.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic px-2 pt-2 animate-fade-in">
          <span className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <span>{typingUser} is typing…</span>
        </div>
      )}

      {/* Composer */}
      <form onSubmit={send} className="mt-3 flex items-end gap-2 border-t border-slate-100 dark:border-white/10 pt-3">
        <textarea
          value={body}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e) }}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-[#0c0d12] transition-colors"
        />
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
