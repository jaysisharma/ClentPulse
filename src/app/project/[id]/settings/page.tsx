'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Trash2, ShieldAlert, Copy, Loader2, Key, ShieldCheck } from 'lucide-react'

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6',
]

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [budget, setBudget] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [hideMilestones, setHideMilestones] = useState(false)
  const [hideClientAccess, setHideClientAccess] = useState(false)
  const [hideKickoff, setHideKickoff] = useState(false)
  const [hideApprovals, setHideApprovals] = useState(false)
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Portal access (set/update the client's login password)
  const [portalPassword, setPortalPassword] = useState('')
  const [portalSaving, setPortalSaving] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [portalShare, setPortalShare] = useState<{ email: string; password: string; updated: boolean } | null>(null)
  const [copied, setCopied] = useState<'url' | 'email' | 'password' | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    })
  }, [id])

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('projects')
      .update({
        project_name: projectName,
        client_name: clientName,
        client_email: clientEmail || null,
        color,
        budget: budget ? parseFloat(budget) : null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        hide_milestones: hideMilestones,
        hide_client_access: hideClientAccess,
        hide_kickoff: hideKickoff,
        hide_approvals: hideApprovals,
      })
      .eq('id', id)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false)
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  async function handleDuplicate() {
    if (!confirm('Duplicate this project? A copy will be created with the same client, color, budget, and hourly rate.')) return
    setDuplicating(true)
    const res = await fetch('/api/duplicate-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id }),
    })
    const data = await res.json()
    setDuplicating(false)
    if (res.ok) router.push(`/project/${data.id}`)
    else setError(data.error ?? 'Failed to duplicate project.')
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
    setPortalSaving(true)
    setPortalError('')
    const res = await fetch('/api/client-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, password: portalPassword }),
    })
    const data = await res.json()
    setPortalSaving(false)
    if (!res.ok) { setPortalError(data.error ?? 'Could not set portal access.'); return }
    setPortalShare({ email: data.email, password: portalPassword, updated: data.updated })
  }

  function copyPortal(text: string, field: 'url' | 'email' | 'password') {
    navigator.clipboard.writeText(text)
    setCopied(field)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Delete this project and all its updates? This cannot be undone.`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (notFound) return (
    <AppLayout>
      <div className="text-slate-500 dark:text-slate-400 text-sm">Project not found.</div>
    </AppLayout>
  )

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6 py-6">

        {/* Back Link */}
        <Link href={`/project/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to project details
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Project Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure client details, budgets, accent colors, or delete the project.</p>
        </div>

        {/* Edit form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* General Project Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">Project</h3>
              
              <Input
                label="Project Title"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Project Budget ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="e.g. 5000"
                />
                <Input
                  label="Hourly Rate ($/hr)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  placeholder="e.g. 150"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Accent color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none shadow-sm"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Client Access Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">Client access</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Organization / Name"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  required
                />
                <Input
                  label="Client Associated Email"
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
            </div>
            {/* Visibility Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800 font-sans">Dashboard Layout Visibility</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Configure which widgets and sections are visible on your project dashboard.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors font-sans">
                  <input
                    type="checkbox"
                    checked={!hideMilestones}
                    onChange={e => setHideMilestones(!e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">Milestones Widget</span>
                    <span className="text-[11px] text-slate-400">Show milestones list and progress.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors font-sans">
                  <input
                    type="checkbox"
                    checked={!hideClientAccess}
                    onChange={e => setHideClientAccess(!e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">Client Access Card</span>
                    <span className="text-[11px] text-slate-400">Show status page URL and contract links.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors font-sans">
                  <input
                    type="checkbox"
                    checked={!hideKickoff}
                    onChange={e => setHideKickoff(!e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">Kickoff Checklist</span>
                    <span className="text-[11px] text-slate-400">Show freelancer and client setup checklists.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-slate-100/50 transition-colors font-sans">
                  <input
                    type="checkbox"
                    checked={!hideApprovals}
                    onChange={e => setHideApprovals(!e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">Approval Requests</span>
                    <span className="text-[11px] text-slate-400">Show client deliverables and sign-offs.</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-sans">{error}</div>
            )}

            <Button type="submit" loading={loading} className="px-5 shadow-sm">
              {saved ? <><Check className="w-4 h-4 text-emerald-100" /> Changes Saved</> : 'Save changes'}
            </Button>
          </form>
        </div>

        {/* Portal access */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Portal access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Give {clientName || 'your client'} a login to view updates, sign documents, pay invoices, and message you.
                Setting a password again updates their existing login.
              </p>
            </div>
          </div>

          {!clientEmail.trim() ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Add a client email above and save changes first, then you can create a portal login.
            </p>
          ) : (
            <form onSubmit={handleSetPortalPassword} className="space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Login email: <span className="font-medium text-slate-700 dark:text-slate-200">{clientEmail}</span>
              </div>
              <div className="relative max-w-sm">
                <Input
                  label="Portal password"
                  type="text"
                  placeholder="Min. 6 characters"
                  value={portalPassword}
                  onChange={e => setPortalPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={generatePortalPassword}
                  title="Generate password"
                  className="absolute right-3 top-[34px] p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
              {portalError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{portalError}</div>
              )}
              <Button type="submit" variant="secondary" size="sm" loading={portalSaving}>
                Set portal password
              </Button>
            </form>
          )}

          {portalShare && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {portalShare.updated ? 'Password updated.' : 'Portal access created.'} Share these with {clientName || 'your client'}:
              </p>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Login URL</div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-mono text-xs truncate">{origin}/auth/login</span>
                  <button type="button" onClick={() => copyPortal(`${origin}/auth/login`, 'url')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                    {copied === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="truncate text-xs">{portalShare.email}</span>
                    <button type="button" onClick={() => copyPortal(portalShare.email, 'email')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                      {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Password</div>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="truncate font-mono text-xs">{portalShare.password}</span>
                    <button type="button" onClick={() => copyPortal(portalShare.password, 'password')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                      {copied === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duplicate project */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">Duplicate project</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Creates a copy with the same client, color, budget, and hourly rate.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDuplicate} loading={duplicating}>
            {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            Duplicate
          </Button>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50/40 rounded-xl border border-red-200/80 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Danger Zone</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Permanently deleting this project deletes all associated updates, milestones, approval logs, and logged hours. This action is absolute and cannot be undone.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-red-200/60">
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} className="shadow-sm">
              <Trash2 className="w-4 h-4" />
              Delete project permanently
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
