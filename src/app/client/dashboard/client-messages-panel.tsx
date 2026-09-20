'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { ProjectMessages } from '@/components/project-messages'
import { createClient } from '@/lib/supabase/client'

type PanelProject = { id: string; project_name: string; client_name: string }

// Floating messages panel for the client portal. Opens in a right-aligned sliding drawer overlay.
export function ClientMessagesPanel({ projects }: { projects: PanelProject[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '')
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // Fetch initial unread counts for client (comments where author_role = 'owner')
  useEffect(() => {
    const supabase = createClient()
    async function fetchUnread() {
      const counts: Record<string, number> = {}
      for (const p of projects) {
        const lastRead = localStorage.getItem(`last_read_comment_at_client:${p.id}`) || '1970-01-01T00:00:00.000Z'
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', p.id)
          .eq('author_role', 'owner')
          .gt('created_at', lastRead)
        counts[p.id] = count ?? 0
      }
      setUnreadCounts(counts)
    }
    fetchUnread()
  }, [projects])

  // Live updates: Subscribe to comments
  useEffect(() => {
    if (projects.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel(`global-comments-client-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload: any) => {
          const newComment = payload.new
          if (newComment.author_role === 'owner') {
            const isForOurProject = projects.some(p => p.id === newComment.project_id)
            if (isForOurProject) {
              if (drawerOpen && selectedId === newComment.project_id) {
                localStorage.setItem(`last_read_comment_at_client:${newComment.project_id}`, new Date().toISOString())
              } else {
                const lastRead = localStorage.getItem(`last_read_comment_at_client:${newComment.project_id}`) || '1970-01-01T00:00:00.000Z'
                if (newComment.created_at > lastRead) {
                  setUnreadCounts(prev => ({
                    ...prev,
                    [newComment.project_id]: (prev[newComment.project_id] ?? 0) + 1
                  }))
                }
              }
            }
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projects, drawerOpen, selectedId])

  // Mark messages as read when drawer is opened or project is selected
  useEffect(() => {
    if (drawerOpen && selectedId) {
      localStorage.setItem(`last_read_comment_at_client:${selectedId}`, new Date().toISOString())
      setUnreadCounts(prev => ({
        ...prev,
        [selectedId]: 0
      }))
    }
  }, [drawerOpen, selectedId])

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
  const selected = projects.find(p => p.id === selectedId) ?? projects[0]

  if (!selected) return null

  return (
    <>
      {/* Message Button inside Header */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10"
        aria-label="Open messages"
      >
        <MessageSquare className="w-4 h-4" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#08090a] animate-pulse">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Floating Drawer Overlay */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="fixed inset-y-0 right-0 z-50 w-[420px] max-w-full bg-white dark:bg-[#0c0d12] shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 animate-slide-in text-left">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-900 dark:text-white text-base">Studio Messages</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 flex flex-col p-5">
              {/* Selector for projects */}
              {projects.length > 1 && (
                <div className="mb-4 flex-shrink-0">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Select Project Channel
                  </label>
                  <select
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 bg-slate-50/60 dark:bg-white/[0.03] focus:outline-none focus:border-slate-400 dark:focus:border-white/30 cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-[#0c0d12] text-slate-900 dark:text-white">
                        {p.project_name} {unreadCounts[p.id] > 0 ? `(${unreadCounts[p.id]} unread)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Messages Thread List */}
              <div className="flex-1 min-h-0">
                <ProjectMessages
                  key={selected.id}
                  projectId={selected.id}
                  viewerRole="client"
                  viewerName={selected.client_name}
                  className="h-full"
                />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
