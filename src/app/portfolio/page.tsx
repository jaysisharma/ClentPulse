'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import {
  Check, Copy, ExternalLink, Star, Briefcase,
  Eye, EyeOff, Globe, Plus, Pencil, Trash2,
  Code2, Play, Image as ImageIcon, Database,
  Sparkles, Wand2, X
} from 'lucide-react'
import Link from 'next/link'
import {
  PORTFOLIO_MIGRATION_SQL,
  getLocalPortfolioItems,
  deleteLocalPortfolioItem,
  updateProjectLiveUrl
} from '@/lib/portfolio-autofill'

interface Testimonial { id: string; client_name: string; rating: number; content: string; approved: boolean; projects: { project_name: string } | null }
interface Project     { id: string; project_name: string; color: string; status: string; live_url?: string | null }
interface PortfolioItem {
  id: string; title: string; description: string | null
  live_url: string | null; github_url: string | null; video_url: string | null
  screenshots: string[]; tags: string[]
  _is_local?: boolean
}

export default function PortfolioPage() {
  const [userId, setUserId]   = useState('')
  const [name, setName]       = useState('')
  const [bio, setBio]         = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [accent, setAccent]   = useState('#6366F1')

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [projects, setProjects]         = useState<Project[]>([])
  const [items, setItems]               = useState<PortfolioItem[]>([])

  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [copied, setCopied]     = useState(false)
  const [bioError, setBioError] = useState('')

  // Database schema migration notice
  const [missingTable, setMissingTable] = useState(false)
  const [sqlCopied, setSqlCopied]       = useState(false)

  // Project link modal state
  const [linkModalProject, setLinkModalProject] = useState<Project | null>(null)
  const [modalUrl, setModalUrl]                 = useState('')
  const [savingLink, setSavingLink]             = useState(false)

  const savedTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (savedTimerRef.current)  clearTimeout(savedTimerRef.current)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      setUserId(user.id)

      Promise.all([
        supabase.from('users').select('name, logo_url, accent_color, portfolio_bio').eq('id', user.id).single(),
        supabase.from('testimonials').select('*, projects(project_name)').eq('user_id', user.id).eq('approved', true).order('created_at', { ascending: false }),
        supabase.from('projects').select('id, project_name, color, status, live_url').eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }),
        supabase.from('portfolio_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]).then(([{ data: u }, { data: t }, { data: p }, { data: itms, error: itmsErr }]: any[]) => {
        if (u) {
          setName(u.name ?? '')
          setBio(u.portfolio_bio ?? '')
          setLogoUrl(u.logo_url ?? null)
          setAccent(u.accent_color ?? '#6366F1')
        }
        setTestimonials(t ?? [])
        setProjects(p ?? [])

        // Check if portfolio_items table is missing
        const isTableMissing =
          itmsErr && (
            itmsErr.code === 'PGRST205' ||
            itmsErr.code === '42P01' ||
            itmsErr.message?.toLowerCase().includes('schema cache') ||
            itmsErr.message?.toLowerCase().includes('portfolio_items')
          )

        if (isTableMissing) {
          setMissingTable(true)
        }

        // Merge remote items with any local fallback items
        const localItems = getLocalPortfolioItems(user.id)
        const remoteItems = itms || []
        const combined = [...remoteItems]

        localItems.forEach((local: any) => {
          if (!combined.some(c => c.id === local.id)) {
            combined.push(local)
          }
        })

        setItems(combined)
      })
    })
  }, [])

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/portfolio/${userId}`
    : ''

  async function saveBio() {
    if (!userId) return
    setSaving(true)
    setBioError('')
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ portfolio_bio: bio }).eq('id', userId)
    if (error) {
      setBioError('Could not save — make sure the portfolio_bio column exists on the users table.')
    } else {
      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  async function copySql() {
    await navigator.clipboard.writeText(PORTFOLIO_MIGRATION_SQL)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 3000)
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this work item from your portfolio?')) return
    const supabase = createClient()
    await supabase.from('portfolio_items').delete().eq('id', id)
    deleteLocalPortfolioItem(userId, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleSaveProjectLink(openShowcase: boolean) {
    if (!linkModalProject) return
    setSavingLink(true)
    const supabase = createClient()
    await updateProjectLiveUrl(supabase, linkModalProject.id, modalUrl.trim())
    setProjects(prev => prev.map(p => p.id === linkModalProject.id ? { ...p, live_url: modalUrl.trim() || null } : p))
    setSavingLink(false)
    const projId = linkModalProject.id
    setLinkModalProject(null)
    if (openShowcase) {
      window.location.href = `/portfolio/item/new?projectId=${projId}`
    }
  }

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : null

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10 max-w-4xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Public Portfolio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Your public engineering & design showroom — share directly with prospective clients.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/portfolio/item/new"
                className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add work item</span>
              </Link>
              <a
                href={`/portfolio/${userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 w-fit shadow-xs flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview profile</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Missing Table Notice */}
          {missingTable && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2.5 flex-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Database Setup Notice: `portfolio_items` Table
                  </h3>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    The Supabase table <code className="px-1 py-0.5 rounded bg-amber-200/50 dark:bg-amber-900/50 font-mono text-[11px]">public.portfolio_items</code> has not been created yet.
                    Run the SQL migration in your Supabase SQL editor to enable persistent cloud sync.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copySql}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-900 text-white dark:bg-amber-400 dark:text-amber-950 hover:opacity-90 px-3 py-1.5 text-xs font-semibold shadow-xs transition-opacity"
                  >
                    {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {sqlCopied ? 'Copied migration SQL!' : 'Copy SQL Migration'}
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/_/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white/60 dark:bg-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-white dark:hover:bg-amber-900/40 transition-colors shadow-xs"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Public URL card */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Public profile address
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/[0.04] rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 font-mono truncate">
                {publicUrl || 'Generating public URL...'}
              </div>
              <button
                onClick={copyLink}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bio editor */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 sm:p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Bio / Tagline</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{bio.length} / 280</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-3">Shown under your studio name on the public page. Keep it punchy (1–2 sentences).</p>
            <textarea
              className="w-full px-4 py-3 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all resize-none"
              rows={3}
              placeholder={`I'm a senior fullstack engineer building high-growth venture products. ${name ? `— ${name.split(' ')[0]}` : ''}`}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveBio}
                  disabled={saving}
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>{saving ? 'Saving...' : 'Save bio'}</span>
                  )}
                </button>
                {bioError && <span className="text-xs text-rose-500 dark:text-rose-400">{bioError}</span>}
              </div>
            </div>
          </div>

          {/* What's on the portfolio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Testimonials */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Testimonials</span>
                </div>
                {testimonials.length > 0 && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />{testimonials.length} visible
                  </span>
                )}
              </div>

              {testimonials.length === 0 ? (
                <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 py-3">
                  <EyeOff className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <span>No approved testimonials yet. Approve some from the <a href="/testimonials" className="text-slate-900 dark:text-white hover:underline font-medium">Testimonials</a> page.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {avgRating && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 ml-1">{avgRating} avg</span>
                    </div>
                  )}
                  {testimonials.slice(0, 3).map(t => (
                    <div key={t.id} className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-900 dark:text-white truncate">{t.client_name}</span>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-light line-clamp-2">&ldquo;{t.content}&rdquo;</p>
                    </div>
                  ))}
                  {testimonials.length > 3 && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">+{testimonials.length - 3} more on your portfolio</p>
                  )}
                </div>
              )}
            </div>

            {/* Projects & Work Selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Completed Projects</span>
                </div>
                {projects.length > 0 && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />{projects.length} visible
                  </span>
                )}
              </div>

              {projects.length === 0 ? (
                <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 py-3">
                  <EyeOff className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <span>No completed projects yet. Mark a project as completed to feature it automatically.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color ?? accent }} />
                        <span className="text-xs font-medium text-slate-900 dark:text-white truncate">{p.project_name}</span>
                        {p.live_url && (
                          <a
                            href={p.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 font-mono"
                            title={`Open live link: ${p.live_url}`}
                          >
                            <Globe className="w-3 h-3" />
                            <span>Live</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setLinkModalProject(p)
                            setModalUrl(p.live_url || '')
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 transition-colors"
                          title={p.live_url ? 'Edit live website / app link' : 'Add live website or app link'}
                        >
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{p.live_url ? 'Edit' : '+ Link'}</span>
                        </button>
                        <Link
                          href={`/portfolio/item/new?projectId=${p.id}`}
                          className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 transition-colors"
                          title="Auto-fill showcase item from this project"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Showcase</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {projects.length > 6 && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">+{projects.length - 6} more on your portfolio</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Work showcase */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 sm:p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Work Showcase</span>
                {items.length > 0 && (
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full ml-1">
                    {items.length}
                  </span>
                )}
              </div>
              <Link href="/portfolio/item/new">
                <button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-1.5 text-xs transition-all flex items-center gap-1.5 shadow-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add item</span>
                </button>
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] py-12 text-center">
                <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-light">No showcase items uploaded yet.</p>
                <Link href="/portfolio/item/new">
                  <button className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all inline-flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Auto-create from your work</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] p-4 transition-all group">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex-shrink-0">
                      {item.screenshots?.[0]
                        ? <img src={item.screenshots[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-600" /></div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item._is_local && (
                          <span className="text-[9px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-700">
                            Local Preview
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.screenshots?.length > 0 && (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />{item.screenshots.length}
                          </span>
                        )}
                        {item.video_url && <Play className="w-3 h-3 text-slate-500" />}
                        {item.github_url && <Code2 className="w-3 h-3 text-slate-500" />}
                        {item.live_url && <Globe className="w-3 h-3 text-slate-500" />}
                        {item.tags?.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link href={`/portfolio/item/${item.id}`}>
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile card — what the visitor sees */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xl">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 bg-slate-100 dark:bg-[#0c0d12]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-2 truncate">{publicUrl}</span>
            </div>
            {/* Mini hero preview */}
            <div className="px-8 py-12 text-center relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-[#0e1017] dark:to-[#08090a]">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none blur-3xl"
                style={{ background: `radial-gradient(circle at center, ${accent}, transparent 70%)` }}
              />
              <div className="relative z-10">
                {logoUrl ? (
                  <img src={logoUrl} alt={name} className="w-16 h-16 rounded-2xl object-contain bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 mx-auto mb-4 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white text-xl font-mono mx-auto mb-4 shadow-sm">
                    {(name || 'F').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight mb-2">{name || 'Your studio'}</div>
                {bio ? (
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-light max-w-sm mx-auto leading-relaxed">{bio}</p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-600 text-xs italic font-light">Add a bio above to complete your showroom profile</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Link Modal */}
          {linkModalProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        {linkModalProject.live_url ? 'Edit Live Link' : 'Add Live Website or App Link'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                        {linkModalProject.project_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLinkModalProject(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Website, Web App, or App Store URL
                  </label>
                  <input
                    type="url"
                    value={modalUrl}
                    onChange={e => setModalUrl(e.target.value)}
                    placeholder="https://example.com or App Store link"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 font-light mt-1.5 leading-relaxed">
                    Saves to the project settings and will be automatically extracted when creating your portfolio case study.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={savingLink}
                    onClick={() => handleSaveProjectLink(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save & Showcase on Portfolio</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingLink}
                    onClick={() => handleSaveProjectLink(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-semibold py-2 text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <span>Save Link Only</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </DarkShell>
    </AppLayout>
  )
}
