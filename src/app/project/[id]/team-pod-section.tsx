'use client'

import { useState, useEffect } from 'react'
import { ProjectTeamMember, OrganizationMember } from '@/types'
import { Users, Plus, Trash2, Shield, Loader2, Sparkles, Code2 } from 'lucide-react'

interface TeamPodSectionProps {
  projectId: string
  orgId?: string | null
  initialTeamMembers: ProjectTeamMember[]
  canManage: boolean
}

export function TeamPodSection({
  projectId,
  orgId,
  initialTeamMembers,
  canManage,
}: TeamPodSectionProps) {
  const [teamMembers, setTeamMembers] = useState<ProjectTeamMember[]>(initialTeamMembers)
  const [availableOrgMembers, setAvailableOrgMembers] = useState<OrganizationMember[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    setCurrentTime(Date.now())
  }, [])

  useEffect(() => {
    if (showAddModal && orgId && availableOrgMembers.length === 0) {
      setLoadingMembers(true)
      fetch(`/api/organizations/${orgId}`)
        .then(res => res.json())
        .then(data => {
          if (data.members) {
            setAvailableOrgMembers(data.members)
            if (data.members.length > 0) {
              // Default to first member not already assigned
              const unassigned = data.members.find(
                (m: OrganizationMember) => !teamMembers.some(tm => tm.user_id === m.user_id)
              )
              if (unassigned) setSelectedUserId(unassigned.user_id)
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingMembers(false))
    }
  }, [showAddModal, orgId, availableOrgMembers.length, teamMembers])

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId) return
    setSaving(true)

    try {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          roleTitle: roleTitle || 'Team Specialist',
        }),
      })

      const data = await res.json()
      if (res.ok && data.member) {
        setTeamMembers(prev => {
          const filtered = prev.filter(m => m.user_id !== selectedUserId)
          return [...filtered, data.member]
        })
        setShowAddModal(false)
        setRoleTitle('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleUnassign(userId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/team?userId=${userId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTeamMembers(prev => prev.filter(m => m.user_id !== userId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Project Team Pod ({teamMembers.length})
            </h3>
          </div>
        </div>

        {canManage && orgId && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>Assign Colleague</span>
          </button>
        )}
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-xs text-slate-400 dark:text-slate-500 font-light italic py-2">
          No specialists assigned to this project pod yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {teamMembers.map(tm => {
            const isLive = Boolean(
              currentTime &&
              tm.user?.last_heartbeat_at &&
              (currentTime - new Date(tm.user.last_heartbeat_at).getTime() < 15 * 60 * 1000)
            )

            return (
              <div key={tm.id} className="py-2.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center uppercase flex-shrink-0">
                      {tm.user?.name?.[0] || tm.user?.email?.[0] || 'U'}
                    </div>
                    {isLive && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c0d12] animate-pulse"
                        title="Active in VS Code right now"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{tm.user?.name || 'Specialist'}</span>
                      {isLive && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-normal">
                          · live
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                      {tm.role_title}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleUnassign(tm.user_id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 transition-all flex-shrink-0"
                    title="Remove from project pod"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Assign Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl ring-1 ring-slate-950/5 dark:ring-white/5 animate-scale-up">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Assign to Project Pod
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-4">
              Add a team specialist and designate their delivery title.
            </p>

            <form onSubmit={handleAssign} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Team Member
                </label>
                {loadingMembers ? (
                  <div className="text-xs text-slate-400 py-2">Loading members…</div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {availableOrgMembers.map(m => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.user?.name || m.user?.email} ({m.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Role Title on this Project
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Full-Stack Engineer"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Role Presets */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {['Tech Lead', 'UI/UX Designer', 'Frontend Dev', 'QA Lead'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRoleTitle(preset)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedUserId}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Assign to Pod</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
