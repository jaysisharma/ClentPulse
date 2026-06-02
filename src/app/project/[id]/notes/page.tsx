'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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
      <div className="max-w-2xl animate-fade-in">
        <Link href={`/project/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to project
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Meeting notes</h1>
            <p className="text-slate-500 text-sm mt-1">Decisions and action items from client calls.</p>
          </div>
          <Button onClick={() => setShowForm(s => !s)}><Plus className="w-4 h-4" />New note</Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Meeting title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
                <input type="date" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={date} onChange={e => setDate(e.target.value)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Decisions made</label>
                {decisions.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Decision…" value={d} onChange={e => updateList(decisions, setDecisions, i, e.target.value)} />
                    {decisions.length > 1 && <button type="button" onClick={() => removeItem(decisions, setDecisions, i)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => addItem(decisions, setDecisions)} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">+ Add decision</button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Action items</label>
                {actionItems.map((a, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Action item…" value={a} onChange={e => updateList(actionItems, setActionItems, i, e.target.value)} />
                    {actionItems.length > 1 && <button type="button" onClick={() => removeItem(actionItems, setActionItems, i)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => addItem(actionItems, setActionItems)} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">+ Add action item</button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" loading={saving}>Save note</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {!notes.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-400">
            No meeting notes yet. Log decisions and action items from client calls.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors" onClick={() => setExpanded(e => e === note.id ? null : note.id)}>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 text-sm">{note.title || 'Meeting note'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(note.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{note.decisions.length} decisions · {note.action_items.length} actions</span>
                    {expanded === note.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {expanded === note.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 space-y-4">
                    {note.decisions.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-2">Decisions</div>
                        <ul className="space-y-1.5">
                          {note.decisions.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {note.action_items.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-2">Action items</div>
                        <ul className="space-y-1.5">
                          {note.action_items.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="w-3.5 h-3.5 rounded border border-slate-300 flex-shrink-0 mt-0.5" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button onClick={() => del(note.id)} className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium mt-2">
                      <Trash2 className="w-3.5 h-3.5" />Delete note
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
