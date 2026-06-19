'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  User, FolderPlus, Link2, Check, ArrowRight,
  ArrowLeft, Clock, FileText, LayoutDashboard, Sparkles,
  Palette, Wallet, Upload,
} from 'lucide-react'

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#22C55E', '#3B82F6', '#F97316']

const STEPS = [
  { icon: User,       label: 'Your name'     },
  { icon: Palette,    label: 'Your brand'    },
  { icon: FolderPlus, label: 'First project' },
  { icon: Wallet,     label: 'Get paid'      },
  { icon: Sparkles,   label: 'You\'re in!'   },
]

// ── helpers ───────────────────────────────────────────────────────────────────

async function ensureUniqueSlug(supabase: ReturnType<typeof createClient>, base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (attempt < 5) {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug)
    if ((count ?? 0) === 0) return slug
    attempt++
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
  }
  return slug
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [userId, setUserId] = useState('')
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(true)
  const stepTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (stepTimerRef.current)   clearTimeout(stepTimerRef.current)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
  }, [])

  // Step 1 — name
  const [name, setName] = useState('')

  // Step 2 — brand
  const [accentColor, setAccentColor] = useState(COLORS[0])
  const [logoUrl, setLogoUrl]         = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError]     = useState('')

  // Step 3 — first project
  const [clientName, setClientName]   = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectName, setProjectName] = useState('')
  const [color, setColor]             = useState(COLORS[0])

  // Step 4 — get paid
  const [hourlyRate, setHourlyRate] = useState('')
  const [budget, setBudget]         = useState('')

  // Step 5 (result)
  const [projectSlug, setProjectSlug] = useState('')
  const [projectId, setProjectId]     = useState('')
  const [skipped, setSkipped]         = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      supabase.from('users').select('name, accent_color, logo_url').eq('id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data?.name) setName(data.name)
          if (data?.accent_color) setAccentColor(data.accent_color)
          if (data?.logo_url) setLogoUrl(data.logo_url)
        })
    })
  }, [router])

  // Mark onboarding complete once the user reaches the final step — this covers
  // both finishing the flow and skipping to the end. The auth redirect gate keys
  // off this flag, so without it new users would be sent back here on next login.
  useEffect(() => {
    if (step !== 4 || !userId) return
    const supabase = createClient()
    supabase.from('users').update({ onboarded: true }).eq('id', userId).then(() => {})
  }, [step, userId])

  // Animated step transition
  function goTo(target: number) {
    setVisible(false)
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current)
    stepTimerRef.current = setTimeout(() => { setStep(target); setError(''); setVisible(true) }, 180)
  }

  // ── step handlers ─────────────────────────────────────────────────────────

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ name: name.trim() }).eq('id', userId)
    setLoading(false)
    goTo(1)
  }

  async function handleBrand(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    // Logo (if any) was already saved on upload; persist the accent choice here.
    const { error: err } = await supabase.from('users').update({ accent_color: accentColor }).eq('id', userId)
    setLoading(false)
    if (err) { setError(err.message); return }
    goTo(2)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setLogoUploading(true)
    setLogoError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (error) { setLogoError('Couldn’t upload your logo — you can add one later in Settings.'); setLogoUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
    const { error: updErr } = await supabase.from('users').update({ logo_url: publicUrl }).eq('id', userId)
    if (updErr) { setLogoError('Logo uploaded but not saved — try again or add it later in Settings.'); setLogoUploading(false); return }
    setLogoUrl(publicUrl)
    setLogoUploading(false)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const base = generateSlug(projectName)
    const slug = await ensureUniqueSlug(supabase, base)
    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        client_name: clientName,
        client_email: clientEmail || null,
        project_name: projectName,
        slug,
        color,
        status: 'active',
      })
      .select()
      .single()
    if (err) { setError(err.message); setLoading(false); return }
    setProjectSlug(slug)
    setProjectId(data.id)
    setSkipped(false)
    setLoading(false)
    goTo(3)
  }

  async function handleSkipProject() {
    setSkipped(true)
    goTo(4)
  }

  async function handleGetPaid(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('projects')
      .update({
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        budget: budget ? parseFloat(budget) : null,
      })
      .eq('id', projectId)
    setLoading(false)
    if (err) { setError(err.message); return }
    goTo(4)
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${projectSlug}`

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <img src="/logo.svg" alt="Frevio Logo" className="w-9 h-9" />
        <span className="text-xl font-semibold text-slate-900">Frevio</span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 sm:gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
              i === step ? 'text-indigo-600' : i < step ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                i === step ? 'bg-indigo-600 text-white scale-110' :
                i < step  ? 'bg-emerald-500 text-white' :
                            'bg-slate-200 text-slate-500'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="hidden md:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-5 sm:w-8 h-px transition-colors duration-300 ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md transition-opacity duration-180"
        style={{ opacity: visible ? 1 : 0 }}
      >

        {/* ── Step 1 — Name ──────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">What&apos;s your name?</h1>
            <p className="text-slate-500 text-sm mb-6">
              This appears on your invoices, emails, and client status pages.
            </p>
            <form onSubmit={handleStep1} className="space-y-4">
              <Input
                label="Your name"
                placeholder="Alex Johnson"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
              <Button type="submit" loading={loading} disabled={!name.trim()} className="w-full justify-center">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* ── Step 2 — Brand ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <button
              onClick={() => goTo(0)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${accentColor}1a` }}>
              <Palette className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Make it yours</h1>
            <p className="text-slate-500 text-sm mb-6">
              Pick an accent colour and add your logo — they brand your client status pages, invoices, and portal.
            </p>

            <form onSubmit={handleBrand} className="space-y-5">
              {/* Accent color */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Accent colour</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c} type="button" onClick={() => setAccentColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c, outline: accentColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                      aria-label={`Accent ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Logo <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-4 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors w-full cursor-pointer">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain rounded" />
                  ) : (
                    <Upload className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{logoUploading ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                </label>
                {logoError && <p className="text-xs text-red-600 mt-1.5">{logoError}</p>}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
              )}

              <Button type="submit" loading={loading} className="w-full justify-center">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => goTo(2)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip — I&apos;ll set this up later
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — First project ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <button
              onClick={() => goTo(1)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your first project</h1>
            <p className="text-slate-500 text-sm mb-6">
              Add a client and project — you can always change these later.
            </p>
            <form onSubmit={handleStep2} className="space-y-4">
              <Input
                label="Client name"
                placeholder="Acme Corp"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Client email <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="client@acme.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Input
                label="Project name"
                placeholder="Website Redesign"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                required
              />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Project colour</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c} type="button" onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" onClick={handleSkipProject} className="justify-center">
                  Skip for now
                </Button>
                <Button type="submit" loading={loading} className="flex-1 justify-center">
                  Create project <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center">
                No project yet? Skip and explore — you can add one anytime from the dashboard.
              </p>
            </form>
          </div>
        )}

        {/* ── Step 4 — Get paid ──────────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <button
              onClick={() => goTo(2)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">How do you bill this project?</h1>
            <p className="text-slate-500 text-sm mb-6">
              Set a rate or budget for <span className="font-medium text-slate-700">{projectName}</span> — it powers your earnings and billable-hours tracking. Both optional.
            </p>

            <form onSubmit={handleGetPaid} className="space-y-4">
              <Input
                label="Hourly rate (USD)"
                type="number" min="0" step="0.01"
                placeholder="150"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
              />
              <Input
                label="Project budget (USD)"
                type="number" min="0" step="0.01"
                placeholder="5000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
              )}

              <Button type="submit" loading={loading} className="w-full justify-center">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => goTo(4)}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip — set rates later
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5 — Done ──────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">You&apos;re all set, {name.split(' ')[0]}!</h1>
              <p className="text-slate-500 text-sm">
                {skipped
                  ? 'Your account is ready. Here\'s where to start.'
                  : 'Your project is live. Here\'s what to do next.'}
              </p>
            </div>

            {/* Share link — only shown when a project was created */}
            {!skipped && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client status page</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 font-mono truncate">
                    {publicUrl}
                  </div>
                  <Button variant="secondary" onClick={copyLink} className="flex-shrink-0">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Link2 className="w-4 h-4" />Copy</>}
                  </Button>
                </div>
              </div>
            )}

            {/* Next-step action cards */}
            <div className="space-y-2 mb-6">
              {skipped ? (
                <>
                  <ActionCard
                    icon={<FolderPlus className="w-4 h-4 text-indigo-600" />}
                    label="Create your first project"
                    sub="Add a client and start tracking work"
                    onClick={() => router.push('/project/new')}
                  />
                  <ActionCard
                    icon={<LayoutDashboard className="w-4 h-4 text-slate-500" />}
                    label="Explore the dashboard"
                    sub="See everything Frevio can do"
                    onClick={() => router.push('/dashboard')}
                  />
                  <ActionCard
                    icon={<FileText className="w-4 h-4 text-slate-500" />}
                    label="Create an invoice"
                    sub="Bill a client right away"
                    onClick={() => router.push('/invoices/new')}
                  />
                </>
              ) : (
                <>
                  <ActionCard
                    icon={<ArrowRight className="w-4 h-4 text-indigo-600" />}
                    label="Post your first update"
                    sub="Let your client know you've started"
                    onClick={() => router.push(`/project/${projectId}`)}
                    primary
                  />
                  <ActionCard
                    icon={<FileText className="w-4 h-4 text-slate-500" />}
                    label="Create an invoice"
                    sub="Bill your client for this project"
                    onClick={() => router.push('/invoices/new')}
                  />
                  <ActionCard
                    icon={<Clock className="w-4 h-4 text-slate-500" />}
                    label="Start the time tracker"
                    sub="Log hours as you work"
                    onClick={() => router.push('/time')}
                  />
                </>
              )}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Action card component ─────────────────────────────────────────────────────

function ActionCard({
  icon, label, sub, onClick, primary = false,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all hover:shadow-sm group ${
        primary
          ? 'border-indigo-200 bg-indigo-50 hover:border-indigo-300'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${primary ? 'bg-indigo-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${primary ? 'text-indigo-900' : 'text-slate-900'}`}>{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
      <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${primary ? 'text-indigo-400' : 'text-slate-300'}`} />
    </button>
  )
}
