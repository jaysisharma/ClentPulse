'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { Check, Upload, Sun, Moon, Copy, Code2, Key, Trash2, ArrowUpRight, Sparkles, ExternalLink, Gift } from 'lucide-react'
import { PLAN_BLURB, normalizePlan } from '@/lib/plans'
import { buildReferralUrl } from '@/lib/referrals'
import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'

const ACCENT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#22C55E', '#14B8A6', '#3B82F6',
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [logoError, setLogoError] = useState('')
  const [accentColor, setAccentColor] = useState('#6366F1')
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState('')
  const [billingError, setBillingError] = useState('')
  const [refCopied, setRefCopied] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleCopyReferral() {
    const link = buildReferralUrl(username || userId || 'creator')
    navigator.clipboard.writeText(link)
    setRefCopied(true)
    setTimeout(() => setRefCopied(false), 2000)
  }

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }, [])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [justUpgraded, setJustUpgraded] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('upgraded') === '1') {
      setJustUpgraded(true)
      window.history.replaceState({}, '', '/settings')
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      setUserId(user.id)
      supabase.from('users').select('name, username, accent_color, plan, logo_url').eq('id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data) {
            setName(data.name ?? '')
            setUsername(data.username ?? '')
            setAccentColor(data.accent_color ?? '#6366F1')
            setPlan(data.plan ?? 'free')
            setLogoUrl(data.logo_url ?? null)
          }
        })
    })
  }, [])

  const [tokens, setTokens] = useState<{ id: string; token_preview: string; name: string; last_used_at: string | null; created_at: string }[]>([])
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => {
    fetch('/api/extension/token')
      .then(res => res.json())
      .then(data => {
        if (data.tokens) setTokens(data.tokens)
      })
      .catch(() => {})
  }, [])

  async function handleGenerateToken() {
    setGeneratingToken(true)
    try {
      const res = await fetch('/api/extension/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'VS Code Extension' }),
      })
      const data = await res.json()
      if (data.token) {
        setGeneratedToken(data.token)
        setTokens(prev => [
          { id: data.id, token_preview: data.tokenPreview, name: data.name, last_used_at: null, created_at: data.createdAt },
          ...prev,
        ])
      }
    } finally {
      setGeneratingToken(false)
    }
  }

  async function handleRevokeToken(id: string) {
    await fetch(`/api/extension/token?id=${id}`, { method: 'DELETE' })
    setTokens(prev => prev.filter(t => t.id !== id))
    if (generatedToken) setGeneratedToken(null)
  }

  async function copyToken(text: string) {
    await navigator.clipboard.writeText(text)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setUsernameError('')
    setSaveError('')
    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (username && slug !== username) {
      setUsernameError('Only lowercase letters, numbers, hyphens and underscores allowed.')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ name, accent_color: accentColor, username: slug || null }).eq('id', userId)
    setLoading(false)
    if (error) {
      if (error.message?.includes('unique')) setUsernameError('That username is already taken.')
      else setSaveError('Could not save your changes. Please try again.')
      return
    }
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setLogoUploading(true)
    setLogoError('')
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be less than 2MB.')
      setLogoUploading(false)
      return
    }
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (error) { setLogoError('Could not upload your logo. Please try again.'); setLogoUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
    const { error: updErr } = await supabase.from('users').update({ logo_url: publicUrl }).eq('id', userId)
    if (updErr) { setLogoError('Logo uploaded but could not be saved. Please try again.'); setLogoUploading(false); return }
    setLogoUrl(publicUrl)
    setLogoUploading(false)
  }

  function handleUpgrade() {
    router.push('/upgrade')
  }

  async function handleManageBilling() {
    setBillingError('')
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url; return }
    setBillingError(json.error ?? 'Failed to open billing portal.')
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-12 max-w-3xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Account & Studio Settings
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                Manage your profile identity, workspace appearance, editor extensions, and subscriptions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3.5 py-1.5">
                TIER // {plan.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Upgrade Success Notification */}
          {justUpgraded && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 p-5 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">You&apos;re now on Frevio Pro</div>
                <div className="text-emerald-700 dark:text-emerald-400/80 text-[11px] mt-0.5">
                  All Pro features and unlimited client portals have been unlocked.
                </div>
              </div>
            </div>
          )}

          {/* Integrations shortcut */}
          <Link
            href="/settings/integrations"
            className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 px-5 py-4 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors group"
          >
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Integrations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Connect Google Drive, Calendar, GitHub, and Figma to your projects.
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
          </Link>

          {/* Profile &amp; Public Identity */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Profile & Public Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Set how you appear to clients across project portals and your public portfolio URL.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="display-name" className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 block mb-2">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-light"
                />
              </div>

              <div>
                <label htmlFor="portfolio-username" className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 block mb-2">
                  Portfolio Handle / Slug
                </label>
                <input
                  id="portfolio-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="alexrivera"
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-light"
                />
                {username && !usernameError && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Public Showcase:</span>
                    <Link
                      href={`/u/${username}`}
                      target="_blank"
                      className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      /u/{username}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
                {usernameError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{usernameError}</p>
                )}
              </div>

              {saveError && <p className="text-xs text-rose-600 dark:text-rose-400">{saveError}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : saved ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> Changes Saved</>
                  ) : (
                    'Save Profile Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Interface Theme */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Workspace Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Toggle between obsidian dark mode and light studio view.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/30 text-indigo-950 dark:border-white/30 dark:bg-white/[0.08] dark:text-white'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                }`}
              >
                <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="text-xs font-medium">Light Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white/30 dark:bg-white/[0.08] dark:ring-1 dark:ring-white/15 dark:text-white'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
                }`}
              >
                <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="text-xs font-medium">Obsidian Dark</span>
              </button>
            </div>
          </div>

          {/* Studio Branding */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Studio Branding
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                  Customize the brand color and logo displayed on your client deliverables.
                </p>
              </div>
              {plan !== 'pro' ? (
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
                  PRO FEATURE
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>

            <div className={`space-y-5 ${plan !== 'pro' ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 block mb-2.5">
                  Brand Accent Spectrum
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs"
                      style={{
                        backgroundColor: c,
                        boxShadow: accentColor === c ? `0 0 14px ${c}88` : 'none',
                        outline: accentColor === c ? `2px solid #6366F1` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {accentColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 block mb-2.5">
                  Brand Icon / Wordmark
                </label>
                <label className="flex items-center gap-3.5 border border-dashed border-slate-300 dark:border-white/15 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full cursor-pointer bg-slate-50/50 dark:bg-white/[0.02]">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain rounded bg-white dark:bg-black/40 p-1 border border-slate-200 dark:border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <span>{logoUploading ? 'Uploading asset…' : logoUrl ? 'Change logo asset' : 'Upload PNG, SVG, or WEBP (max 2MB)'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                </label>
                {logoError && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{logoError}</p>}
              </div>

              {plan === 'pro' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    {saved ? <><Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> Saved</> : 'Save Branding'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor Extension */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Code Editor Extension
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">VS Code / Cursor / Antigravity live sync</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                LIVE SYNC
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              Sync active coding intervals and live status to your client portals automatically. Only tracks workspace timestamps and duration — never shares raw code, filenames, or file contents.
            </p>

            {generatedToken && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Generated Extension Token
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80">Copy now — won&apos;t be shown again</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-black/60 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono text-slate-800 dark:text-emerald-200 overflow-x-auto select-all">
                    {generatedToken}
                  </code>
                  <button
                    onClick={() => copyToken(generatedToken)}
                    className="rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    {tokenCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {tokenCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {tokens.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Active Extension Pairs ({tokens.length})
                </label>
                <div className="space-y-2">
                  {tokens.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Key className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 dark:text-white">{t.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{t.token_preview}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {t.last_used_at && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                            Synced {new Date(t.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleRevokeToken(t.id)}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {generatingToken ? 'Generating...' : tokens.length > 0 ? 'Generate New Key' : 'Generate Extension Key'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-light">
              <p className="font-medium text-slate-700 dark:text-slate-300 text-xs">Setup in 60 seconds:</p>
              <p className="text-[11px]">1. Open Command Palette in VS Code / Cursor (<kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">Cmd+Shift+P</kbd>).</p>
              <p className="text-[11px]">2. Search <code className="font-mono text-indigo-600 dark:text-indigo-400">Frevio: Set API Token</code> and paste your generated key.</p>
              <p className="text-[11px]">3. Run <code className="font-mono text-indigo-600 dark:text-indigo-400">Frevio: Link Workspace to Project</code> to start automated sync.</p>
            </div>
          </div>

          {/* Referral & Growth Partner */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Referral Link & Viral Credits
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                Share your unique link with clients or fellow creators. When they join and subscribe, you receive recurring platform credits.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <div className="flex-1 font-mono text-xs text-slate-700 dark:text-slate-300 truncate px-2">
                {buildReferralUrl(username || userId || 'creator')}
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex-shrink-0"
              >
                {refCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{refCopied ? 'Link Copied' : 'Copy Referral Link'}</span>
              </button>
            </div>
          </div>

          {/* Billing & Subscription */}
          <div id="billing" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 p-6 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none space-y-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Subscription & Billing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Manage your tier subscription, payment invoices, and billing portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Current Tier:</span>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    normalizePlan(plan) !== 'free'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-200/70 dark:bg-white/5 border border-slate-300 dark:border-white/10'
                  }`}>
                    {normalizePlan(plan) === 'agency_scale'
                      ? 'Agency Scale'
                      : normalizePlan(plan) === 'agency'
                      ? 'Agency'
                      : normalizePlan(plan) === 'pro'
                      ? 'Pro Plan'
                      : 'Free Tier'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  {PLAN_BLURB[normalizePlan(plan)]}
                </p>
              </div>

              {plan === 'free' ? (
                <button
                  onClick={handleUpgrade}
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2 text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
                  Upgrade to Pro
                </button>
              ) : (
                <button
                  onClick={handleManageBilling}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2 text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  Manage Billing
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {billingError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{billingError}</p>
            )}
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
