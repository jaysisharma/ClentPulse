'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Check, Trash2, ShieldAlert, Copy, Loader2,
  Key, ShieldCheck, Globe, Zap, Clock, CheckSquare,
  ListChecks, Users, Lock, Settings, LayoutDashboard,
  BarChart3, Target, Plus, ExternalLink,
} from 'lucide-react'

import { DarkShell } from '@/components/layout/dark-shell'
import { KpiSnapshotStrip } from '@/components/project/kpi-snapshot-strip'
import { resolveModules, DEFAULT_MODULES } from '@/lib/modules'
import type { WorkspaceModules } from '@/types'

const COLORS = [
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EAB308', name: 'Yellow' },
  { hex: '#22C55E', name: 'Green' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#3B82F6', name: 'Blue' },
]

const TABS = [
  { id: 'general',    label: 'General',             icon: Settings },
  { id: 'marketing',  label: 'Marketing & KPIs',    icon: BarChart3 },
  { id: 'client',     label: 'Client',              icon: Users },
  { id: 'visibility', label: 'Visibility',          icon: Globe },
  { id: 'danger',     label: 'Danger zone',         icon: ShieldAlert },
] as const

type Tab = typeof TABS[number]['id']

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button 
      type="submit" 
      disabled={loading}
      className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : saved ? (
        <><Check className="w-3.5 h-3.5 text-emerald-500" /> Saved</>
      ) : (
        'Save changes'
      )}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none p-0.5 ${
        checked ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-white/10'
      }`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs transition duration-200 ${
        checked ? 'translate-x-4 bg-white dark:bg-slate-950' : 'translate-x-0 bg-white dark:bg-slate-400'
      }`} />
    </button>
  )
}

function ToggleRow({
  icon: Icon, label, description, checked, onChange, iconColor = 'text-slate-700 dark:text-slate-300',
}: {
  icon: React.ElementType; label: string; description: string
  checked: boolean; onChange: (v: boolean) => void
  iconColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">{label}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light leading-normal">{description}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('general')

  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [budget, setBudget] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [passcode, setPasscode] = useState('')
  const [hideMilestones, setHideMilestones] = useState(false)
  const [hideClientAccess, setHideClientAccess] = useState(false)
  const [hideKickoff, setHideKickoff] = useState(false)
  const [hideApprovals, setHideApprovals] = useState(false)
  const [showLivePresence, setShowLivePresence] = useState(true)
  const [showTimeLogged, setShowTimeLogged] = useState(false)
  const [color, setColor] = useState(COLORS[0].hex)
  const [kpis, setKpis] = useState<Array<{ label: string; value: string; trend?: string }>>([])
  const [reportEmbedUrl, setReportEmbedUrl] = useState('')
  const [reportEmbedTitle, setReportEmbedTitle] = useState('Live Performance Report')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [portalPassword, setPortalPassword] = useState('')
  const [portalSaving, setPortalSaving] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [portalShare, setPortalShare] = useState<{ email: string; password: string; updated: boolean } | null>(null)
  const [copied, setCopied] = useState<'url' | 'email' | 'password' | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [modules, setModules] = useState<WorkspaceModules>(DEFAULT_MODULES)

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }: { data: any }) => {
      if (!data) { setNotFound(true); return }
      setProjectName(data.project_name)
      setClientName(data.client_name)
      setClientEmail(data.client_email ?? '')
      setBudget(data.budget ? String(data.budget) : '')
      setHourlyRate(data.hourly_rate ? String(data.hourly_rate) : '')
      setColor(data.color)
      setHideMilestones(data.hide_milestones ?? false)
      setHideClientAccess(data.hide_client_access ?? false)
      setHideKickoff(data.hide_kickoff ?? false)
      setHideApprovals(data.hide_approvals ?? false)
      setShowLivePresence(data.show_live_presence ?? true)
      setShowTimeLogged(data.show_time_logged ?? false)
      setPasscode(data.passcode ?? '')
      if (Array.isArray(data.kpis)) setKpis(data.kpis)
      setReportEmbedUrl(data.report_embed_url ?? '')
      setReportEmbedTitle(data.report_embed_title ?? 'Live Performance Report')
    })

    supabase.auth.getUser().then(async ({ data }: { data: any }) => {
      if (data?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('enabled_modules')
          .eq('id', data.user.id)
          .single()
        if (userProfile?.enabled_modules) {
          const resolved = resolveModules(userProfile.enabled_modules)
          setModules(resolved)
          if (resolved.marketing === false && tab === 'marketing') {
            setTab('general')
          }
        }
      }
    })
  }, [id, tab])

  function flash() {
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  async function handleSave(e?: { preventDefault(): void }) {
    e?.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('projects').update({
      project_name: projectName, client_name: clientName,
      client_email: clientEmail || null, color,
      budget: budget ? parseFloat(budget) : null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      hide_milestones: hideMilestones, hide_client_access: hideClientAccess,
      hide_kickoff: hideKickoff, hide_approvals: hideApprovals,
      show_live_presence: showLivePresence, show_time_logged: showTimeLogged,
      passcode: passcode || null,
      kpis,
      report_embed_url: reportEmbedUrl.trim() || null,
      report_embed_title: reportEmbedTitle.trim() || null,
    }).eq('id', id)
    setLoading(false)
    if (err) { setError(err.message); return }
    flash()
  }

  async function handleDuplicate() {
    if (!confirm('Duplicate this project?')) return
    setDuplicating(true)
    const res = await fetch('/api/duplicate-project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id }) })
    const data = await res.json()
    setDuplicating(false)
    if (res.ok) router.push(`/project/${data.id}`)
    else setError(data.error ?? 'Failed to duplicate.')
  }

  function generatePortalPassword() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const maxUnbiased = 256 - (256 % charset.length)
    const out: string[] = []
    while (out.length < 12) {
      for (const b of crypto.getRandomValues(new Uint8Array(16))) {
        if (b < maxUnbiased) { out.push(charset[b % charset.length]); if (out.length === 12) break }
      }
    }
    setPortalPassword(out.join(''))
  }

  async function handleSetPortalPassword(e: { preventDefault(): void }) {
    e.preventDefault()
    if (portalPassword.length < 6) { setPortalError('Password must be at least 6 characters.'); return }
    setPortalSaving(true); setPortalError('')
    const res = await fetch('/api/client-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: id, password: portalPassword }) })
    const data = await res.json()
    setPortalSaving(false)
    if (!res.ok) { setPortalError(data.error ?? 'Could not set portal access.'); return }
    setPortalShare({ email: data.email, password: portalPassword, updated: data.updated })
  }

  function copyText(text: string, field: 'url' | 'email' | 'password') {
    navigator.clipboard.writeText(text)
    setCopied(field)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete() {
    if (!confirm('Delete this project permanently? This cannot be undone.')) return
    setDeleting(true)
    await createClient().from('projects').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (notFound) return (
    <AppLayout>
      <DarkShell>
        <div className="text-slate-500 text-sm p-8">Project not found.</div>
      </DarkShell>
    </AppLayout>
  )

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const selectedColor = COLORS.find(c => c.hex === color)

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-4xl mx-auto animate-fade-in relative z-10 pb-12">

          {/* Header */}
          <div className="mb-6">
            <Link 
              href={`/project/${id}`} 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to project
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Workspace Configuration
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Project Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Manage parameters, client credentials, and dashboard visibility.
            </p>
          </div>

          {/* Tab layout */}
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* ── Left nav ── */}
            <nav className="w-full md:w-48 flex-shrink-0 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
              {TABS.filter(t => {
                if (t.id === 'marketing' && modules.marketing === false) return false
                return true
              }).map(t => {
                const Icon = t.icon
                const active = tab === t.id
                const isDanger = t.id === 'danger'
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 md:w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left whitespace-nowrap ${
                      active
                        ? isDanger
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : isDanger
                        ? 'text-rose-500 hover:bg-rose-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {t.label}
                  </button>
                )
              })}
            </nav>

            {/* ── Right panel ── */}
            <div className="flex-1 min-w-0">

              {/* ─── General ─── */}
              {tab === 'general' && (
                <form onSubmit={handleSave} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">General Parameters</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Project title, financial budget, and color accent.</p>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Project Title
                      </label>
                      <input 
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                        value={projectName} 
                        onChange={e => setProjectName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Budget (USD)
                        </label>
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                          value={budget} 
                          onChange={e => setBudget(e.target.value)} 
                          placeholder="e.g. 5000" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Hourly Rate ($/hr)
                        </label>
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                          value={hourlyRate} 
                          onChange={e => setHourlyRate(e.target.value)} 
                          placeholder="e.g. 150" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Accent Color {selectedColor && <span className="text-[11px] font-normal normal-case text-slate-400 dark:text-slate-500 ml-1">({selectedColor.name})</span>}
                      </label>
                      <div className="flex gap-2.5 flex-wrap">
                        {COLORS.map(c => (
                          <button 
                            key={c.hex} 
                            type="button" 
                            title={c.name} 
                            onClick={() => setColor(c.hex)}
                            className="w-7 h-7 rounded-full transition-all hover:scale-110 focus:outline-none"
                            style={{ backgroundColor: c.hex, boxShadow: color === c.hex ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : 'none' }}
                          />
                        ))}
                      </div>
                    </div>
                    {error && (
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <SaveButton loading={loading} saved={saved} />
                  </div>
                </form>
              )}

              {/* ─── Marketing & KPIs ─── */}
              {tab === 'marketing' && (
                <form onSubmit={handleSave} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Marketing & Performance Analytics</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Configure custom campaign KPI metrics and live embedded reports for your client portal.</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Section 1: KPI Snapshot Strip */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Campaign KPI Cards <span className="font-normal normal-case text-slate-400">({kpis.length}/4)</span>
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Showcase business impact (ROAS, CPA, Leads, Spend) at the top of the client portal.
                          </p>
                        </div>

                        {kpis.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setKpis([...kpis, { label: '', value: '', trend: '' }])}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs self-start cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add KPI Card</span>
                          </button>
                        )}
                      </div>

                      {/* Quick presets */}
                      {kpis.length === 0 && (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-center space-y-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">No KPIs configured yet. Click to add a preset:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {[
                              { label: 'Blended ROAS', value: '3.8x', trend: '+14%' },
                              { label: 'Monthly Ad Spend', value: '$8,500', trend: 'On track' },
                              { label: 'Cost Per Lead (CPA)', value: '$18.40', trend: '-8%' },
                              { label: 'Conversions', value: '248', trend: '+22%' },
                            ].map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setKpis(prev => prev.length < 4 ? [...prev, preset] : prev)}
                                className="px-2.5 py-1 text-xs rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
                              >
                                + {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* KPI cards list */}
                      {kpis.length > 0 && (
                        <div className="space-y-3">
                          {kpis.map((kpi, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center gap-3">
                              <div className="w-full sm:flex-1">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Metric Name</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Blended ROAS"
                                  value={kpi.label}
                                  onChange={e => {
                                    const next = [...kpis]
                                    next[idx] = { ...next[idx], label: e.target.value }
                                    setKpis(next)
                                  }}
                                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                                />
                              </div>

                              <div className="w-full sm:w-36">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Current Value</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 3.8x"
                                  value={kpi.value}
                                  onChange={e => {
                                    const next = [...kpis]
                                    next[idx] = { ...next[idx], value: e.target.value }
                                    setKpis(next)
                                  }}
                                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                                />
                              </div>

                              <div className="w-full sm:w-36">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Trend / Comparison</label>
                                <input
                                  type="text"
                                  placeholder="e.g. +14%"
                                  value={kpi.trend ?? ''}
                                  onChange={e => {
                                    const next = [...kpis]
                                    next[idx] = { ...next[idx], trend: e.target.value }
                                    setKpis(next)
                                  }}
                                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12] px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => setKpis(kpis.filter((_, i) => i !== idx))}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors self-end sm:self-center mt-2 sm:mt-4 cursor-pointer"
                                title="Remove KPI"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {/* Live preview */}
                          <div className="pt-2">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Live Portal Preview</span>
                            <KpiSnapshotStrip kpis={kpis} accentColor={color} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Live Embedded Performance Report */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Live Embedded Report <span className="font-normal normal-case text-slate-400">(Looker Studio / Sheets / BI)</span>
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                          Adds an interactive &quot;Reports&quot; tab on your client portal embedding your external performance dashboard.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Report Tab Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Q3 Performance Dashboard"
                            value={reportEmbedTitle}
                            onChange={e => setReportEmbedTitle(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Embed URL (Looker Studio / Google Sheets / Metabase)
                          </label>
                          <input
                            type="url"
                            placeholder="https://lookerstudio.google.com/embed/reporting/..."
                            value={reportEmbedUrl}
                            onChange={e => setReportEmbedUrl(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30"
                          />
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            In Looker Studio: click <strong>File &rarr; Embed report &rarr; Enable embedding &rarr; Embed URL</strong> and paste the link here.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <SaveButton loading={loading} saved={saved} />
                  </div>
                </form>
              )}

              {/* ─── Client ─── */}
              {tab === 'client' && (
                <div className="space-y-6">
                  {/* Client info */}
                  <form onSubmit={handleSave} className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Client Information</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Client contact details and status page passcode protection.</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Client Name
                          </label>
                          <input 
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Client Email
                          </label>
                          <input 
                            type="email"
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                            value={clientEmail} 
                            onChange={e => setClientEmail(e.target.value)} 
                            placeholder="client@example.com" 
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Status page passcode <span className="text-slate-400 font-normal lowercase">(optional)</span>
                          </label>
                        </div>
                        <input 
                          type="text" 
                          className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                          value={passcode} 
                          onChange={e => setPasscode(e.target.value)} 
                          placeholder="Leave blank for open link access" 
                        />
                      </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                      <SaveButton loading={loading} saved={saved} />
                    </div>
                  </form>

                  {/* Portal access */}
                  <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Client Portal Login</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                          Give {clientName || 'your client'} private credentials to view deliverables, sign documents, and pay invoices.
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      {!clientEmail.trim() ? (
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                          Add a client email above and save first to generate login credentials.
                        </p>
                      ) : (
                        <form onSubmit={handleSetPortalPassword} className="space-y-4">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Client Account ID: <span className="font-mono font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/5">{clientEmail}</span>
                          </p>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Portal password
                            </label>
                            <div className="relative max-w-sm">
                              <input 
                                type="text" 
                                placeholder="Min. 6 characters" 
                                value={portalPassword} 
                                onChange={e => setPortalPassword(e.target.value)} 
                                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                              />
                              <button 
                                type="button" 
                                onClick={generatePortalPassword} 
                                title="Generate secure password" 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {portalError && (
                            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                              {portalError}
                            </p>
                          )}
                          <button 
                            type="submit" 
                            disabled={portalSaving}
                            className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {portalSaving ? 'Setting...' : 'Set portal password'}
                          </button>
                        </form>
                      )}
                      {portalShare && (
                        <div className="mt-5 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                            ✓ {portalShare.updated ? 'Credentials updated.' : 'Portal access active.'} Send to {clientName || 'client'}:
                          </p>
                          {[
                            { label: 'Login URL', value: `${origin}/auth/login`, field: 'url' as const },
                            { label: 'Email', value: portalShare.email, field: 'email' as const },
                            { label: 'Password', value: portalShare.password, field: 'password' as const },
                          ].map(row => (
                            <div key={row.field}>
                              <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">{row.label}</div>
                              <div className="flex items-center justify-between bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                                <span className="font-mono text-xs truncate text-slate-800 dark:text-slate-200">{row.value}</span>
                                <button 
                                  type="button" 
                                  onClick={() => copyText(row.value, row.field)} 
                                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors pl-2 flex-shrink-0"
                                >
                                  {copied === row.field ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Visibility ─── */}
              {tab === 'visibility' && (
                <div className="space-y-6">
                  {/* Your dashboard */}
                  <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Your Workspace Sections</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Toggle modules visible on your project dashboard.</p>
                      </div>
                    </div>
                    <div className="px-6">
                      <ToggleRow icon={ListChecks} label="Milestones" description="Deliverable tracking with milestone progress." checked={!hideMilestones} onChange={v => setHideMilestones(!v)} />
                      <ToggleRow icon={Users} label="Client access card" description="Client status page URL and contract shortcuts." checked={!hideClientAccess} onChange={v => setHideClientAccess(!v)} />
                      <ToggleRow icon={CheckSquare} label="Kickoff checklist" description="Pre-project onboarding tasks for both sides." checked={!hideKickoff} onChange={v => setHideKickoff(!v)} />
                      <ToggleRow icon={Check} label="Approval requests" description="Deliverable sign-offs and review submissions." checked={!hideApprovals} onChange={v => setHideApprovals(!v)} />
                    </div>
                  </div>

                  {/* What clients see */}
                  <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden backdrop-blur-md">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Public Portal Visibility</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Shown on the client status page your client visits.</p>
                      </div>
                    </div>
                    <div className="px-6">
                      {modules.developer && (
                        <ToggleRow icon={Zap} label="Live coding presence" description="Show an active indicator when you are coding in your editor." checked={showLivePresence} onChange={setShowLivePresence} />
                      )}
                      {modules.time_tracking && (
                        <ToggleRow icon={Clock} label="Hours worked" description="Display total tracked time so clients can see ongoing effort." checked={showTimeLogged} onChange={setShowTimeLogged} />
                      )}
                      {!modules.developer && !modules.time_tracking && (
                        <div className="py-4 text-xs text-slate-400 font-light italic">
                          No developer telemetry or time tracking modules are active for this project.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <SaveButton loading={loading} saved={saved} />
                  </div>
                </div>
              )}

              {/* ─── Danger ─── */}
              {tab === 'danger' && (
                <div className="space-y-6">
                  {/* Duplicate */}
                  <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none px-6 py-5 flex items-center justify-between gap-4 backdrop-blur-md">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Duplicate project</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Creates a clone with the same client, colour, budget, and hourly rate.</p>
                    </div>
                    <button 
                      onClick={handleDuplicate} 
                      disabled={duplicating}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                      Duplicate
                    </button>
                  </div>

                  {/* Delete */}
                  <div className="rounded-2xl border border-rose-500/20 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-rose-500/10 overflow-hidden shadow-xs dark:shadow-none backdrop-blur-md">
                    <div className="px-6 py-4 bg-rose-500/5 border-b border-rose-500/10 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Delete project</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Permanent action — this cannot be undone.</p>
                      </div>
                    </div>
                    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-light">
                        Permanently removes all status updates, milestones, approval logs, invoice associations, and logged sessions for this project.
                      </p>
                      <button 
                        disabled={deleting} 
                        onClick={handleDelete} 
                        className="rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 text-xs transition-all shadow-xs flex-shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete project
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

