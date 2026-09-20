'use client'

import { useState, use, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Copy, Check, Mail, Eye, Plus, Trash2, Clock, Sparkles, Loader2 } from 'lucide-react'
import { getWeekOf } from '@/lib/utils'

import { DarkShell } from '@/components/layout/dark-shell'

export default function UpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const router = useRouter()
  const [bullets, setBullets] = useState(['', '', ''])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [project, setProject] = useState<{ project_name: string; client_name: string; color: string; slug: string; org_id?: string | null; user_id?: string } | null>(null)
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: proj }: { data: any } = await supabase
        .from('projects')
        .select('project_name,client_name,color,slug,org_id,user_id')
        .eq('id', id)
        .single()

      if (proj) {
        setProject(proj)
        if (proj.org_id) {
          const { data: mem }: { data: any } = await supabase
            .from('organization_members')
            .select('role')
            .eq('org_id', proj.org_id)
            .eq('user_id', user.id)
            .maybeSingle()
          setUserRole(mem?.role ?? null)
        }
      }
    }
    init()

    if (editId) {
      supabase.from('updates').select('*').eq('id', editId).single().then(({ data }: { data: any }) => {
        if (data) {
          setBullets(data.bullets ?? ['', '', ''])
          setNote(data.note ?? '')
        }
      })
    }
  }, [id, editId])

  async function handleAiDraft() {
    setAiLoading(true)
    setError('')
    try {
      const res = await fetch('/api/draft-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate AI draft.')
      }
      const data = await res.json()
      if (Array.isArray(data.bullets) && data.bullets.length > 0) {
        setBullets(data.bullets)
      }
      if (data.note) {
        setNote(data.note)
      }
    } catch (err: any) {
      setError(err.message || 'Could not generate draft.')
    } finally {
      setAiLoading(false)
    }
  }

  function generateEmailText() {
    if (!project) return ''
    const week = getWeekOf(new Date())
    const activeBullets = bullets.filter(b => b.trim().length > 0)
    const bulletsText = activeBullets.length > 0
      ? activeBullets.map(b => `• ${b}`).join('\n')
      : '• [No accomplishments listed]'

    return `Subject: ${project.project_name} — ${week}

Hi ${project.client_name},

Here's your weekly update on ${project.project_name}:

${bulletsText}
${note ? `\nNote: ${note}` : ''}

View full status page: ${typeof window !== 'undefined' ? window.location.origin : ''}/p/${project?.slug}

Best,`
  }

  type SubmitAction = 'draft' | 'review' | 'send'

  async function handleSubmit(action: SubmitAction) {
    setLoading(true)
    setError('')

    const filteredBullets = bullets.filter(b => b.trim().length > 0)
    if (filteredBullets.length === 0) {
      setError('Please enter at least one progress update.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const isReview = action === 'review'
    const isSend = action === 'send'
    const reviewStatus = isSend ? 'published' : isReview ? 'review_ready' : 'draft'

    if (isEditing && editId) {
      const { error: err } = await supabase
        .from('updates')
        .update({
          bullets: filteredBullets,
          note: note || null,
          review_status: reviewStatus,
          ...(isSend ? { sent_at: new Date().toISOString() } : {}),
        })
        .eq('id', editId)

      if (err) { setError(err.message); setLoading(false); return }

      if (isReview) {
        try {
          await fetch(`/api/projects/${id}/updates/${editId}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'submit_for_review' }),
          })
        } catch {}
      }

      if (isSend) {
        try {
          await fetch('/api/send-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updateId: editId, projectId: id }),
          })
        } catch {}
      }
    } else {
      const { data: update, error: err } = await supabase
        .from('updates')
        .insert({
          project_id: id,
          bullets: filteredBullets,
          note: note || null,
          sent_at: isSend ? new Date().toISOString() : null,
          review_status: reviewStatus,
          author_id: user.id,
        })
        .select()
        .single()

      if (err) { setError(err.message); setLoading(false); return }

      if (isReview && update) {
        try {
          await fetch(`/api/projects/${id}/updates/${update.id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'submit_for_review' }),
          })
        } catch {}
      }

      if (isSend && update) {
        try {
          await fetch('/api/send-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updateId: update.id, projectId: id }),
          })
        } catch {}
      }
    }

    router.push(`/project/${id}?${isSend ? 'sent=true' : isReview ? 'reviewed=true' : 'saved=true'}`)
  }

  const hasContent = bullets.some(b => b.trim().length > 0)
  const currentWeek = getWeekOf(new Date())

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-6 max-w-6xl pb-12">
          
          {/* Back Link */}
          <Link 
            href={`/project/${id}`} 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to project details
          </Link>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Weekly Briefing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              {isEditing ? 'Edit status update' : 'Publish status update'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              {project ? `${project.project_name} · ` : ''}{currentWeek}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Left Form Column */}
            <div className="lg:col-span-3 bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none space-y-6 backdrop-blur-md">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                      Accomplishments & Milestones
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {bullets.filter(b => b.trim()).length} item{bullets.filter(b => b.trim()).length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:from-indigo-500/25 hover:to-pink-500/25 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-500" />}
                    <span>{aiLoading ? 'Synthesizing...' : 'Auto-Draft with AI'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 font-light">
                  Add the key achievements and completed items from this week — these appear in your client portal and notification emails.
                </p>

                <div className="space-y-3">
                  {bullets.map((bullet, i) => (
                    <div 
                      key={i} 
                      className="flex gap-3 items-center bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 p-3 rounded-xl focus-within:bg-white dark:focus-within:bg-white/[0.06] focus-within:border-slate-300 dark:focus-within:border-white/20 transition-all"
                    >
                      <span 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0"
                        style={{ backgroundColor: `${project?.color ?? '#6366F1'}18`, color: project?.color ?? '#6366F1' }}
                      >
                        {i + 1}
                      </span>
                      <input
                        className="flex-grow bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                        placeholder={`Describe a milestone or accomplishment #${i + 1}`}
                        value={bullet}
                        onChange={e => {
                          const next = [...bullets]
                          next[i] = e.target.value
                          setBullets(next)
                        }}
                      />
                      {bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = bullets.filter((_, idx) => idx !== i)
                            setBullets(next)
                          }}
                          className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors p-1 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setBullets([...bullets, ''])}
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add milestone item
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Client Context & Next Steps <span className="font-normal normal-case text-slate-400">(Optional)</span>
                </label>
                <textarea
                  placeholder="Share any roadblocks, upcoming schedule notes, or questions for the client..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {error && (
                <div className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {(() => {
                const isAgencyProject = !!project?.org_id
                const canDirectSend = !isAgencyProject || userRole === 'owner' || userRole === 'admin'
                return (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmit('draft')}
                      disabled={loading || !hasContent}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-5 py-2.5 text-xs font-semibold transition-all shadow-xs flex-1 justify-center inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Save draft'}
                    </button>
                    {isAgencyProject && (
                      <button
                        type="button"
                        onClick={() => handleSubmit('review')}
                        disabled={loading || !hasContent}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 px-5 py-2.5 text-xs font-semibold transition-all shadow-xs flex-1 justify-center inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Submit for PM Review
                      </button>
                    )}
                    {canDirectSend && (
                      <button
                        type="button"
                        onClick={() => handleSubmit('send')}
                        disabled={loading || !hasContent}
                        className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2.5 text-xs transition-all shadow-xs flex-1 justify-center inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {loading ? 'Publishing...' : isEditing ? 'Save & send' : 'Send to client'}
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Right Preview Column */}
            <div className="lg:col-span-2 sticky top-8 space-y-4">
              
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Client Email Preview
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> Live
                </span>
              </div>

              {/* Email Card Preview Mockup */}
              <div className="bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xs dark:shadow-none">
                
                {/* Email Meta Info Bar */}
                <div className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500">To:</span> 
                    <span className="text-slate-700 dark:text-slate-300">{project?.client_name || 'Client'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500">Subject:</span>{' '}
                    <span className="font-medium text-slate-900 dark:text-white truncate">
                      {project?.project_name || 'Project'} Update — {currentWeek}
                    </span>
                  </div>
                </div>

                {/* Email Content Frame */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Header Banner */}
                  <div 
                    className="rounded-xl px-5 py-4 text-white space-y-1 shadow-xs"
                    style={{ backgroundColor: project?.color ?? '#6366F1' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-85">Weekly status update</div>
                    <h3 className="text-base font-bold truncate tracking-tight">{project?.project_name || 'Project Title'}</h3>
                  </div>

                  {/* Email Body */}
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed font-light">
                    <p className="font-medium text-slate-900 dark:text-white">Hi {project?.client_name || 'Client'},</p>
                    <p>Here&apos;s a breakdown of the key progress shipped on <strong className="font-semibold text-slate-900 dark:text-white">{project?.project_name || 'your project'}</strong> this week:</p>
                    
                    {/* Dynamic Bullets */}
                    <div className="space-y-2.5 pl-0.5">
                      {bullets.map((bullet, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <span 
                            className="w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${project?.color ?? '#6366F1'}20`, color: project?.color ?? '#6366F1' }}
                          >
                            ✓
                          </span>
                          <span className={`text-xs ${bullet.trim() ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                            {bullet.trim() || `Milestone accomplishment #${i + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Context Note */}
                    {note.trim() && (
                      <div className="border-l-2 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.03] rounded-r-xl px-4 py-3 text-xs italic text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                        {note}
                      </div>
                    )}

                    {/* CTA button */}
                    <div className="pt-3 text-center">
                      <span 
                        className="inline-block px-5 py-2 rounded-full text-xs font-semibold text-white shadow-xs cursor-not-allowed select-none"
                        style={{ backgroundColor: project?.color ?? '#6366F1' }}
                      >
                        View Client Portal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Plain-Text Box */}
              {hasContent && (
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-4 space-y-3 shadow-xs dark:shadow-none backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Plain Text Copy
                    </span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(generateEmailText())
                        setCopied(true)
                        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
                        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
                      }}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-[11px] font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#08090a] border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                    {generateEmailText()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

