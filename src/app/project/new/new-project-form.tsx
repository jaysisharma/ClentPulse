'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowRight, Key } from 'lucide-react'

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
    const { data, error: err } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
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
          ? "You've reached the free plan's 3-project limit. Upgrade to Pro for unlimited projects."
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
  if (createdProjectId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 animate-fade-in">
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-5">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Project created</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {clientExisted
            ? 'This client already has a Frevio account. They can sign in with their existing password — no new credentials were created.'
            : clientEmail && clientPassword
            ? 'Share these credentials with your client so they can access their portal.'
            : 'Your project is ready. You can invite clients via status page links or add credentials in settings.'}
        </p>

        {clientExisted && clientEmail && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <span className="font-medium">{clientEmail}</span> already has a login. Send them to{' '}
            <span className="font-mono text-xs">{window.location.origin}/auth/login</span> to access this project.
          </div>
        )}

        {!clientExisted && clientEmail && clientPassword && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 space-y-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Login URL</div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="font-mono text-xs truncate">{window.location.origin}/auth/login</span>
                <button onClick={() => copyToClipboard(`${window.location.origin}/auth/login`, 'url')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                  {copied === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Email</div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="truncate text-xs">{clientEmail}</span>
                  <button onClick={() => copyToClipboard(clientEmail, 'email')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                    {copied === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Password</div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                  <span className="truncate font-mono text-xs">{clientPassword}</span>
                  <button onClick={() => copyToClipboard(clientPassword, 'password')} className="text-slate-400 hover:text-indigo-600 transition-colors pl-2 cursor-pointer flex-shrink-0">
                    {copied === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button onClick={() => router.push(`/project/${createdProjectId}`)} className="w-full justify-center">
          Open project <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project — the only required part */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Project</h3>
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Accent color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  style={{ backgroundColor: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Client — all optional, can be added later */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Client</h3>
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
                className="absolute right-3 top-[34px] p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Generate password"
              >
                <Key className="w-4 h-4" />
              </button>
            </div>
          </div>
          {(clientEmail || clientPassword) && (
            <p className="text-xs text-slate-400">Adding email + password gives the client access to their portal at /client/dashboard.</p>
          )}
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>}

        <Button type="submit" loading={loading} className="w-full justify-center">
          Create project
        </Button>
      </form>
    </div>
  )
}
