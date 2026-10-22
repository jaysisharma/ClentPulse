'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Trash2, Inbox } from 'lucide-react'
import { formatFileSize } from '@/lib/app-builds'
import { formatDate } from '@/lib/utils'
import type { ClientFile } from '@/lib/client-files-shared'

interface ClientFilesSectionProps {
  projectId: string
  canManage?: boolean
}

export function ClientFilesSection({ projectId, canManage = true }: ClientFilesSectionProps) {
  const [files, setFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/client-files?projectId=${encodeURIComponent(projectId)}`)
      .then(res => (res.ok ? res.json() : { files: [] }))
      .then(data => setFiles(data.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleDelete(file: ClientFile) {
    if (!confirm(`Delete "${file.file_name}"? Your client will no longer see it.`)) return
    setDeletingId(file.id)
    const res = await fetch(`/api/client-files/${file.id}`, { method: 'DELETE' })
    if (res.ok) setFiles(prev => prev.filter(f => f.id !== file.id))
    setDeletingId(null)
  }

  if (loading) {
    return <div className="text-xs text-slate-500 py-2">Loading files…</div>
  }

  if (files.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-4 text-xs text-slate-500 dark:text-slate-400">
        <Inbox className="w-4 h-4 flex-shrink-0 mt-px" />
        <span>
          No files yet. Clients can upload logos, copy and documents from the Files tab of their portal.
          Mark the project as waiting on client and their portal will show an upload button.
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden">
      {files.map(file => (
        <div key={file.id} className="p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 dark:text-white truncate block">{file.file_name}</span>
              <span className="text-[10px] text-slate-500">
                {[formatFileSize(file.size_bytes), `Uploaded ${formatDate(file.created_at)}`].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {file.download_url && (
              <a
                href={file.download_url}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                aria-label={`Download ${file.file_name}`}
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            {canManage && (
              <button
                onClick={() => handleDelete(file)}
                disabled={deletingId === file.id}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label={`Delete ${file.file_name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
