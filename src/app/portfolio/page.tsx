'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  Check, Copy, ExternalLink, Star, Briefcase,
  Eye, EyeOff, Globe, Plus, Pencil, Trash2,
  Code2, Play, Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'

interface Testimonial { id: string; client_name: string; rating: number; content: string; approved: boolean; projects: { project_name: string } | null }
interface Project     { id: string; project_name: string; color: string; status: string }
interface PortfolioItem {
  id: string; title: string; description: string | null
  live_url: string | null; github_url: string | null; video_url: string | null
  screenshots: string[]; tags: string[]
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

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [copied, setCopied]   = useState(false)
  const [bioError, setBioError] = useState('')
  const savedTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (savedTimerRef.current)  clearTimeout(savedTimerRef.current)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      Promise.all([
        supabase.from('users').select('name, logo_url, accent_color, portfolio_bio').eq('id', user.id).single(),
        supabase.from('testimonials').select('*, projects(project_name)').eq('user_id', user.id).eq('approved', true).order('created_at', { ascending: false }),
        supabase.from('projects').select('id, project_name, color, status').eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }),
        supabase.from('portfolio_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]).then(([{ data: u }, { data: t }, { data: p }, { data: itms }]) => {
        if (u) {
          setName(u.name ?? '')
          setBio(u.portfolio_bio ?? '')
          setLogoUrl(u.logo_url ?? null)
          setAccent(u.accent_color ?? '#6366F1')
        }
        setTestimonials(t ?? [])
        setProjects(p ?? [])
        setItems(itms ?? [])
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

  async function deleteItem(id: string) {
    if (!confirm('Remove this work item from your portfolio?')) return
    const supabase = createClient()
    await supabase.from('portfolio_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : null

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-3xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
            <p className="text-slate-500 text-sm mt-1">Your public profile — share it with potential clients.</p>
          </div>
          <a href={`/portfolio/${userId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <Eye className="w-3.5 h-3.5" />Preview
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Button>
          </a>
        </div>

        {/* Public URL card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900 text-sm">Public link</h2>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 font-mono truncate">
              {publicUrl}
            </div>
            <Button variant="secondary" onClick={copyLink} className="flex-shrink-0">
              {copied
                ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</>
                : <><Copy className="w-3.5 h-3.5" />Copy</>
              }
            </Button>
          </div>
        </div>

        {/* Bio editor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-1">Bio / tagline</h2>
          <p className="text-xs text-slate-400 mb-4">Shown under your name on the public page. Keep it to 1–2 sentences.</p>
          <textarea
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
            rows={3}
            placeholder={`I'm a freelance designer helping startups ship beautiful products. ${name ? `— ${name.split(' ')[0]}` : ''}`}
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={saveBio} loading={saving}>
                {saved ? <><Check className="w-3.5 h-3.5" />Saved</> : 'Save bio'}
              </Button>
              {bioError && <span className="text-xs text-red-500">{bioError}</span>}
            </div>
            <span className="text-xs text-slate-400">{bio.length} / 280</span>
          </div>
        </div>

        {/* What's on the portfolio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

          {/* Testimonials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Testimonials</h2>
              {testimonials.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />{testimonials.length} visible
                </span>
              )}
            </div>

            {testimonials.length === 0 ? (
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <EyeOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>No approved testimonials yet. Approve some from the <a href="/testimonials" className="text-indigo-500 hover:underline">Testimonials</a> page.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {avgRating && (
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="text-sm font-semibold text-slate-700 ml-1">{avgRating} avg</span>
                  </div>
                )}
                {testimonials.slice(0, 3).map(t => (
                  <div key={t.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">{t.client_name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">"{t.content}"</p>
                  </div>
                ))}
                {testimonials.length > 3 && (
                  <p className="text-xs text-slate-400">+{testimonials.length - 3} more on your portfolio</p>
                )}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Completed projects</h2>
              {projects.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />{projects.length} visible
                </span>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <EyeOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>No completed projects yet. Mark a project as completed to feature it here.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color ?? accent }} />
                    <span className="text-xs font-medium text-slate-700 truncate">{p.project_name}</span>
                  </div>
                ))}
                {projects.length > 6 && (
                  <p className="text-xs text-slate-400">+{projects.length - 6} more on your portfolio</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Work showcase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-900 text-sm">Work showcase</h2>
              {items.length > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />{items.length} visible
                </span>
              )}
            </div>
            <Link href="/portfolio/item/new">
              <Button size="sm"><Plus className="w-3.5 h-3.5" />Add item</Button>
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-3">No work items yet.</p>
              <Link href="/portfolio/item/new">
                <Button variant="secondary" size="sm"><Plus className="w-3.5 h-3.5" />Add your first item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    {item.screenshots?.[0]
                      ? <img src={item.screenshots[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400" /></div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{item.title}</div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {item.screenshots?.length > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />{item.screenshots.length}
                        </span>
                      )}
                      {item.video_url && <Play className="w-3 h-3 text-slate-400" />}
                      {item.github_url && <Code2 className="w-3 h-3 text-slate-400" />}
                      {item.live_url && <Globe className="w-3 h-3 text-slate-400" />}
                      {item.tags?.slice(0, 3).map(t => (
                        <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/portfolio/item/${item.id}`}>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile card — what the visitor sees */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-1 truncate">{publicUrl}</span>
          </div>
          {/* Mini hero preview */}
          <div className="px-8 py-10 text-center" style={{ backgroundColor: accent }}>
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-16 h-16 rounded-xl object-contain bg-white/10 p-1.5 mx-auto mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {(name || 'F').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-2xl font-bold text-white mb-2">{name || 'Your name'}</div>
            {bio
              ? <p className="text-white/75 text-sm max-w-sm mx-auto">{bio}</p>
              : <p className="text-white/40 text-sm italic">Add a bio above to complete your profile</p>
            }
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
