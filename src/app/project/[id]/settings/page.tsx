'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Trash2, ShieldAlert, Copy, Loader2 } from 'lucide-react'

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
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) { setNotFound(true); return }
      setProjectName(data.project_name)
      setClientName(data.client_name)
      setClientEmail(data.client_email ?? '')
      setBudget(data.budget ? String(data.budget) : '')
      setHourlyRate(data.hourly_rate ? String(data.hourly_rate) : '')
      setColor(data.color)
    })
  }, [id])

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('projects')
      .update({ project_name: projectName, client_name: clientName, client_email: clientEmail || null, color, budget: budget ? parseFloat(budget) : null, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null })
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

  async function handleDelete() {
    if (!confirm(`Delete this project and all its updates? This cannot be undone.`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (notFound) return (
    <AppLayout>
      <div className="text-slate-500 text-sm">Project not found.</div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6 py-6">
        
        {/* Back Link */}
        <Link href={`/project/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to project details
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure client details, budgets, accent colors, or delete the project.</p>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* General Project Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100">Project</h3>
              
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
                <label className="text-sm font-medium text-slate-700 block mb-2">Accent color</label>
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
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100">Client access</h3>
              
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
              <p className="text-[11px] text-slate-400">
                Updating the client email assigns status updates and invoicing channels directly to this address.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
            )}

            <Button type="submit" loading={loading} className="px-5 shadow-sm">
              {saved ? <><Check className="w-4 h-4 text-emerald-100" /> Changes Saved</> : 'Save changes'}
            </Button>
          </form>
        </div>

        {/* Duplicate project */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-900 text-sm">Duplicate project</div>
            <p className="text-xs text-slate-500 mt-0.5">Creates a copy with the same client, color, budget, and hourly rate.</p>
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
              <h3 className="font-bold text-slate-900 text-sm">Danger Zone</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
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
