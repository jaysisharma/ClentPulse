'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import {
  Building2, User, ChevronDown, Plus, Check, Settings,
  Users, Sparkles, Loader2, Shield
} from 'lucide-react'
import { Workspace } from '@/types'
import { ACTIVE_WORKSPACE_COOKIE, setActiveWorkspaceCookie, formatWorkspaces } from '@/lib/workspace'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface WorkspaceSwitcherProps {
  onWorkspaceChange?: (workspace: Workspace) => void
}

export function WorkspaceSwitcher({ onWorkspaceChange }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: 'personal', type: 'personal', name: 'Personal Studio' },
  ])
  const [activeId, setActiveId] = useState<string>('personal')
  const [loading, setLoading] = useState(true)

  // Create Agency Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAgencyName, setNewAgencyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Read active workspace from cookie
    let cookieVal: string | null = null
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${ACTIVE_WORKSPACE_COOKIE}=`))
      if (match) {
        cookieVal = decodeURIComponent(match.split('=')[1])
        if (cookieVal) setActiveId(cookieVal)
      }
    }

    // Fetch user organizations from API
    async function load() {
      try {
        const res = await fetch('/api/organizations')
        if (res.ok) {
          const data = await res.json()
          const supabase = createClient()
          const { data: userData } = await supabase.auth.getUser()
          const userName = userData.user?.user_metadata?.name || null
          const formatted = formatWorkspaces(data.memberships || [], userName)
          setWorkspaces(formatted)

          // Check if URL query has ?agency=true or if user belongs to an agency
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const firstAgency = formatted.find(w => w.type === 'agency')
            if (urlParams.get('agency') === 'true' && firstAgency) {
              setActiveId(firstAgency.id)
              setActiveWorkspaceCookie(firstAgency.id)
              return
            } else if (urlParams.get('freelancer') === 'true') {
              setActiveId('personal')
              setActiveWorkspaceCookie('personal')
              return
            }
          }

          // If activeId is not found in workspaces, reset to personal
          if (activeId !== 'personal' && !formatted.some(w => w.id === activeId)) {
            setActiveId('personal')
            setActiveWorkspaceCookie('personal')
          }
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const activeWorkspace = workspaces.find(w => w.id === activeId) || workspaces[0]

  useEffect(() => {
    if (activeWorkspace && onWorkspaceChange) {
      onWorkspaceChange(activeWorkspace)
    }
  }, [activeWorkspace, onWorkspaceChange])

  function handleSelect(workspace: Workspace) {
    setActiveId(workspace.id)
    setActiveWorkspaceCookie(workspace.id)
    setOpen(false)
    onWorkspaceChange?.(workspace)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('workspace-changed', { detail: workspace }))
    }
    router.refresh()
  }

  async function handleCreateAgency(e: React.FormEvent) {
    e.preventDefault()
    if (!newAgencyName.trim()) return

    setCreating(true)
    setCreateError('')

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgencyName.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      const newOrg = data.organization
      const newWorkspace: Workspace = {
        id: newOrg.id,
        type: 'agency',
        name: newOrg.name,
        slug: newOrg.slug,
        role: 'owner',
        accent_color: newOrg.accent_color,
      }

      setWorkspaces(prev => [...prev, newWorkspace])
      setActiveId(newOrg.id)
      setActiveWorkspaceCookie(newOrg.id)
      onWorkspaceChange?.(newWorkspace)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('workspace-changed', { detail: newWorkspace }))
      }
      setShowCreateModal(false)
      setNewAgencyName('')
      setOpen(false)
      router.refresh()
      router.push('/dashboard?agency=true')
    } catch (err: any) {
      setCreateError(err.message || 'Error creating organization')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <div className="relative px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.04] hover:bg-slate-100/80 dark:hover:bg-white/[0.08] transition-all text-left shadow-xs group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
              activeWorkspace.type === 'agency'
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
            }`}>
              {activeWorkspace.type === 'agency' ? (
                <Building2 className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {activeWorkspace.name}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5 capitalize">
                <span>{activeWorkspace.type === 'agency' ? 'Agency Workspace' : 'Solo Studio'}</span>
                {activeWorkspace.role && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">· {activeWorkspace.role}</span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-3 right-3 top-full mt-1.5 z-50 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl ring-1 ring-slate-950/5 dark:ring-white/5 py-2 animate-fade-in backdrop-blur-md">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                Workspaces
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 px-1.5 py-1">
                {workspaces.map(w => {
                  const selected = w.id === activeId
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelect(w)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                        selected
                          ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {w.type === 'agency' ? (
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{w.name}</span>
                      </div>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-1.5 mt-1 px-1.5 space-y-0.5">
                {activeWorkspace.type === 'agency' && (
                  <Link
                    href="/settings/team"
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Team & Seats</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                    setShowCreateModal(true)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Agency</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Agency Modal */}
      {showCreateModal && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
        >
          <div className="bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-950/5 dark:ring-white/5 animate-scale-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Create Agency Workspace
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  Add team members, project managers, and deliver multi-client portals.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Agency / Studio Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Apex Digital Studio"
                  value={newAgencyName}
                  onChange={e => setNewAgencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {createError && (
                <div className="text-xs text-rose-500 font-medium">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <span>Create Workspace</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
