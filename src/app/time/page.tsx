'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Play, Square, Plus, Trash2, Clock, Timer, Check, X, Search, ChevronDown, Download, Calendar, TrendingUp, Layers, DollarSign } from 'lucide-react'

interface Project { id: string; project_name: string; color: string; hourly_rate: number | null }
interface Entry {
  id: string
  project_id: string | null
  description: string
  hours: number
  date: string
  source?: string | null
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

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">{sub}</div>}
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
      <div className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-white/20 bg-slate-50 dark:bg-white/[0.04] px-4 py-3 ring-1 ring-indigo-500/20 dark:ring-white/10">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: entry.projects?.color ?? '#94a3b8' }}
        />
        <input
          ref={descRef}
          className="flex-1 min-w-0 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          placeholder="Description"
        />
        <input
          className="w-20 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-right text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 dark:focus:border-white/30"
          type="number" step="0.25" min="0.25"
          value={hrs}
          onChange={e => setHrs(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        />
        <button onClick={save} className="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 hover:bg-slate-50 dark:hover:bg-white/[0.03] px-4 py-3.5 group cursor-pointer ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none transition-all"
      onClick={startEdit}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: entry.projects?.color ?? '#94a3b8' }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-900 dark:text-white truncate">{entry.description}</span>
          {entry.source === 'extension' && (
            <span className="inline-flex items-center text-[10px] font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 flex-shrink-0">
              VS Code
            </span>
          )}
        </div>
        {entry.projects && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{entry.projects.project_name}</div>
        )}
      </div>
      <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-200 flex-shrink-0 tabular-nums">
        {fmtHours(entry.hours)}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function TimePage() {
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId]     = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [entries, setEntries]   = useState<Entry[]>([])
  const [timer, setTimer]       = useState<ActiveTimer | null>(null)
  const [, forceRender]         = useState(0)   // clock tick

  useEffect(() => {
    setMounted(true)
  }, [])

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
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Time Tracking
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Time Tracker
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Track hours, monitor engineering rhythm, and manage billable sessions.
              </p>
            </div>
            <a
              href="/api/export-csv?type=time"
              download
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all w-fit shadow-xs dark:shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>

          {/* Stats strip */}
          <div className={`grid gap-4 ${hasBillable ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
            <StatCard
              label="Today"
              value={fmtHours(statsToday)}
              sub={mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long' }) : ''}
              icon={Clock}
            />
            <StatCard
              label="This week"
              value={fmtHours(statsWeek)}
              sub="Mon → today"
              icon={Calendar}
            />
            <StatCard
              label="This month"
              value={fmtHours(statsMonth)}
              sub={mounted ? new Date().toLocaleDateString('en-US', { month: 'long' }) : ''}
              icon={TrendingUp}
            />
            <StatCard
              label="All time"
              value={fmtHours(statsAll)}
              sub={`${entries.length} recorded entries`}
              icon={Layers}
            />
            {hasBillable && (
              <StatCard
                label="Billable (month)"
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(billableMonth)}
                sub="based on hourly rates"
                icon={DollarSign}
              />
            )}
          </div>

          {/* Timer / Manual input card */}
          <div className="transition-all duration-300">
            {timerRunning ? (
              /* ── Running state ───────────────────────────────────── */
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-[#0c0d12]/95 p-6 sm:p-8 ring-1 ring-emerald-500/20 shadow-lg dark:shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-medium">
                        Active Recording Session
                      </span>
                    </div>
                    <div className="text-5xl sm:text-6xl font-mono font-light text-slate-900 dark:text-white tracking-tight mb-3">
                      {elapsed(timer!.started_at)}
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{timer!.description}</div>
                    {timer!.project_id && (() => {
                      const p = projects.find(p => p.id === timer!.project_id)
                      return p ? (
                        <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span>{p.project_name}</span>
                        </div>
                      ) : null
                    })()}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <button
                      onClick={stopTimer}
                      disabled={stopping}
                      className="rounded-full bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-300 px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{stopping ? 'Saving session...' : 'Stop & Save'}</span>
                    </button>
                    {stopError && (
                      <span className="text-xs text-rose-600 dark:text-rose-400 max-w-xs">{stopError}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Idle state ──────────────────────────────────────── */
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden">
                {/* Mode tabs */}
                <div className="flex items-center gap-1 p-3 border-b border-slate-100 dark:border-white/5">
                  {(['timer', 'manual'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-all capitalize cursor-pointer ${
                        mode === m
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                      }`}
                    >
                      {m === 'timer' ? <Timer className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{m === 'timer' ? 'Live Timer' : 'Manual Entry'}</span>
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {mode === 'timer' ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          className="flex-1 px-4 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-light"
                          placeholder="What are you working on right now?"
                          value={timerDesc}
                          onChange={e => setTimerDesc(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && startTimer()}
                        />
                        <select
                          value={timerProject}
                          onChange={e => setTimerProject(e.target.value)}
                          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0c0d12] text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all cursor-pointer"
                        >
                          <option value="">Select Project (Optional)</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.project_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={startTimer}
                          disabled={startLoading}
                          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-semibold px-5 py-2.5 text-xs dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{startLoading ? 'Starting...' : 'Start'}</span>
                        </button>
                      </div>
                      {startError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">{startError}</p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={addManual} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          className="flex-1 px-4 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-light"
                          placeholder="What did you work on?"
                          value={manDesc}
                          onChange={e => setManDesc(e.target.value)}
                          required
                        />
                        <input
                          type="number" step="0.25" min="0.25"
                          className="w-full sm:w-28 px-4 py-2.5 text-xs font-mono border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all text-right"
                          placeholder="Hours"
                          value={manHours}
                          onChange={e => setManHours(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={manProject}
                          onChange={e => setManProject(e.target.value)}
                          className="flex-1 px-3 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0c0d12] text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all cursor-pointer"
                        >
                          <option value="">No project</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.project_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          className="px-3 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all"
                          value={manDate}
                          onChange={e => setManDate(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-semibold px-5 py-2.5 text-xs dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-sm flex-shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{saving ? 'Adding...' : 'Log Time'}</span>
                        </button>
                      </div>
                      {manError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">{manError}</p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Entry list */}
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#0c0d12]/60 p-16 text-center ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-normal text-lg text-slate-900 dark:text-white mb-1">No time logged yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light">Start a live timer or log a manual entry above to establish your timeline.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search entries…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-light"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterProject}
                    onChange={e => setFilterProject(e.target.value)}
                    className="appearance-none bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-full pl-4 pr-9 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 cursor-pointer"
                  >
                    <option value="">All projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 py-12 text-center ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-light">No entries match your search criteria.</p>
                  <button
                    onClick={() => { setSearch(''); setFilterProject('') }}
                    className="mt-2 text-xs text-indigo-600 dark:text-white hover:underline font-medium"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([date, dayEntries]) => {
                    const dayTotal = dayEntries.reduce((s, e) => s + e.hours, 0)
                    return (
                      <div key={date} className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{fmtDate(date)}</span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">({dayEntries.length})</span>
                          </div>
                          <div className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                            {fmtHours(dayTotal)}
                          </div>
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
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
