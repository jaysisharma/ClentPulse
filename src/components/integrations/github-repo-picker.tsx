'use client'

import { useState, useEffect } from 'react'
import { GitBranch, ExternalLink, Loader2, Search, X, Star } from 'lucide-react'

interface Repo {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
  language: string | null
  updated_at: string
  open_issues_count: number
}

interface Props {
  onSelect: (repo: { externalId: string; externalUrl: string; name: string; metadata: Record<string, any> }) => Promise<void>
  onClose: () => void
}

export function GitHubRepoPicker({ onSelect, onClose }: Props) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/integrations/github/resources?type=repos')
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load repos')
        return r.json()
      })
      .then(data => {
        setRepos(data.repos ?? [])
        setFiltered(data.repos ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!query) { setFiltered(repos); return }
    const q = query.toLowerCase()
    setFiltered(repos.filter(r => r.full_name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)))
  }, [query, repos])

  const handleSelect = async (repo: Repo) => {
    setSelecting(repo.full_name)
    try {
      await onSelect({
        externalId: repo.full_name, // owner/name is the stable GitHub identifier
        externalUrl: repo.html_url,
        name: repo.full_name,
        metadata: {
          repoId: repo.id,
          language: repo.language,
          private: repo.private,
          openIssues: repo.open_issues_count,
        },
      })
    } finally {
      setSelecting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Select GitHub repository">
      <div className="bg-white dark:bg-[#0c0d12] rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Select GitHub Repository</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search repositories…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search repositories"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" aria-label="Loading repositories" />
            </div>
          ) : error ? (
            <p className="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">No repositories found.</p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map(repo => (
                <li key={repo.id}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 group">
                    <GitBranch className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{repo.full_name}</span>
                        {repo.private && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex-shrink-0">private</span>
                        )}
                        {repo.language && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{repo.language}</span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{repo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" aria-label="Open repository">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleSelect(repo)}
                        disabled={!!selecting}
                        className="text-xs font-medium px-2 py-1 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        aria-label={`Link ${repo.full_name}`}
                      >
                        {selecting === repo.full_name ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Link'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
