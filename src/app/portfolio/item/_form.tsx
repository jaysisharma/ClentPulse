'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, X, Code2, Globe,
  Image as ImageIcon, Plus, Loader2, Sparkles,
} from 'lucide-react'

// Extract embed URL from YouTube or Loom share links
function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const loom = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/)
  if (loom) return `https://www.loom.com/embed/${loom[1]}`
  return null
}

export function PortfolioItemForm({ editId }: { editId?: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId]   = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null) // id once a new item is inserted — keeps retries from re-inserting
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [liveUrl, setLiveUrl]     = useState('')
  const [githubUrl, setCode2Url] = useState('')
  const [videoUrl, setVideoUrl]   = useState('')
  const [tagInput, setTagInput]   = useState('')
  const [tags, setTags]           = useState<string[]>([])

  // Screenshots: existing URLs (from DB) + pending files (local)
  const [existingShots, setExistingShots] = useState<string[]>([])
  const [pendingFiles, setPendingFiles]   = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      setUserId(user.id)
      if (!editId) { setLoading(false); return }
      supabase.from('portfolio_items').select('*').eq('id', editId).eq('user_id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data) {
            setTitle(data.title)
            setDesc(data.description ?? '')
            setLiveUrl(data.live_url ?? '')
            setCode2Url(data.github_url ?? '')
            setVideoUrl(data.video_url ?? '')
            setTags(data.tags ?? [])
            setExistingShots(data.screenshots ?? [])
          }
          setLoading(false)
        })
    })
  }, [editId])

  // Keep a ref so the unmount cleanup always sees the latest previews without
  // re-running the effect (and revoking still-displayed URLs) on every state change.
  const pendingPreviewsRef = useRef(pendingPreviews)
  useEffect(() => { pendingPreviewsRef.current = pendingPreviews })
  useEffect(() => () => { pendingPreviewsRef.current.forEach(url => URL.revokeObjectURL(url)) }, [])

  function addFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size < 5 * 1024 * 1024)
    setPendingFiles(prev => [...prev, ...valid])
    setPendingPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))])
  }

  function removeExisting(url: string) {
    setExistingShots(prev => prev.filter(s => s !== url))
  }

  function removePending(idx: number) {
    URL.revokeObjectURL(pendingPreviews[idx])
    setPendingFiles(prev => prev.filter((_, i) => i !== idx))
    setPendingPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().replace(/,$/, '')
      if (t && !tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  // Returns the uploaded public URLs plus the indices (into pendingFiles) that
  // failed, so the caller can surface failures instead of silently dropping them.
  async function uploadScreenshots(itemId: string): Promise<{ urls: string[]; failedIdx: number[] }> {
    if (!pendingFiles.length) return { urls: [], failedIdx: [] }
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    const failedIdx: number[] = []
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i]
      const ext  = file.name.split('.').pop()
      const path = `${userId}/${itemId}/${Date.now()}-${i}.${ext}`
      const { error } = await supabase.storage.from('portfolio-screenshots').upload(path, file, { upsert: true })
      if (error) { failedIdx.push(i); continue }
      const { data: { publicUrl } } = supabase.storage.from('portfolio-screenshots').getPublicUrl(path)
      urls.push(publicUrl)
    }
    setUploading(false)
    return { urls, failedIdx }
  }

  async function handleSave() {
    if (!title.trim() || !userId) return
    setSaving(true)
    setError('')
    const supabase = createClient()

    // Insert on first save; reuse the id on retries so we never create duplicates.
    let itemId = editId ?? createdId
    if (!itemId) {
      const { data, error: insertErr } = await supabase.from('portfolio_items').insert({
        user_id: userId,
        title: title.trim(),
        description: description || null,
        live_url: liveUrl || null,
        github_url: githubUrl || null,
        video_url: videoUrl || null,
        screenshots: [],
        tags,
      }).select().single()
      if (insertErr || !data) {
        setError(insertErr?.message ?? 'Save failed')
        setSaving(false)
        return
      }
      itemId = data.id
      setCreatedId(data.id)
    }
    if (!itemId) { setSaving(false); return }

    const { urls: newUrls, failedIdx } = await uploadScreenshots(itemId)
    const allShots = [...existingShots, ...newUrls]

    const { error: err } = await supabase.from('portfolio_items').update({
      title: title.trim(),
      description: description || null,
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      video_url: videoUrl || null,
      screenshots: allShots,
      tags,
    }).eq('id', itemId)
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    // Some screenshots failed to upload — keep only those still selected so the
    // user can retry, and don't navigate away pretending everything saved.
    if (failedIdx.length) {
      const failed = new Set(failedIdx)
      pendingPreviews.forEach((url, i) => { if (!failed.has(i)) URL.revokeObjectURL(url) })
      setPendingFiles(prev => prev.filter((_, i) => failed.has(i)))
      setPendingPreviews(prev => prev.filter((_, i) => failed.has(i)))
      setExistingShots(allShots)
      setError(`${failedIdx.length} screenshot${failedIdx.length > 1 ? 's' : ''} couldn't be uploaded. They're still selected — please try saving again.`)
      setSaving(false)
      return
    }

    setSaving(false)
    router.push('/portfolio')
  }

  const videoEmbed = videoUrl ? getEmbedUrl(videoUrl) : null
  const totalShots = existingShots.length + pendingPreviews.length

  if (loading) {
    return (
      <AppLayout>
        <DarkShell>
          <div className="max-w-3xl py-12 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <Loader2 className="w-4 h-4 animate-spin text-slate-900 dark:text-white" />
            Loading work item…
          </div>
        </DarkShell>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12">
          {/* Back link */}
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to portfolio
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Showcase Studio
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              {editId ? 'Edit work item' : 'Add work item'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Showcase a client project with high-resolution imagery, interactive demo links, and a concise case study.
            </p>
          </div>

          <div className="space-y-6">
            {/* Project info card */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Project Overview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                  Name, narrative case study, and category tags.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Title
                </label>
                <input
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                  placeholder="e.g. Next.js SaaS Platform Architecture — Acme Corp"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Case Study & Highlights
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors resize-none"
                  rows={5}
                  placeholder="Summarize the client problem, technical stack used, and key business outcomes achieved…"
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Stack & Domains <span className="text-slate-400 font-normal lowercase">(press Enter to add)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] min-h-[48px] focus-within:border-slate-400 dark:focus-within:border-white/30 transition-colors">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 bg-slate-200/70 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags(prev => prev.filter(x => x !== t))}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    className="flex-1 min-w-28 text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                    placeholder={tags.length ? '' : 'e.g. Next.js, Supabase, Stripe, Tailwind…'}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>
            </div>

            {/* Links card */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Live URLs & Media
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                  Direct production links, source repositories, and walkthrough screencasts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Live Production URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Code Repository <span className="font-normal lowercase text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://github.com/org/repo"
                    value={githubUrl}
                    onChange={e => setCode2Url(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Walkthrough Video <span className="font-normal lowercase text-slate-400">(YouTube or Loom)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=… or https://loom.com/share/…"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                />
                {videoUrl && !videoEmbed && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">
                    Note: Paste a valid YouTube or Loom share URL to generate an interactive embed.
                  </p>
                )}
                {videoEmbed && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 aspect-video shadow-xs">
                    <iframe
                      src={videoEmbed}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Screenshots Card */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Showcase Gallery
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                    PNG, JPG, WebP — Up to 5 MB per asset.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add images
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => addFiles(e.target.files)}
                />
              </div>

              {totalShots === 0 ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl py-12 flex flex-col items-center gap-2.5 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upload showcase screenshots
                  </span>
                  <span className="text-[11px] font-light text-slate-400 dark:text-slate-500">
                    Drag and drop or browse files from your computer
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {existingShots.map(url => (
                    <div
                      key={url}
                      className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                        title="Delete image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {pendingPreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-white/95 dark:bg-slate-900/90 dark:text-indigo-300 px-2 py-0.5 rounded-full shadow-xs border border-indigo-500/20">
                          New
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePending(i)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Add more</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                href="/portfolio"
                className="w-full sm:w-auto text-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-5 py-2.5 text-xs font-semibold transition-colors shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || saving || uploading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-6 py-2.5 text-xs transition-all shadow-xs disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading screenshots…
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {editId ? 'Save changes' : 'Add to portfolio'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
