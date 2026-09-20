'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowRight, Key } from 'lucide-react'
import { ACTIVE_WORKSPACE_COOKIE, parseActiveWorkspaceId } from '@/lib/workspace'

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6',
]

export function NewProjectForm() {
  const router = useRouter()
  const [clientName, setClientName]         = useState('')
  const [clientEmail, setClientEmail]       = useState('')
  const [clientPassword, setClientPassword] = useState('')
  const [projectName, setProjectName]       = useState('')
  const [budget, setBudget]                 = useState('')
  const [hourlyRate, setHourlyRate]         = useState('')
  const [color, setColor]                   = useState(COLORS[0])
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [clientExisted, setClientExisted]   = useState(false)
  const [copied, setCopied]                 = useState<'email' | 'password' | 'url' | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  function handleGeneratePassword() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    // Rejection sampling: discard bytes in the biased tail so every character is
    // uniformly distributed (256 % 62 != 0 would over-represent the first 8 chars).
    const maxUnbiased = 256 - (256 % charset.length)
    const out: string[] = []
    while (out.length < 12) {
      const buf = crypto.getRandomValues(new Uint8Array(16))
      for (const b of buf) {
        if (b < maxUnbiased) {
          out.push(charset[b % charset.length])
          if (out.length === 12) break
        }
      }
    }
    setClientPassword(out.join(''))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    if (clientEmail && clientPassword) {
      const res = await fetch('/api/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clientEmail, password: clientPassword }),
      })
      const result = await res.json()
      if (res.status === 409) {
        // Email already has a portal account — still create the project, but flag
        // it so the success screen tells the freelancer to share the existing login.
        setClientExisted(true)
      } else if (!res.ok) {
        setError(result.error ?? 'Failed to create client account.')
        setLoading(false)
        return
      }
    }

    const slug = generateSlug(projectName)

    let activeOrgId: string | null = null
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${ACTIVE_WORKSPACE_COOKIE}=`))
      if (match) {
        const parsed = parseActiveWorkspaceId(decodeURIComponent(match.split('=')[1]))
        if (parsed !== 'personal') activeOrgId = parsed
      }
    }

    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        org_id: activeOrgId,
        client_name: clientName,
        client_email: clientEmail || null,
        project_name: projectName,
        slug,
        color,
        status: 'active',
        budget: budget ? parseFloat(budget) : null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      })
      .select()
      .single()

    if (err) {
      // The DB enforces the free-plan cap as a backstop to the page gate.
      setError(
        err.message.includes('FREE_PROJECT_LIMIT')
          ? "You've reached the free plan's 2-project limit. Upgrade to Pro for unlimited active projects."
          : err.message
      )
      setLoading(false)
    } else {
      setCreatedProjectId(data.id)
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, field: 'email' | 'password' | 'url') {
    navigator.clipboard.writeText(text)
    setCopied(field)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(null), 2000)
  }

  // Success state
  // Success state
  if (createdProjectId) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none p-8 backdrop-blur-md animate-fade-in">
        <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5">
          <Check className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-light uppercase tracking-tight text-slate-900 dark:text-white mb-1">Project created</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-light mb-6">
          {clientExisted
            ? 'This client already has a Frevio account. They can sign in with their existing password — no new credentials were created.'
            : clientEmail && clientPassword
            ? 'Share these credentials with your client so they can access their portal.'
            : 'Your project is ready. You can invite clients via status page links or add credentials in settings.'}
        </p>

        {clientExisted && clientEmail && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-xs text-amber-800 dark:text-amber-200">
            <span className="font-semibold">{clientEmail}</span> already has a login. Send them to{' '}
            <span className="font-mono">{window.location.origin}/auth/login</span> to access this project.
          </div>
        )}

        {!clientExisted && clientEmail && clientPassword && (
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 mb-6 space-y-3">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Login URL</div>
              <div className="flex items-center justify-between bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                <span className="font-mono text-xs truncate">{window.location.origin}/auth/login</span>
                <button onClick={() => copyToClipboard(`${window.location.origin}/auth/login`, 'url')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors pl-2 cursor-pointer flex-shrink-0">
                  {copied === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email</div>
                <div className="flex items-center justify-between bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                  <span className="truncate text-xs font-mono">{clientEmail}</span>
                  <button onClick={() => copyToClipboard(clientEmail, 'email')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors pl-2 cursor-pointer flex-shrink-0">
                    {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Password</div>
                <div className="flex items-center justify-between bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                  <span className="truncate font-mono text-xs">{clientPassword}</span>
                  <button onClick={() => copyToClipboard(clientPassword, 'password')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors pl-2 cursor-pointer flex-shrink-0">
                    {copied === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push(`/project/${createdProjectId}`)}
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2.5 text-xs transition-all w-full justify-center shadow-xs flex items-center gap-2"
        >
          <span>Open project</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none p-6 sm:p-8 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project — the only required part */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
            Project Information
          </h3>
          <Input
            label="Project name"
            placeholder="Website Redesign"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Budget (optional)" type="number" placeholder="5000" value={budget} onChange={e => setBudget(e.target.value)} />
            <Input label="Hourly rate (optional)" type="number" placeholder="150" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-2">Accent color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none cursor-pointer shadow-xs"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Client — all optional, can be added later */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
            Client Details
          </h3>
          <Input
            label="Client name"
            placeholder="Acme Corporation"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Client email (optional)" type="email" placeholder="client@acme.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            <div className="relative">
              <Input
                label="Portal password (optional)"
                type="text"
                placeholder="Min. 6 characters"
                value={clientPassword}
                onChange={e => setClientPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="absolute right-3 top-[34px] p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Generate password"
              >
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>
          {(clientEmail || clientPassword) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Adding email + password gives the client access to their portal at /client/dashboard.</p>
          )}
        </div>

        {error && <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2.5 text-xs transition-all w-full justify-center shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Creating project...' : 'Create project'}
        </button>
      </form>
    </div>
  )
}
