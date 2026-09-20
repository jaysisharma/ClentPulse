'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Loader2, X, Image } from 'lucide-react'

interface FigmaFile {
  key: string
  name: string
  thumbnail_url: string | null
  last_modified: string
}

interface Props {
  onSelect: (file: { externalId: string; externalUrl: string; name: string; thumbnailUrl: string | null; metadata: Record<string, any> }) => Promise<void>
  onClose: () => void
}

export function FigmaFilePicker({ onSelect, onClose }: Props) {
  const [files, setFiles] = useState<FigmaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/integrations/figma/resources?type=files')
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Failed to load Figma files')
        return r.json()
      })
      .then(data => setFiles(data.files ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = async (file: FigmaFile) => {
    setSelecting(file.key)
    try {
      await onSelect({
        externalId: file.key,
        externalUrl: `https://www.figma.com/design/${file.key}`,
        name: file.name,
        thumbnailUrl: file.thumbnail_url,
        metadata: { lastModified: file.last_modified },
      })
    } finally {
      setSelecting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-label="Select Figma file">
      <div className="bg-white dark:bg-[#0c0d12] rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Select Figma File</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" aria-label="Loading Figma files" />
            </div>
          ) : error ? (
            <p className="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : files.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">No Figma files found.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 p-2">
              {files.map(file => (
                <li key={file.key}>
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-slate-100 dark:bg-white/5 relative overflow-hidden">
                      {file.thumbnail_url ? (
                        <img
                          src={file.thumbnail_url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600">
                          <Image className="w-6 h-6" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(file.last_modified).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <a
                          href={`https://www.figma.com/design/${file.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          aria-label="Open in Figma"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleSelect(file)}
                          disabled={!!selecting}
                          className="flex-1 text-xs font-medium py-1 rounded-md bg-[#a259ff] text-white hover:bg-[#8b46e8] disabled:opacity-50 transition-colors"
                          aria-label={`Select ${file.name}`}
                        >
                          {selecting === file.key ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Select'}
                        </button>
                      </div>
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
