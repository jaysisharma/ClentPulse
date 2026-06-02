'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Zap, User, FolderPlus, Link2, Check, ArrowRight,
  ArrowLeft, Clock, FileText, LayoutDashboard, Sparkles,
} from 'lucide-react'

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#22C55E', '#3B82F6', '#F97316']

const STEPS = [
  { icon: User,      label: 'Your name'     },
  { icon: FolderPlus, label: 'First project' },
  { icon: Link2,     label: 'You\'re in!'   },
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

  // Step 1
  const [name, setName] = useState('')

  // Step 2
  const [clientName, setClientName]   = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectName, setProjectName] = useState('')
  const [color, setColor]             = useState(COLORS[0])

  // Step 3 (result)
  const [projectSlug, setProjectSlug] = useState('')
  const [projectId, setProjectId]     = useState('')
  const [skipped, setSkipped]         = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      supabase.from('users').select('name').eq('id', user.id).single().then(({ data }) => {
        if (data?.name) setName(data.name)
      })
    })
  }, [router])

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
    goTo(2)
  }

  async function handleSkip() {
    setSkipped(true)
    goTo(2)
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
        <img src="/logo.png" alt="ClientPulse Logo" className="w-9 h-9 rounded-xl object-cover" />
        <span className="text-xl font-semibold text-slate-900">ClientPulse</span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
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
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px transition-colors duration-300 ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">What's your name?</h1>
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

        {/* ── Step 2 — First project ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <button
              onClick={() => goTo(0)}
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

              <Button type="submit" loading={loading} className="w-full justify-center">
                Create project <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now — explore the dashboard first
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Done ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">You're all set, {name.split(' ')[0]}!</h1>
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
                    sub="See everything ClientPulse can do"
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
