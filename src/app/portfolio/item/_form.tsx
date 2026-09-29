'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, X, Code2, Globe,
  Image as ImageIcon, Plus, Loader2, Sparkles,
  Briefcase, Wand2, Check, Copy, ExternalLink,
  AlertTriangle, Database, CheckCircle2, ChevronRight
} from 'lucide-react'
import {
  extractWorkDataFromProject,
  PORTFOLIO_MIGRATION_SQL,
  saveLocalPortfolioItem,
  getLocalPortfolioItems,
  updateProjectLiveUrl
} from '@/lib/portfolio-autofill'

interface ProjectOption {
  id: string
  project_name: string
  client_name: string | null
  color: string
  status: string
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
  const searchParams = useSearchParams()
  const fileRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId]       = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // Form fields
  const [projectId, setProjectId] = useState<string>('')
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [liveUrl, setLiveUrl]     = useState('')
  const [githubUrl, setCode2Url] = useState('')
  const [videoUrl, setVideoUrl]   = useState('')
  const [tagInput, setTagInput]   = useState('')
  const [tags, setTags]           = useState<string[]>([])

  // Available user projects to import from
  const [projects, setProjects]         = useState<ProjectOption[]>([])
  const [autofilling, setAutofilling]   = useState(false)
  const [autofillSuccess, setAutofillSuccess] = useState<string | null>(null)

  // Database migration error state
  const [missingTableError, setMissingTableError] = useState(false)
  const [sqlCopied, setSqlCopied]                 = useState(false)

  // Screenshots: existing URLs (from DB or auto-extracted) + pending files (local)
  const [existingShots, setExistingShots]     = useState<string[]>([])
  const [pendingFiles, setPendingFiles]       = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [uploading, setUploading]             = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }: { data: any }) => {
      const user = data?.user
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      // Fetch projects so the user can select work to auto-fill
      const { data: userProjects } = await supabase
        .from('projects')
        .select('id, project_name, client_name, color, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (userProjects) {
        setProjects(userProjects)
      }

      // Check if editing an existing item
      if (editId) {
        const { data: itemData, error: fetchErr } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('id', editId)
          .eq('user_id', user.id)
          .single()

        if (fetchErr) {
          // Check local fallback
          const localItems = getLocalPortfolioItems(user.id)
          const foundLocal = localItems.find((i: any) => i.id === editId)
          if (foundLocal) {
            setTitle(foundLocal.title)
            setDesc(foundLocal.description ?? '')
            setLiveUrl(foundLocal.live_url ?? '')
            setCode2Url(foundLocal.github_url ?? '')
            setVideoUrl(foundLocal.video_url ?? '')
            setTags(foundLocal.tags ?? [])
            setExistingShots(foundLocal.screenshots ?? [])
            if (foundLocal.project_id) setProjectId(foundLocal.project_id)
          }
        } else if (itemData) {
          setTitle(itemData.title)
          setDesc(itemData.description ?? '')
          setLiveUrl(itemData.live_url ?? '')
          setCode2Url(itemData.github_url ?? '')
          setVideoUrl(itemData.video_url ?? '')
          setTags(itemData.tags ?? [])
          setExistingShots(itemData.screenshots ?? [])
          if (itemData.project_id) setProjectId(itemData.project_id)
        }
        setLoading(false)
        return
      }

      // If new item and a projectId was passed via query params, auto-trigger work extraction
      const queryProjectId = searchParams.get('projectId')
      if (queryProjectId) {
        setProjectId(queryProjectId)
        handleSelectWork(queryProjectId, supabase)
      }

      setLoading(false)
    })
  }, [editId])

  // Cleanup for object previews
  const pendingPreviewsRef = useRef(pendingPreviews)
  useEffect(() => { pendingPreviewsRef.current = pendingPreviews })
  useEffect(() => () => { pendingPreviewsRef.current.forEach(url => URL.revokeObjectURL(url)) }, [])

  // Auto-fill work details from selected project
  async function handleSelectWork(targetProjectId: string, supabaseClient?: any) {
    if (!targetProjectId) return
    const supabase = supabaseClient || createClient()
    setAutofilling(true)
    setError('')
    setAutofillSuccess(null)

    try {
      const extracted = await extractWorkDataFromProject(supabase, targetProjectId)
      if (extracted) {
        setTitle(extracted.title)
        setDesc(extracted.description)
        if (extracted.liveUrl) setLiveUrl(extracted.liveUrl)
        if (extracted.githubUrl) setCode2Url(extracted.githubUrl)
        if (extracted.videoUrl) setVideoUrl(extracted.videoUrl)
        if (extracted.tags?.length) setTags(extracted.tags)

        // Automatically add fetched images into showcase gallery
        if (extracted.images && extracted.images.length > 0) {
          const newUrls = extracted.images.map(img => img.url)
          setExistingShots(prev => {
            // Deduplicate
            const combined = [...prev]
            newUrls.forEach(u => {
              if (!combined.includes(u)) combined.push(u)
            })
            return combined
          })
          setAutofillSuccess(
            `Auto-populated project details and fetched ${extracted.images.length} showcase images (including live snapshot, design assets, and studio artwork)!`
          )
        } else {
          setAutofillSuccess('Auto-populated project overview, deliverables, and case study narrative!')
        }
      }
    } catch (err: any) {
      console.error('Failed to auto-fill work data:', err)
      setError('Could not auto-fill details from this project. You can still enter details manually.')
    } finally {
      setAutofilling(false)
    }
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size < 10 * 1024 * 1024)
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

  async function uploadScreenshots(itemId: string): Promise<{ urls: string[]; failedIdx: number[] }> {
    if (!pendingFiles.length) return { urls: [], failedIdx: [] }
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    const failedIdx: number[] = []

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i]
      const ext  = file.name.split('.').pop() || 'png'
      const path = `${userId}/${itemId}/${Date.now()}-${i}.${ext}`
      try {
        const { error } = await supabase.storage.from('portfolio-screenshots').upload(path, file, { upsert: true })
        if (error) {
          // If storage bucket isn't set up yet, fallback to in-memory/preview url so user is not blocked
          failedIdx.push(i)
          continue
        }
        const { data: { publicUrl } } = supabase.storage.from('portfolio-screenshots').getPublicUrl(path)
        urls.push(publicUrl)
      } catch {
        failedIdx.push(i)
      }
    }
    setUploading(false)
    return { urls, failedIdx }
  }

  async function copySql() {
    await navigator.clipboard.writeText(PORTFOLIO_MIGRATION_SQL)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 3000)
  }

  function handleSaveLocally() {
    const localItem = saveLocalPortfolioItem(userId, {
      id: editId || createdId || `item_${Date.now()}`,
      project_id: projectId || null,
      title: title.trim(),
      description: description || null,
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      video_url: videoUrl || null,
      screenshots: [...existingShots, ...pendingPreviews],
      tags,
    })
    if (projectId && liveUrl.trim()) {
      const supabase = createClient()
      updateProjectLiveUrl(supabase, projectId, liveUrl.trim())
    }
    setMissingTableError(false)
    router.push('/portfolio')
  }

  async function handleSave() {
    if (!title.trim() || !userId) return
    setSaving(true)
    setError('')
    setMissingTableError(false)
    const supabase = createClient()

    let itemId = editId ?? createdId

    // Insert new item if not yet created
    if (!itemId) {
      const { data, error: insertErr } = await supabase.from('portfolio_items').insert({
        user_id: userId,
        project_id: projectId || null,
        title: title.trim(),
        description: description || null,
        live_url: liveUrl || null,
        github_url: githubUrl || null,
        video_url: videoUrl || null,
        screenshots: [],
        tags,
      }).select().single()

      if (insertErr || !data) {
        const errMsg = insertErr?.message || ''
        const isMissingTable =
          insertErr?.code === 'PGRST205' ||
          insertErr?.code === '42P01' ||
          errMsg.toLowerCase().includes('schema cache') ||
          errMsg.toLowerCase().includes('portfolio_items')

        if (isMissingTable) {
          setMissingTableError(true)
          setSaving(false)
          return
        }

        setError(errMsg || 'Failed to save showcase item')
        setSaving(false)
        return
      }

      itemId = data.id
      setCreatedId(data.id)
    }

    if (!itemId) {
      setSaving(false)
      return
    }

    // Upload any newly selected pending screenshot files
    const { urls: newUrls, failedIdx } = await uploadScreenshots(itemId)
    const allShots = [...existingShots, ...newUrls]

    const { error: updateErr } = await supabase.from('portfolio_items').update({
      project_id: projectId || null,
      title: title.trim(),
      description: description || null,
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      video_url: videoUrl || null,
      screenshots: allShots,
      tags,
      updated_at: new Date().toISOString(),
    }).eq('id', itemId)

    if (updateErr) {
      const isMissingTable =
        updateErr.code === 'PGRST205' ||
        updateErr.message?.toLowerCase().includes('schema cache') ||
        updateErr.message?.toLowerCase().includes('portfolio_items')

      if (isMissingTable) {
        setMissingTableError(true)
        setSaving(false)
        return
      }

      setError(updateErr.message)
      setSaving(false)
      return
    }

    if (failedIdx.length) {
      const failed = new Set(failedIdx)
      pendingPreviews.forEach((url, i) => { if (!failed.has(i)) URL.revokeObjectURL(url) })
      setPendingFiles(prev => prev.filter((_, i) => failed.has(i)))
      setPendingPreviews(prev => prev.filter((_, i) => failed.has(i)))
      setExistingShots(allShots)
      setError(`${failedIdx.length} screenshot(s) could not be uploaded to storage, but text details were saved.`)
      setSaving(false)
      return
    }

    if (projectId && liveUrl.trim()) {
      await updateProjectLiveUrl(supabase, projectId, liveUrl.trim())
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
            Loading work item studio…
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
              Select existing work to auto-fill narrative case studies and showcase imagery, or construct a custom portfolio item.
            </p>
          </div>

          {/* Missing Supabase Table Warning & One-Click Fix */}
          {missingTableError && (
            <div className="mb-6 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      Supabase Setup Required: Table `portfolio_items` Not Found
                    </h3>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
                      The database table <code className="px-1 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/50 font-mono text-[11px]">public.portfolio_items</code> has not been created in your Supabase project yet.
                      Run the one-click SQL migration below in your Supabase SQL Editor to enable database sync, or save locally to preview immediately!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={copySql}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-900 text-white dark:bg-amber-400 dark:text-amber-950 hover:opacity-90 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-opacity"
                    >
                      {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      {sqlCopied ? 'Copied migration SQL!' : 'Copy SQL Migration'}
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/_/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white/60 dark:bg-amber-900/20 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-white dark:hover:bg-amber-900/40 transition-colors shadow-xs"
                    >
                      <span>Supabase SQL Editor</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <button
                      type="button"
                      onClick={handleSaveLocally}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Save locally & continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">

            {/* 1. SELECT EXISTING WORK (AUTO-FILL & AUTO-IMAGE FETCHING) */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-[#0c0d12]/90 dark:to-purple-950/10 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/20 ring-1 ring-indigo-500/10 p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-indigo-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      Auto-Fill From Existing Work
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        Smart Sync
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                      Select any project to auto-generate case studies, extract deliverables, and fetch showcase imagery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={projectId}
                    onChange={e => {
                      const selected = e.target.value
                      setProjectId(selected)
                      if (selected) handleSelectWork(selected)
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12131a] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a project to import details & imagery…</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.project_name} {p.client_name ? `(${p.client_name})` : ''} — {p.status === 'completed' ? 'Completed' : 'Active'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!projectId || autofilling}
                  onClick={() => handleSelectWork(projectId)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 text-xs transition-colors shadow-xs disabled:opacity-50 flex-shrink-0"
                >
                  {autofilling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing work…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-fill & Fetch Images
                    </>
                  )}
                </button>
              </div>

              {autofillSuccess && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{autofillSuccess}</span>
                </div>
              )}
            </div>

            {/* 2. PROJECT OVERVIEW CARD */}
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
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Case Study & Highlights
                  </label>
                  <span className="text-[11px] text-slate-400 font-light">
                    Auto-generated from milestones, deliverables & metrics
                  </span>
                </div>
                <textarea
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors resize-none leading-relaxed font-sans"
                  rows={6}
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
                    placeholder={tags.length ? '' : 'e.g. Next.js, Figma, UI/UX, Stripe, Tailwind…'}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>
            </div>

            {/* 3. LINKS & MEDIA */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Live URLs & Walkthroughs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                  Direct production links, source repositories, and walkthrough screencasts.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Website / App URL
                  </label>
                  <span className="text-[10px] text-slate-400 font-light">
                    Website, Web App, or App Store Link
                  </span>
                </div>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://example.com or https://apps.apple.com/app/..."
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">
                  Synchronizes with your project settings and is showcased on your public portfolio.
                </p>
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

            {/* 4. SHOWCASE GALLERY (AUTO-FETCHED IMAGES & CUSTOM SCREENSHOTS) */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    Showcase Imagery
                    {totalShots > 0 && (
                      <span className="text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {totalShots} asset{totalShots === 1 ? '' : 's'}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                    Auto-fetched live snapshots, project artwork cards, and high-res uploads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add custom image
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
                    Upload showcase screenshots or select a project above
                  </span>
                  <span className="text-[11px] font-light text-slate-400 dark:text-slate-500">
                    Selecting a project above automatically generates artwork cards & fetches snapshots
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {existingShots.map((url, idx) => {
                    const isSvgArtwork = url.startsWith('data:image/svg')
                    const isSnapshot = url.includes('image.thum.io') || url.includes('microlink')
                    return (
                      <div
                        key={idx}
                        className="relative group aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10"
                      >
                        <img src={url} alt="Showcase asset" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-slate-950/80 px-2 py-0.5 rounded shadow-xs border border-white/10">
                            {isSvgArtwork ? 'Studio Artwork' : isSnapshot ? 'Live Snapshot' : 'Asset'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                          title="Delete image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                  {pendingPreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-white/95 dark:bg-slate-900/90 dark:text-indigo-300 px-2 py-0.5 rounded-full shadow-xs border border-indigo-500/20">
                          Upload
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
                    Publishing to portfolio…
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
