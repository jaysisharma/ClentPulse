'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

import { DarkShell } from '@/components/layout/dark-shell'

interface Note {
  id: string
  date: string
  title: string | null
  decisions: string[]
  action_items: string[]
  created_at: string
}

export default function MeetingNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [decisions, setDecisions] = useState([''])
  const [actionItems, setActionItems] = useState([''])

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setUserId(user.id)
    const { data } = await supabase.from('meeting_notes').select('*').eq('project_id', id).order('date', { ascending: false })
    setNotes(data ?? [])
  }, [id, router])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  function updateList(list: string[], setter: (v: string[]) => void, i: number, val: string) {
    const next = [...list]; next[i] = val; setter(next)
  }
  function addItem(list: string[], setter: (v: string[]) => void) { setter([...list, '']) }
  function removeItem(list: string[], setter: (v: string[]) => void, i: number) { setter(list.filter((_, j) => j !== i)) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('meeting_notes').insert({
      project_id: id,
      user_id: userId,
      date,
      title: title || null,
      decisions: decisions.filter(d => d.trim()),
      action_items: actionItems.filter(a => a.trim()),
    })
    setTitle(''); setDate(new Date().toISOString().slice(0, 10))
    setDecisions(['']); setActionItems([''])
    setShowForm(false); setSaving(false)
    load()
  }

  async function del(noteId: string) {
    const supabase = createClient()
    await supabase.from('meeting_notes').delete().eq('id', noteId)
    setNotes(n => n.filter(x => x.id !== noteId))
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-2xl animate-fade-in relative z-10 pb-12">
          {/* Back link */}
          <Link 
            href={`/project/${id}`} 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to project
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Client Briefings
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Meeting notes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Decisions and action items from client syncs and calls.
              </p>
            </div>
            <button 
              onClick={() => setShowForm(s => !s)}
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              {showForm ? 'Close form' : 'New note'}
            </button>
          </div>

          {/* New Note Form */}
          {showForm && (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 mb-6 shadow-xs dark:shadow-none space-y-5 backdrop-blur-md">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors" 
                    placeholder="Meeting title (optional)" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                  <input 
                    type="date" 
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                    Decisions made
                  </label>
                  <div className="space-y-2">
                    {decisions.map((d, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors" 
                          placeholder="e.g. Approved mobile wireframes" 
                          value={d} 
                          onChange={e => updateList(decisions, setDecisions, i, e.target.value)} 
                        />
                        {decisions.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItem(decisions, setDecisions, i)} 
                            className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => addItem(decisions, setDecisions)} 
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-xs font-semibold transition-colors inline-flex items-center gap-1 mt-2.5"
                  >
                    <Plus className="w-3 h-3" /> Add decision
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                    Action items
                  </label>
                  <div className="space-y-2">
                    {actionItems.map((a, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors" 
                          placeholder="e.g. Export Figma design tokens" 
                          value={a} 
                          onChange={e => updateList(actionItems, setActionItems, i, e.target.value)} 
                        />
                        {actionItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItem(actionItems, setActionItems, i)} 
                            className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => addItem(actionItems, setActionItems)} 
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3 py-1 text-xs font-semibold transition-colors inline-flex items-center gap-1 mt-2.5"
                  >
                    <Plus className="w-3 h-3" /> Add action item
                  </button>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-xs disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save note'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notes List */}
          {!notes.length ? (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center text-xs text-slate-400 dark:text-slate-500 font-light backdrop-blur-md">
              No meeting notes logged yet. Record decisions and action items from client calls to keep everyone aligned.
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden backdrop-blur-md shadow-xs dark:shadow-none transition-all"
                >
                  <button 
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors" 
                    onClick={() => setExpanded(e => e === note.id ? null : note.id)}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {note.title || 'Meeting note'}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {new Date(note.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {note.decisions.length} decisions · {note.action_items.length} actions
                      </span>
                      {expanded === note.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </button>

                  {expanded === note.id && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-white/5 space-y-4">
                      {note.decisions.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Decisions
                          </div>
                          <ul className="space-y-1.5">
                            {note.decisions.map((d, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {note.action_items.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                            Action items
                          </div>
                          <ul className="space-y-1.5">
                            {note.action_items.map((a, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                                <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 flex-shrink-0 mt-0.5" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button 
                        onClick={() => del(note.id)} 
                        className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium mt-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete note
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}

