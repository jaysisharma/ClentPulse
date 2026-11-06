'use client'

import { useState, useEffect } from 'react'
import {
  Key, Database, Lock, Shield, Terminal, Plus, Eye, EyeOff,
  Copy, Check, Trash2, Loader2, ShieldCheck, AlertCircle, Sparkles
} from 'lucide-react'

interface SecretItem {
  id: string
  project_id: string
  title: string
  category: 'api_key' | 'credentials' | 'tokens' | 'database' | 'other'
  notes?: string | null
  created_by?: string
  last_revealed_at?: string | null
  reveal_count?: number
  created_at: string
  maskedValue: string
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  api_key:     { label: 'API Key', icon: Key, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  database:    { label: 'Database', icon: Database, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  credentials: { label: 'Credentials', icon: Lock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  tokens:      { label: 'Token', icon: Shield, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  other:       { label: 'Secret', icon: Terminal, color: 'text-slate-400 bg-white/5 border-white/10' },
}

export function ProjectSecretsVault({ projectId }: { projectId: string }) {
  const [secrets, setSecrets] = useState<SecretItem[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({})
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Add form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'api_key' | 'credentials' | 'tokens' | 'database' | 'other'>('api_key')
  const [secretValue, setSecretValue] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchSecrets()
  }, [projectId])

  async function fetchSecrets() {
    try {
      setLoading(true)
      const res = await fetch(`/api/projects/${projectId}/secrets`)
      if (res.ok) {
        const data = await res.json()
        setSecrets(data.secrets || [])
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleReveal(secretId: string) {
    if (revealedSecrets[secretId]) {
      // Toggle hide
      const next = { ...revealedSecrets }
      delete next[secretId]
      setRevealedSecrets(next)
      return
    }

    try {
      setRevealingId(secretId)
      const res = await fetch(`/api/projects/${projectId}/secrets/${secretId}/reveal`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setRevealedSecrets(prev => ({ ...prev, [secretId]: data.secretValue }))
      }
    } catch {
      // Ignore
    } finally {
      setRevealingId(null)
    }
  }

  function handleCopy(secretId: string, val: string) {
    navigator.clipboard.writeText(val)
    setCopiedId(secretId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(secretId: string) {
    if (!confirm('Are you sure you want to permanently delete this secret?')) return
    try {
      const res = await fetch(`/api/projects/${projectId}/secrets/${secretId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSecrets(prev => prev.filter(s => s.id !== secretId))
        const next = { ...revealedSecrets }
        delete next[secretId]
        setRevealedSecrets(next)
      }
    } catch {
      // Ignore
    }
  }

  async function handleAddSecret(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !secretValue.trim()) {
      setErrorMsg('Please enter both a title and secret value.')
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)
      const res = await fetch(`/api/projects/${projectId}/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          secretValue,
          notes,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setErrorMsg(err.error || 'Failed to save secret')
        return
      }

      const data = await res.json()
      setSecrets(prev => [data.secret, ...prev])
      setShowAddModal(false)
      setTitle('')
      setSecretValue('')
      setNotes('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c] overflow-hidden shadow-xs dark:shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#f1f3f7] dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Credential Locker</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                AES-256-GCM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely store and share API keys, staging logins, and environment variables.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Secret</span>
        </button>
      </div>

      {/* Secret items list */}
      <div className="divide-y divide-[#f1f3f7] dark:divide-white/[0.05]">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading encrypted vault...</span>
          </div>
        ) : secrets.length === 0 ? (
          <div className="p-8 text-center">
            <Lock className="w-6 h-6 text-slate-400 mx-auto opacity-40 mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No secrets stored in this project</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Add Stripe keys, staging access, or database URLs with authenticated encryption.
            </p>
          </div>
        ) : (
          secrets.map(secret => {
            const config = CATEGORY_CONFIG[secret.category] || CATEGORY_CONFIG.other
            const Icon = config.icon
            const isRevealed = Boolean(revealedSecrets[secret.id])
            const secretVal = revealedSecrets[secret.id] || secret.maskedValue

            return (
              <div key={secret.id} className="p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${config.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {secret.title}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                        {config.label}
                      </span>
                      {secret.created_by === 'client' && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Provided by Client
                        </span>
                      )}
                    </div>
                    {secret.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                        {secret.notes}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded select-all ${isRevealed ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                        {secretVal}
                      </span>
                      {secret.last_revealed_at && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          Revealed {new Date(secret.last_revealed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={revealingId === secret.id}
                    onClick={() => handleReveal(secret.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {revealingId === secret.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isRevealed ? (
                      <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5" /> Reveal</>
                    )}
                  </button>

                  {isRevealed && (
                    <button
                      type="button"
                      onClick={() => handleCopy(secret.id, revealedSecrets[secret.id])}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      {copiedId === secret.id ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy</>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(secret.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete Secret"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Encrypted Secret</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddSecret} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secret Title</label>
                <input
                  type="text"
                  placeholder="e.g., Stripe Live Secret Key, Staging Admin Login"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="api_key">API Key</option>
                  <option value="database">Database Connection</option>
                  <option value="credentials">Login Credentials / Passwords</option>
                  <option value="tokens">Access Token / SSH Key</option>
                  <option value="other">Other Secret</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Secret Value</label>
                <textarea
                  rows={3}
                  placeholder="API key, token, password, or connection string"
                  value={secretValue}
                  onChange={e => setSecretValue(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Internal Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Belongs to client's AWS eu-central account"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-accent hover:bg-accent-hover px-4 py-1.5 rounded-md text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Encrypted</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

