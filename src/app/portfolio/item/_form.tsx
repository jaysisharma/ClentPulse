'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, X, Code2, Globe, Play,
  Image as ImageIcon, Plus, Loader2,
} from 'lucide-react'

interface PortfolioItem {
  id: string; title: string; description: string | null
  live_url: string | null; github_url: string | null; video_url: string | null
  screenshots: string[]; tags: string[]
}

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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      if (!editId) { setLoading(false); return }
      supabase.from('portfolio_items').select('*').eq('id', editId).eq('user_id', user.id).single()
        .then(({ data }) => {
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
  pendingPreviewsRef.current = pendingPreviews
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

  async function uploadScreenshots(itemId: string): Promise<string[]> {
    if (!pendingFiles.length) return []
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i]
      const ext  = file.name.split('.').pop()
      const path = `${userId}/${itemId}/${Date.now()}-${i}.${ext}`
      const { error } = await supabase.storage.from('portfolio-screenshots').upload(path, file, { upsert: true })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('portfolio-screenshots').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    setUploading(false)
    return urls
  }

  async function handleSave() {
    if (!title.trim() || !userId) return
    setSaving(true); setError('')
    const supabase = createClient()

    if (editId) {
      // Upload new screenshots then merge
      const newUrls = await uploadScreenshots(editId)
      const allShots = [...existingShots, ...newUrls]
      const { error: err } = await supabase.from('portfolio_items').update({
        title: title.trim(), description: description || null,
        live_url: liveUrl || null, github_url: githubUrl || null,
        video_url: videoUrl || null, screenshots: allShots, tags,
      }).eq('id', editId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      // Insert first to get ID, then upload screenshots
      const { data, error: insertErr } = await supabase.from('portfolio_items').insert({
        user_id: userId, title: title.trim(),
        description: description || null,
        live_url: liveUrl || null, github_url: githubUrl || null,
        video_url: videoUrl || null, screenshots: [], tags,
      }).select().single()
      if (insertErr || !data) { setError(insertErr?.message ?? 'Insert failed'); setSaving(false); return }
      const newUrls = await uploadScreenshots(data.id)
      if (newUrls.length) {
        await supabase.from('portfolio_items').update({ screenshots: newUrls }).eq('id', data.id)
      }
    }

    setSaving(false)
    router.push('/portfolio')
  }

  const videoEmbed = videoUrl ? getEmbedUrl(videoUrl) : null
  const totalShots = existingShots.length + pendingPreviews.length

  if (loading) return <AppLayout><div className="text-slate-400 text-sm animate-pulse">Loading…</div></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in">
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to portfolio
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{editId ? 'Edit work item' : 'Add work item'}</h1>
        <p className="text-slate-500 text-sm mb-8">Showcase a project with screenshots, a demo, links, and a case study.</p>

        <div className="space-y-5">

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Project info</h2>
            <Input label="Title" placeholder="Supabase backend for Acme Corp" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Case study / description</label>
              <textarea
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
                rows={5}
                placeholder="Describe what you built, the challenge you solved, the tech stack, and the outcome. This is your case study."
                value={description}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Tags <span className="text-slate-400 font-normal">(press Enter to add)</span></label>
              <div className="flex flex-wrap gap-2 p-2.5 border border-slate-200 rounded-xl bg-slate-50 min-h-[44px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-colors">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-indigo-900">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-24 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
                  placeholder={tags.length ? '' : 'Next.js, Supabase, TypeScript…'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Links</h2>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none mt-3.5" />
              <Input label="Live URL" type="url" placeholder="https://yourproject.com" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} className="pl-9" />
            </div>
            <div className="relative">
              <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none mt-3.5" />
              <Input label="GitHub repository" type="url" placeholder="https://github.com/you/repo" value={githubUrl} onChange={e => setCode2Url(e.target.value)} className="pl-9" />
            </div>
            <div>
              <Input label="Demo video URL (YouTube or Loom)" type="url" placeholder="https://youtube.com/watch?v=… or loom.com/share/…" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
              {videoUrl && !videoEmbed && (
                <p className="text-xs text-amber-600 mt-1.5">Paste a YouTube or Loom URL to embed the video.</p>
              )}
              {videoEmbed && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 aspect-video">
                  <iframe src={videoEmbed} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}
            </div>
          </div>

          {/* Screenshots */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Screenshots</h2>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP — max 5 MB each</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <Plus className="w-3.5 h-3.5" />Add images
              </Button>
              <input
                ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {totalShots === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-10 flex flex-col items-center gap-2 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors"
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">Click to upload screenshots</span>
                <span className="text-xs">or drag and drop</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingShots.map(url => (
                  <div key={url} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {pendingPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-700 bg-white/90 px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePending(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

          <div className="flex gap-3">
            <Link href="/portfolio" className="flex-1">
              <Button variant="secondary" className="w-full justify-center">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              loading={saving || uploading}
              disabled={!title.trim()}
              className="flex-1 justify-center"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
                : editId ? 'Save changes' : 'Add to portfolio'
              }
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
