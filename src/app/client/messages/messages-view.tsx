'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectMessages } from '@/components/project-messages'
import type { WorkspaceStudio } from '@/lib/client-workspace'
import { useClientUnread } from '../use-client-unread'
import { MUTED, RULE, StudioDot } from '../client-ui'

export interface Thread {
  id: string
  name: string
  clientName: string
  studio: WorkspaceStudio
  finished: boolean
}

const READ_KEY = (id: string) => `last_read_comment_at_client:${id}`

export function MessagesView({
  threads,
  selectedId,
  explicit,
  showStudio,
}: {
  threads: Thread[]
  selectedId: string | null
  /** True when the URL picked a conversation; on phones that shows the thread instead of the list. */
  explicit: boolean
  showStudio: boolean
}) {
  const { counts, markRead } = useClientUnread(threads.map(t => t.id))
  const selected = threads.find(t => t.id === selectedId) ?? null

  // Opening a conversation counts as reading it
  useEffect(() => {
    if (!selectedId) return
    try {
      localStorage.setItem(READ_KEY(selectedId), new Date().toISOString())
    } catch {}
  }, [selectedId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
      <nav aria-label="Conversations" className={cn(explicit && 'hidden sm:block')}>
        <h2 className="mb-1.5 text-[13px] font-semibold text-[#5A5F6B] dark:text-slate-400">Conversations</h2>
        <ul className={cn('border-b', RULE)}>
          {threads.map(t => {
            const unread = t.id === selectedId ? 0 : counts[t.id] ?? 0
            const active = t.id === selectedId
            return (
              <li key={t.id} className={cn('border-t', RULE)}>
                <Link
                  href={`/client/messages?project=${t.id}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => markRead(t.id)}
                  className={cn(
                    'flex items-center gap-3 min-h-[60px] py-2 px-2 -mx-2 rounded-md',
                    active ? 'bg-white dark:bg-white/[0.06]' : 'hover:bg-white/60 dark:hover:bg-white/[0.03]'
                  )}
                >
                  <StudioDot studio={t.studio} />
                  <span className="flex-1 min-w-0">
                    <span className={cn('block text-[15px] truncate', unread > 0 || active ? 'font-semibold' : 'font-medium')}>{t.name}</span>
                    <span className={cn('block text-[13px] truncate', MUTED)}>
                      {showStudio ? t.studio.name : t.finished ? 'Finished' : 'Active'}
                    </span>
                  </span>
                  {unread > 0 && (
                    <span className="min-w-[20px] px-1.5 rounded-full bg-[#111318] dark:bg-white text-white dark:text-[#111318] text-[11px] font-bold leading-5 text-center tabular-nums">
                      {unread}<span className="sr-only"> unread</span>
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <section aria-label={selected ? `Messages with ${selected.studio.name}` : 'Messages'} className={cn(!explicit && 'hidden sm:block')}>
        {selected ? (
          <>
            <Link href="/client/messages" className={cn('sm:hidden mb-3 inline-flex items-center gap-1 min-h-9 text-sm font-medium', MUTED)}>
              <ChevronLeft className="w-4 h-4" /> All conversations
            </Link>
            <div className="mb-3">
              <h2 className="text-lg font-bold break-words">{selected.name}</h2>
              <p className={cn('text-sm', MUTED)}>With {selected.studio.name}</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-[#12141c] dark:border dark:border-white/[0.08] overflow-hidden">
              <ProjectMessages key={selected.id} projectId={selected.id} viewerRole="client" viewerName={selected.clientName || 'Client'} />
            </div>
          </>
        ) : (
          <p className={cn('text-[15px]', MUTED)}>Pick a conversation.</p>
        )}
      </section>
    </div>
  )
}
