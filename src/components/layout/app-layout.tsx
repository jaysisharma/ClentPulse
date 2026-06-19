'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Menu, X, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProjectMessages } from '@/components/project-messages'

export function AppLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user?: { name: string | null; plan: 'free' | 'pro' }
}) {
  const [open, setOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [userProfile, setUserProfile] = useState<{ name: string | null } | null>(null)

  // Fetch user profile name, active projects and count of unread client comments
  useEffect(() => {
    const supabase = createClient()

    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Load user profile
      const { data: profile } = await supabase.from('users').select('name').eq('id', authUser.id).single()
      if (profile) {
        setUserProfile({ name: profile.name ?? null })
      }

      // Load projects
      const { data: projs } = await supabase
        .from('projects')
        .select('id, project_name, client_name')
        .eq('user_id', authUser.id)

      if (projs) {
        setProjects(projs)
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id)
        }

        // Calculate unread counts
        const counts: Record<string, number> = {}
        for (const p of projs) {
          const lastRead = localStorage.getItem(`last_read_comment_at:${p.id}`) || '1970-01-01T00:00:00.000Z'
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', p.id)
            .eq('author_role', 'client')
            .gt('created_at', lastRead)
          counts[p.id] = count ?? 0
        }
        setUnreadCounts(counts)
      }
    }

    loadData()
  }, [])

  // Subscribe to comments live updates
  useEffect(() => {
    if (projects.length === 0) return
    const supabase = createClient()

    const channel = supabase
      .channel(`global-comments-freelancer-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload: any) => {
          const newComment = payload.new
          if (newComment.author_role === 'client') {
            const isForOurProject = projects.some(p => p.id === newComment.project_id)
            if (isForOurProject) {
              if (drawerOpen && selectedProjectId === newComment.project_id) {
                // Active reading -> reset/update immediately
                localStorage.setItem(`last_read_comment_at:${newComment.project_id}`, new Date().toISOString())
              } else {
                const lastRead = localStorage.getItem(`last_read_comment_at:${newComment.project_id}`) || '1970-01-01T00:00:00.000Z'
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projects, drawerOpen, selectedProjectId])

  // Mark selected project's messages as read when drawer is opened or project selected
  useEffect(() => {
    if (drawerOpen && selectedProjectId) {
      const nowStr = new Date().toISOString()
      localStorage.setItem(`last_read_comment_at:${selectedProjectId}`, nowStr)
      setUnreadCounts(prev => ({
        ...prev,
        [selectedProjectId]: 0
      }))
    }
  }, [drawerOpen, selectedProjectId])

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar wrapper — off-screen on mobile, always visible on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setOpen(false)} user={user} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 print:hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Frevio" className="w-7 h-7" />
          <span className="font-semibold text-slate-900 text-sm">Frevio</span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open messages"
        >
          <MessageSquare className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Floating Message Button for Desktop */}
      <div className="hidden lg:block fixed top-6 right-8 z-30">
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all hover:shadow-md flex items-center justify-center cursor-pointer"
          aria-label="Open messages"
        >
          <MessageSquare className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Floating Messages Drawer Overlay */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer container */}
          <aside className="fixed inset-y-0 right-0 z-50 w-[420px] max-w-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-900 text-lg">Messages</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 flex flex-col p-5">
              {projects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <MessageSquare className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm">No active projects to message.</p>
                </div>
              ) : (
                <>
                  {/* Selector for projects */}
                  <div className="mb-4 flex-shrink-0">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Select Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={e => setSelectedProjectId(e.target.value)}
                      className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.project_name} {unreadCounts[p.id] > 0 ? `(${unreadCounts[p.id]} unread)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Messages Thread list */}
                  <div className="flex-1 min-h-0">
                    {selectedProjectId && (
                      <ProjectMessages
                        key={selectedProjectId}
                        projectId={selectedProjectId}
                        viewerRole="owner"
                        viewerName={userProfile?.name || "Freelancer"}
                        className="h-full"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 p-6 lg:p-8 pt-20 lg:pt-8 print:ml-0 print:p-0">
        {children}
      </main>
    </div>
  )
}
