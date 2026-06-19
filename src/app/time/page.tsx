'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Play, Square, Plus, Trash2, Clock, Timer, Check, X, Search, ChevronDown, Download } from 'lucide-react'

interface Project { id: string; project_name: string; color: string; hourly_rate: number | null }
interface Entry {
  id: string
  project_id: string | null
  description: string
  hours: number
  date: string
  projects: { project_name: string; color: string } | null
}
interface ActiveTimer { id: string; project_id: string | null; description: string; started_at: string }

// ── helpers ──────────────────────────────────────────────────────────────────

function elapsed(startedAt: string) {
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function hoursFromTimer(startedAt: string) {
  return (Date.now() - new Date(startedAt).getTime()) / 3600000
}

function pad(n: number) { return String(n).padStart(2, '0') }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function weekStart() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
}

function fmtHours(h: number) {
  const totalSecs = Math.round(h * 3600)
  const hrs  = Math.floor(totalSecs / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const secs = totalSecs % 60
  const parts: string[] = []
  if (hrs  > 0) parts.push(`${hrs}h`)
  if (mins > 0) parts.push(`${mins}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  return parts.join(' ')
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

// ── entry row ─────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onDelete,
  onSave,
}: {
  entry: Entry
  onDelete: (id: string) => void
  onSave: (id: string, desc: string, hours: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(entry.description)
  const [hrs, setHrs] = useState(String(entry.hours))
  const descRef = useRef<HTMLInputElement>(null)
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (focusTimerRef.current) clearTimeout(focusTimerRef.current) }, [])

  function startEdit() {
    setDesc(entry.description)
    setHrs(String(entry.hours))
    setEditing(true)
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    focusTimerRef.current = setTimeout(() => descRef.current?.focus(), 0)
  }

  function save() {
    const h = parseFloat(hrs)
    if (!desc.trim() || isNaN(h) || h <= 0) { cancel(); return }
    onSave(entry.id, desc.trim(), Math.round(h * 100) / 100)
    setEditing(false)
  }

  function cancel() {
    setDesc(entry.description)
    setHrs(String(entry.hours))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: entry.projects?.color ?? '#cbd5e1' }}
        />
        <input
          ref={descRef}
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          placeholder="Description"
        />
        <input
          className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm text-right text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="number" step="0.25" min="0.25"
          value={hrs}
          onChange={e => setHrs(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        />
        <button onClick={save} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 group cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
      onClick={startEdit}
    >
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: entry.projects?.color ?? '#cbd5e1' }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-900 font-medium truncate">{entry.description}</div>
        {entry.projects && (
          <div className="text-xs text-slate-400 mt-0.5">{entry.projects.project_name}</div>
        )}
      </div>
      <div className="text-sm font-bold text-slate-700 flex-shrink-0 tabular-nums">
        {fmtHours(entry.hours)}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function TimePage() {
  const [userId, setUserId]     = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries]   = useState<Entry[]>([])
  const [timer, setTimer]       = useState<ActiveTimer | null>(null)
  const [, forceRender]         = useState(0)   // clock tick

  // timer form
  const [timerDesc, setTimerDesc]       = useState('')
  const [timerProject, setTimerProject] = useState('')

  // mode: 'timer' | 'manual'
  const [mode, setMode] = useState<'timer' | 'manual'>('timer')
  const [startLoading, setStartLoading] = useState(false)
  const [startError, setStartError]     = useState('')
  const [stopError, setStopError]       = useState('')
  const [stopping, setStopping]         = useState(false)

  // manual entry form
  const [manDesc, setManDesc]       = useState('')
  const [manHours, setManHours]     = useState('')
  const [manProject, setManProject] = useState('')
  const [manDate, setManDate]       = useState(() => todayStr())
  const [saving, setSaving]         = useState(false)
  const [manError, setManError]     = useState('')

  // list filters
  const [search, setSearch]           = useState('')
  const [filterProject, setFilterProject] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [{ data: ps }, { data: es }, { data: t }] = await Promise.all([
      supabase.from('projects').select('id,project_name,color,hourly_rate').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('time_entries')
        .select('*, projects(project_name,color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('timers').select('*').eq('user_id', user.id).maybeSingle(),
    ])
    setProjects(ps ?? [])
    setEntries(es ?? [])
    setTimer(t ?? null)
    if (t) { setTimerDesc(t.description ?? ''); setTimerProject(t.project_id ?? '') }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  // clock tick every second when timer is running
  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => forceRender(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  // ── stats ──────────────────────────────────────────────────────────────────

  const today  = todayStr()
  const week   = weekStart()
  const month  = monthStart()

  const statsToday = entries.filter(e => e.date === today).reduce((s, e) => s + e.hours, 0)
  const statsWeek  = entries.filter(e => e.date >= week).reduce((s, e) => s + e.hours, 0)
  const statsMonth = entries.filter(e => e.date >= month).reduce((s, e) => s + e.hours, 0)
  const statsAll   = entries.reduce((s, e) => s + e.hours, 0)

  const billableMonth = entries
    .filter(e => e.date >= month && e.project_id)
    .reduce((s, e) => {
      const rate = projects.find(p => p.id === e.project_id)?.hourly_rate ?? 0
      return s + e.hours * rate
    }, 0)
  const hasBillable = projects.some(p => p.hourly_rate)

  // ── actions ────────────────────────────────────────────────────────────────

  async function startTimer() {
    if (!userId || startLoading || timerRunning) return
    setStartLoading(true)
    setStartError('')
    const supabase = createClient()
    const { data, error } = await supabase.from('timers').insert({
      user_id: userId,
      project_id: timerProject || null,
      description: timerDesc || 'Untitled',
    }).select().single()
    if (error || !data) {
      setStartError(error?.message ?? 'Failed to start timer.')
      setStartLoading(false)
      return
    }
    setTimer(data)
    setStartLoading(false)
  }

  async function stopTimer() {
    if (!timer || !userId) return
    setStopping(true)
    setStopError('')
    const rawHours = hoursFromTimer(timer.started_at)
    const hours = Math.max(0.000278, rawHours)
    const supabase = createClient()
    // Persist the entry FIRST so a failure never loses tracked time — the timer
    // stays running and the user can retry. Only delete the timer once the
    // entry is safely saved. (A DB-side RPC would make this fully atomic.)
    const { error: insertErr } = await supabase.from('time_entries').insert({
      user_id: userId,
      project_id: timer.project_id || null,
      description: timer.description || 'Untitled',
      hours,
      date: todayStr(),
    })
    if (insertErr) {
      setStopError(insertErr.message)
      setStopping(false)
      return
    }
    await supabase.from('timers').delete().eq('user_id', userId)
    setTimer(null)
    setTimerDesc('')
    setTimerProject('')
    setStopping(false)
    await load()
  }

  async function addManual(e: { preventDefault(): void }) {
    e.preventDefault()
    const hrs = parseFloat(manHours)
    if (!userId || !manDesc.trim() || isNaN(hrs) || hrs <= 0) return
    setSaving(true)
    setManError('')
    const supabase = createClient()
    const { error } = await supabase.from('time_entries').insert({
      user_id: userId,
      project_id: manProject || null,
      description: manDesc.trim(),
      hours: Math.round(hrs * 100) / 100,
      date: manDate,
    })
    if (error) {
      setManError(error.message)
      setSaving(false)
      return
    }
    setManDesc(''); setManHours(''); setManProject(''); setManDate(todayStr())
    await load()
    setSaving(false)
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('time_entries').delete().eq('id', id)
    if (error) { await load(); return }   // write failed — resync from the server
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function saveEdit(id: string, desc: string, hours: number) {
    const supabase = createClient()
    const { error } = await supabase.from('time_entries').update({ description: desc, hours }).eq('id', id)
    if (error) { await load(); return }   // write failed — resync from the server
    setEntries(prev => prev.map(e => e.id === id ? { ...e, description: desc, hours } : e))
  }

  // ── filtered + grouped entries ─────────────────────────────────────────────

  const filtered = entries.filter(e => {
    if (filterProject && e.project_id !== filterProject) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!e.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  const grouped = filtered.reduce<Record<string, Entry[]>>((acc, e) => {
    acc[e.date] = [...(acc[e.date] ?? []), e]
    return acc
  }, {})

  const timerRunning = !!timer

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Time tracker</h1>
            <p className="text-slate-500 text-sm mt-1">Track hours across your projects.</p>
          </div>
          <a
            href="/api/export-csv?type=time"
            download
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Download className="w-3.5 h-3.5" />Export CSV
          </a>
        </div>

        {/* Stats strip */}
        <div className={`grid gap-4 mb-6 ${hasBillable ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <StatCard label="Today"      value={fmtHours(statsToday)}  sub={new Date().toLocaleDateString('en-US', { weekday: 'long' })} />
          <StatCard label="This week"  value={fmtHours(statsWeek)}   sub="Mon → today" />
          <StatCard label="This month" value={fmtHours(statsMonth)}  sub={new Date().toLocaleDateString('en-US', { month: 'long' })} />
          <StatCard label="All time"   value={fmtHours(statsAll)}    sub={`${entries.length} entries`} />
          {hasBillable && (
            <StatCard
              label="Billable (month)"
              value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(billableMonth)}
              sub="based on hourly rates"
            />
          )}
        </div>

        {/* Timer / Manual input card */}
        <div className={`rounded-xl border mb-8 overflow-hidden transition-all duration-300 ${timerRunning ? 'border-indigo-500' : 'border-slate-200'}`}>

          {timerRunning ? (
            /* ── Running state ───────────────────────────────────── */
            <div className="bg-indigo-600 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Recording</span>
                  </div>
                  <div className="text-6xl font-mono font-bold text-white tracking-tight mb-3">
                    {elapsed(timer!.started_at)}
                  </div>
                  <div className="text-indigo-200 text-base font-medium">{timer!.description}</div>
                  {timer!.project_id && (() => {
                    const p = projects.find(p => p.id === timer!.project_id)
                    return p ? (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-sm text-indigo-300">{p.project_name}</span>
                      </div>
                    ) : null
                  })()}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={stopTimer}
                    loading={stopping}
                    className="flex-shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Square className="w-4 h-4" />Stop & save
                  </Button>
                  {stopError && (
                    <span className="text-xs text-red-300 max-w-xs text-right">{stopError}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Idle state ──────────────────────────────────────── */
            <div className="bg-white">
              {/* Mode tabs */}
              <div className="flex border-b border-slate-100">
                {(['timer', 'manual'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                      mode === m
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'timer' ? <Timer className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {m === 'timer' ? 'Timer' : 'Manual'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {mode === 'timer' ? (
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <input
                        className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        placeholder="What are you working on?"
                        value={timerDesc}
                        onChange={e => setTimerDesc(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && startTimer()}
                      />
                      <select
                        value={timerProject}
                        onChange={e => setTimerProject(e.target.value)}
                        className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                      >
                        <option value="">No project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                      </select>
                      <Button onClick={startTimer} loading={startLoading} className="px-5">
                        <Play className="w-4 h-4" />Start
                      </Button>
                    </div>
                    {startError && (
                      <p className="text-xs text-red-600">{startError}</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={addManual} className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        placeholder="What did you work on?"
                        value={manDesc}
                        onChange={e => setManDesc(e.target.value)}
                        required
                      />
                      <input
                        type="number" step="0.25" min="0.25"
                        className="w-28 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-right"
                        placeholder="Hours"
                        value={manHours}
                        onChange={e => setManHours(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={manProject}
                        onChange={e => setManProject(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                      >
                        <option value="">No project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                      </select>
                      <input
                        type="date"
                        className="w-40 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        value={manDate}
                        onChange={e => setManDate(e.target.value)}
                      />
                      <Button type="submit" loading={saving}>
                        <Plus className="w-4 h-4" />Add
                      </Button>
                    </div>
                    {manError && (
                      <p className="text-xs text-red-600">{manError}</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Entry list */}
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No time logged yet</h3>
            <p className="text-slate-500 text-sm">Start a timer or add a manual entry above.</p>
          </div>
        ) : (
          <>
            {/* Filter row */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search entries…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <select
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">All projects</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
                <p className="text-slate-500 text-sm">No entries match your filters.</p>
                <button
                  onClick={() => { setSearch(''); setFilterProject('') }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([date, dayEntries]) => {
                  const dayTotal = dayEntries.reduce((s, e) => s + e.hours, 0)
                  return (
                    <div key={date}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-sm font-semibold text-slate-700">{fmtDate(date)}</div>
                        <div className="text-sm font-semibold text-slate-400 tabular-nums">{fmtHours(dayTotal)}</div>
                      </div>
                      <div className="space-y-2">
                        {dayEntries.map(entry => (
                          <EntryRow
                            key={entry.id}
                            entry={entry}
                            onDelete={deleteEntry}
                            onSave={saveEdit}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
