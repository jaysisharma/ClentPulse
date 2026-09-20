'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Folder, GitBranch, GitPullRequest, Image,
  ExternalLink, Loader2, Plus, Trash2, Eye, EyeOff,
  RefreshCw, PlugZap
} from 'lucide-react'
import Link from 'next/link'
import { DrivePicker } from './drive-picker'
import { GitHubRepoPicker } from './github-repo-picker'
import { FigmaFilePicker } from './figma-file-picker'

interface Resource {
  id: string
  provider: string
  resource_type: string
  external_id: string
  external_url: string | null
  name: string
  thumbnail_url: string | null
  show_in_portal: boolean
  metadata: Record<string, any>
  integration_connections?: { status: string; provider_account_email: string | null } | null
}

interface ConnectionStatus {
  connected: boolean
  status: string | null
  email: string | null
}

interface Props {
  projectId: string
}

const PROVIDER_LABELS: Record<string, string> = {
  google_drive: 'Google Drive',
  google_calendar: 'Google Calendar',
  github: 'GitHub',
  figma: 'Figma',
}

const PROVIDER_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  google_drive: Folder,
  google_calendar: FileText,
  github: GitBranch,
  figma: Image,
}

function ConnectPrompt({ label }: { provider: string; label: string }) {
  return (
    <Link
      href="/settings/integrations"
      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      <PlugZap className="w-3.5 h-3.5" />
      Connect {label} in settings
    </Link>
  )
}

export function ProjectResourcesPanel({ projectId }: Props) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [googleStatus, setGoogleStatus] = useState<ConnectionStatus | null>(null)
  const [githubStatus, setGithubStatus] = useState<ConnectionStatus | null>(null)
  const [figmaStatus, setFigmaStatus] = useState<ConnectionStatus | null>(null)

  const [activePicker, setActivePicker] = useState<'drive' | 'github' | 'figma' | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [res, g, gh, fig] = await Promise.all([
      fetch(`/api/project-resources?projectId=${projectId}`).then(r => r.ok ? r.json() : { resources: [] }),
      fetch('/api/integrations/google/status').then(r => r.ok ? r.json() : null),
      fetch('/api/integrations/github/status').then(r => r.ok ? r.json() : null),
      fetch('/api/integrations/figma/status').then(r => r.ok ? r.json() : null),
    ])
    setResources(res.resources ?? [])
    setGoogleStatus(g)
    setGithubStatus(gh)
    setFigmaStatus(fig)
    setLoading(false)
  }, [projectId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const attachResource = async (body: Omit<Parameters<typeof fetch>[1] & { body?: string }, 'method'> & Record<string, any>) => {
    setAddError(null)
    const res = await fetch('/api/project-resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...body }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to attach resource')
    }
    const created = await res.json()
    setResources(prev => [...prev, created])
    setActivePicker(null)
  }

  const togglePortal = async (r: Resource) => {
    setToggling(r.id)
    try {
      const res = await fetch(`/api/project-resources/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInPortal: !r.show_in_portal }),
      })
      if (res.ok) {
        setResources(prev => prev.map(x => x.id === r.id ? { ...x, show_in_portal: !x.show_in_portal } : x))
      }
    } finally {
      setToggling(null)
    }
  }

  const deleteResource = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/project-resources/${id}`, { method: 'DELETE' })
      setResources(prev => prev.filter(x => x.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const driveResources = resources.filter(r => r.provider === 'google_drive')
  const githubResources = resources.filter(r => r.provider === 'github')
  const figmaResources = resources.filter(r => r.provider === 'figma')

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" aria-label="Loading connected tools" />
        Loading connected tools…
      </div>
    )
  }

  return (
    <section aria-label="Connected tools">
      {addError && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-3" role="alert">{addError}</p>
      )}

      <div className="space-y-6">
        {/* Google Drive */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Google Drive
            </h3>
            {googleStatus?.connected ? (
              <button
                onClick={() => setActivePicker('drive')}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add from Drive
              </button>
            ) : (
              <ConnectPrompt provider="google" label="Google" />
            )}
          </div>
          {driveResources.length > 0 ? (
            <ResourceList resources={driveResources} onToggle={togglePortal} onDelete={deleteResource} toggling={toggling} deleting={deleting} />
          ) : googleStatus?.connected ? (
            <p className="text-xs text-slate-400 py-2">No Drive files attached. Click "Add from Drive" to select files.</p>
          ) : null}
        </div>

        {/* GitHub */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              GitHub
            </h3>
            {githubStatus?.connected ? (
              githubResources.length === 0 && (
                <button
                  onClick={() => setActivePicker('github')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Link repository
                </button>
              )
            ) : (
              <ConnectPrompt provider="github" label="GitHub" />
            )}
          </div>
          {githubResources.length > 0 ? (
            <ResourceList resources={githubResources} onToggle={togglePortal} onDelete={deleteResource} toggling={toggling} deleting={deleting} />
          ) : githubStatus?.connected ? (
            <p className="text-xs text-slate-400 py-2">No repository linked.</p>
          ) : null}
        </div>

        {/* Figma */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Figma
            </h3>
            {figmaStatus?.connected ? (
              figmaResources.length === 0 && (
                <button
                  onClick={() => setActivePicker('figma')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Select design file
                </button>
              )
            ) : (
              <ConnectPrompt provider="figma" label="Figma" />
            )}
          </div>
          {figmaResources.length > 0 ? (
            <ResourceList resources={figmaResources} onToggle={togglePortal} onDelete={deleteResource} toggling={toggling} deleting={deleting} />
          ) : figmaStatus?.connected ? (
            <p className="text-xs text-slate-400 py-2">No design file linked.</p>
          ) : null}
        </div>
      </div>

      {/* Pickers */}
      {activePicker === 'drive' && (
        <DrivePicker
          projectId={projectId}
          integrationConnectionId=""
          onAttach={async ({ externalId, externalUrl, name, thumbnailUrl, resourceType, metadata }) => {
            await attachResource({ provider: 'google_drive', resourceType, externalId, externalUrl, name, thumbnailUrl, metadata })
          }}
          onClose={() => setActivePicker(null)}
        />
      )}
      {activePicker === 'github' && (
        <GitHubRepoPicker
          onSelect={async ({ externalId, externalUrl, name, metadata }) => {
            await attachResource({ provider: 'github', resourceType: 'repo', externalId, externalUrl, name, metadata })
          }}
          onClose={() => setActivePicker(null)}
        />
      )}
      {activePicker === 'figma' && (
        <FigmaFilePicker
          onSelect={async ({ externalId, externalUrl, name, thumbnailUrl, metadata }) => {
            await attachResource({ provider: 'figma', resourceType: 'figma_file', externalId, externalUrl, name, thumbnailUrl, metadata })
          }}
          onClose={() => setActivePicker(null)}
        />
      )}
    </section>
  )
}

function ResourceList({
  resources,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: {
  resources: Resource[]
  onToggle: (r: Resource) => void
  onDelete: (id: string) => void
  toggling: string | null
  deleting: string | null
}) {
  return (
    <ul className="space-y-1.5">
      {resources.map(r => {
        const isDisconnected = r.integration_connections?.status === 'revoked' || r.integration_connections?.status === 'expired'
        const ProviderIcon = PROVIDER_ICON[r.provider] ?? FileText

        return (
          <li key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 group">
            <ProviderIcon className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{r.name}</span>
                {isDisconnected && (
                  <span className="text-[10px] text-yellow-600 dark:text-yellow-400 flex-shrink-0">connection unavailable</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {r.external_url && (
                <a
                  href={r.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label={`Open ${r.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => onToggle(r)}
                disabled={!!toggling}
                title={r.show_in_portal ? 'Hide from client portal' : 'Show in client portal'}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                aria-label={r.show_in_portal ? 'Hide from client portal' : 'Show in client portal'}
              >
                {toggling === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : r.show_in_portal ? <Eye className="w-3.5 h-3.5 text-indigo-500" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                disabled={!!deleting}
                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                aria-label={`Remove ${r.name}`}
              >
                {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
