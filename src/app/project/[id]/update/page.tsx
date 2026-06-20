'use client'

import { useState, use, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Copy, Check, Mail, Eye, Plus, Trash2 } from 'lucide-react'
import { getWeekOf } from '@/lib/utils'

export default function UpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = !!editId

  const router = useRouter()
  const [bullets, setBullets] = useState(['', '', ''])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [project, setProject] = useState<{ project_name: string; client_name: string; color: string; slug: string } | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('project_name,client_name,color,slug').eq('id', id).single()
      .then(({ data }: { data: any }) => setProject(data))

    if (editId) {
      supabase.from('updates').select('*').eq('id', editId).single().then(({ data }: { data: any }) => {
        if (data) {
          setBullets(data.bullets ?? ['', '', ''])
          setNote(data.note ?? '')
        }
      })
    }
  }, [id, editId])

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

  async function handleSubmit(send: boolean) {
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

    if (isEditing && editId) {
      const { error: err } = await supabase
        .from('updates')
        .update({
          bullets: filteredBullets,
          note: note || null,
          ...(send ? { sent_at: new Date().toISOString() } : {}),
        })
        .eq('id', editId)

      if (err) { setError(err.message); setLoading(false); return }

      if (send) {
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
          sent_at: send ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (err) { setError(err.message); setLoading(false); return }

      if (send && update) {
        try {
          await fetch('/api/send-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updateId: update.id, projectId: id }),
          })
        } catch {}
      }
    }

    router.push(`/project/${id}?${send ? 'sent=true' : 'saved=true'}`)
  }

  const hasContent = bullets.some(b => b.trim().length > 0)
  const currentWeek = getWeekOf(new Date())

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6 max-w-6xl">
        
        {/* Back Link */}
        <Link href={`/project/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to project details
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? 'Edit status update' : 'Publish status update'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {project ? `${project.project_name} · ` : ''}{currentWeek}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left Form Column */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Progress updates</h3>
              </div>

              <p className="text-xs text-slate-400 -mt-1">Add the concrete wins from this week — these become the update your client sees.</p>

              <div className="space-y-3">
                {bullets.map((bullet, i) => (
                  <div key={i} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl focus-within:bg-white dark:bg-slate-900 focus-within:border-indigo-200 transition-all">
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `${project?.color ?? '#6366F1'}15`, color: project?.color ?? '#6366F1' }}
                    >
                      {i + 1}
                    </span>
                    <input
                      className="flex-grow bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      placeholder={`State a concrete weekly accomplishment #${i + 1}`}
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
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBullets([...bullets, ''])}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add progress item
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Textarea
                label="Client Context Note (Optional)"
                placeholder="Share any blockers, general context, next steps, or warm messages for the client..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => handleSubmit(false)}
                loading={loading}
                disabled={!hasContent}
                className="flex-1 justify-center py-2.5"
              >
                {isEditing ? 'Save changes' : 'Save draft'}
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                loading={loading}
                disabled={!hasContent}
                className="flex-1 justify-center py-2.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {isEditing ? 'Save & send' : 'Send to client'}
              </Button>
            </div>
          </div>

          {/* Right Preview Column */}
          <div className="lg:col-span-2 sticky top-8 space-y-4">
            
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email preview</span>
              <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Eye className="w-3 h-3" /> Live
              </span>
            </div>

            {/* Email Card Preview Mockup */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              
              {/* Fake Email Meta Info Bar */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div><span className="font-semibold text-slate-400">To:</span> {project?.client_name || 'Client'}</div>
                <div>
                  <span className="font-semibold text-slate-400">Subject:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {project?.project_name || 'Project'} Update — {currentWeek}
                  </span>
                </div>
              </div>

              {/* Email Content Frame */}
              <div className="p-6 bg-white dark:bg-slate-900 space-y-5">
                {/* Header Banner */}
                <div 
                  className="rounded-xl px-5 py-4 text-white space-y-1 shadow-sm"
                  style={{ backgroundColor: project?.color ?? '#6366F1' }}
                >
                  <div className="text-[10px] font-semibold opacity-75">Weekly update</div>
                  <h3 className="text-base font-bold truncate">{project?.project_name || 'Project Title'}</h3>
                </div>

                {/* Email Body */}
                <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                  <p className="font-medium">Hi {project?.client_name || 'Client Name'},</p>
                  <p>Here&apos;s a breakdown of the achievements we shipped on **{project?.project_name || 'your project'}** this week:</p>
                  
                  {/* Dynamic Bullets */}
                  <div className="space-y-3 pl-1">
                    {bullets.map((bullet, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <span 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${project?.color ?? '#6366F1'}15`, color: project?.color ?? '#6366F1' }}
                        >
                          ✓
                        </span>
                        <span className={`text-xs ${bullet.trim() ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-300 italic'}`}>
                          {bullet.trim() || `Milestone accomplishment #${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Context Note */}
                  {note.trim() && (
                    <div className="border-l-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-r-xl px-4 py-3 text-xs italic text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                      {note}
                    </div>
                  )}

                  {/* CTA button */}
                  <div className="pt-4 text-center">
                    <span 
                      className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-not-allowed select-none"
                      style={{ backgroundColor: project?.color ?? '#6366F1' }}
                    >
                      View Live Client Portal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Plain-Text Box (Toggle/Accordian styling) */}
            {hasContent && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Plain text
                  </span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(generateEmailText())
                      setCopied(true)
                      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
                      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {generateEmailText()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
