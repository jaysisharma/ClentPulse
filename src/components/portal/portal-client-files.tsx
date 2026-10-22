'use client'

import { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileText, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatFileSize } from '@/lib/app-builds'
import { formatDate } from '@/lib/utils'
import { CLIENT_FILES_BUCKET, MAX_CLIENT_FILE_BYTES, type ClientFile } from '@/lib/client-files-shared'

interface PortalClientFilesProps {
  slug: string
  accentColor: string
  /** Demo portal: keep uploads in memory instead of hitting the API. */
  isDemo?: boolean
}

export function PortalClientFiles({ slug, accentColor, isDemo = false }: PortalClientFilesProps) {
  const [files, setFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(!isDemo)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justUploaded, setJustUploaded] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isDemo) return
    fetch(`/api/client-files?slug=${encodeURIComponent(slug)}`)
      .then(res => (res.ok ? res.json() : { files: [] }))
      .then(data => setFiles(data.files ?? []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false))
  }, [slug, isDemo])

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setError(null)
    setJustUploaded(0)

    const selected = Array.from(list).slice(0, 20)
    const tooBig = selected.find(f => f.size > MAX_CLIENT_FILE_BYTES)
    if (tooBig) {
      setError(`"${tooBig.name}" is larger than 50 MB.`)
      return
    }

    if (isDemo) {
      const now = new Date().toISOString()
      setFiles(prev => [
        ...selected.map(f => ({
          id: `demo-${f.name}-${now}`,
          project_id: 'demo',
          file_name: f.name,
          storage_path: '',
          size_bytes: f.size,
          content_type: f.type,
          uploaded_by: 'client' as const,
          created_at: now,
          download_url: null,
        })),
        ...prev,
      ])
      setJustUploaded(selected.length)
      return
    }

    const supabase = createClient()
    const uploaded: { path: string; fileName: string }[] = []

    try {
      for (const file of selected) {
        setUploading(file.name)
        const res = await fetch('/api/client-files/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, fileName: file.name, size: file.size }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')

        const { error: uploadError } = await supabase.storage
          .from(CLIENT_FILES_BUCKET)
          .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type || undefined })
        if (uploadError) throw new Error(`Could not upload "${file.name}". Please try again.`)

        uploaded.push({ path: data.path, fileName: file.name })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }

    if (uploaded.length > 0) {
      setUploading('Finishing up…')
      const res = await fetch('/api/client-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, files: uploaded }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setFiles(prev => [...(data.files ?? []), ...prev])
        setJustUploaded(uploaded.length)
      } else {
        setError(data.error || 'Upload failed')
      }
    }

    setUploading(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div id="client-uploads" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white">Send files to your team</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Logos, copy, photos, documents. Up to 50 MB each.</p>
        </div>
      </div>

      <label
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-dashed transition-colors text-center ${
          uploading ? 'border-white/10 bg-white/[0.02] cursor-wait' : 'border-white/15 bg-[#0f111a] hover:bg-white/[0.03] cursor-pointer'
        }`}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          if (!uploading) handleFiles(e.dataTransfer.files)
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: accentColor }} />
            <span className="text-xs text-slate-300 truncate max-w-full">Uploading {uploading}</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6" style={{ color: accentColor }} />
            <span className="text-xs font-semibold text-white">Click to upload or drag files here</span>
            <span className="text-[11px] text-slate-500">Your team is notified by email</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          disabled={!!uploading}
          onChange={e => handleFiles(e.target.files)}
        />
      </label>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {justUploaded > 0 && !error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{justUploaded === 1 ? 'File sent.' : `${justUploaded} files sent.`} Your team has been notified.</span>
        </div>
      )}

      {loading ? (
        <div className="p-4 text-xs text-slate-500">Loading your files…</div>
      ) : files.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0f111a] divide-y divide-white/[0.06] overflow-hidden">
          {files.map(file => (
            <div key={file.id} className="p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-white truncate block">{file.file_name}</span>
                  <span className="text-[10px] text-slate-500">
                    {[formatFileSize(file.size_bytes), formatDate(file.created_at)].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </div>
              {file.download_url && (
                <a
                  href={file.download_url}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                  aria-label={`Download ${file.file_name}`}
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
