'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Folder, ExternalLink, Search, Loader2, ChevronRight, X } from 'lucide-react'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string | null
  modifiedTime: string | null
  thumbnailLink: string | null
}

interface DriveBreadcrumb {
  id: string | null
  name: string
}

interface Props {
  projectId: string
  integrationConnectionId: string
  onAttach: (resource: {
    externalId: string
    externalUrl: string | null
    name: string
    thumbnailUrl: string | null
    resourceType: 'file' | 'folder'
    metadata: Record<string, any>
  }) => Promise<void>
  onClose: () => void
}

export function DrivePicker({ projectId, integrationConnectionId, onAttach, onClose }: Props) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<DriveBreadcrumb[]>([{ id: null, name: 'My Drive' }])
  const [attaching, setAttaching] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id ?? undefined

  const fetchFiles = useCallback(async (parentId?: string, q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ type: 'drive' })
      if (parentId) params.set('parentId', parentId)
      if (q) params.set('q', q)
      const res = await fetch(`/api/integrations/google/resources?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load files')
      }
      const data = await res.json()
      setFiles(data.files ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles(currentFolderId ?? undefined, query || undefined)
  }, [fetchFiles, breadcrumbs]) // eslint-disable-line

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFiles(undefined, query || undefined) // search is global, not in folder
  }

  const navigateInto = (file: DriveFile) => {
    if (file.mimeType !== 'application/vnd.google-apps.folder') return
    setBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }])
  }

  const navigateTo = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1))
  }

  const handleAttach = async (file: DriveFile) => {
    setAttaching(file.id)
    try {
      await onAttach({
        externalId: file.id,
        externalUrl: file.webViewLink,
        name: file.name,
        thumbnailUrl: file.thumbnailLink,
        resourceType: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        metadata: { mimeType: file.mimeType, modifiedTime: file.modifiedTime },
      })
    } finally {
      setAttaching(null)
    }
  }

  const isFolder = (f: DriveFile) => f.mimeType === 'application/vnd.google-apps.folder'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Select Google Drive file">
      <div className="bg-white dark:bg-[#0c0d12] rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Add from Google Drive</h2>
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 mt-1" aria-label="Drive navigation">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                  <button
                    onClick={() => navigateTo(i)}
                    className={`text-xs ${i === breadcrumbs.length - 1 ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </nav>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-5 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search files…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search Drive files"
            />
          </div>
        </form>

        {/* File list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" aria-label="Loading files" />
            </div>
          ) : error ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button onClick={() => fetchFiles(currentFolderId ?? undefined)} className="text-xs text-slate-500 mt-2 underline">Retry</button>
            </div>
          ) : files.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">No files found.</p>
          ) : (
            <ul className="space-y-0.5">
              {files.map(file => (
                <li key={file.id}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 group">
                    <div className="flex-shrink-0 text-slate-400">
                      {isFolder(file) ? <Folder className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => isFolder(file) ? navigateInto(file) : handleAttach(file)}
                        className="text-sm text-slate-800 dark:text-slate-200 truncate text-left w-full hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {file.name}
                      </button>
                      {file.modifiedTime && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.webViewLink && (
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" aria-label="Open in Drive">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {!isFolder(file) && (
                        <button
                          onClick={() => handleAttach(file)}
                          disabled={!!attaching}
                          className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          aria-label={`Attach ${file.name}`}
                        >
                          {attaching === file.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Attach'}
                        </button>
                      )}
                      {isFolder(file) && (
                        <button
                          onClick={() => handleAttach(file)}
                          disabled={!!attaching}
                          className="text-xs font-medium px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          aria-label={`Attach folder ${file.name}`}
                        >
                          {attaching === file.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Attach folder'}
                        </button>
                      )}
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
