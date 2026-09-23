'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import {
  Check, Upload, Sun, Moon, Copy, Code2, Key, Trash2,
  ArrowUpRight, Sparkles, ExternalLink, Gift, Zap, Shield,
  Crown, TrendingUp, Palette, Briefcase, Sliders, Layers,
  Clock, FileText, BarChart3, Loader2
} from 'lucide-react'
import { PLAN_BLURB, FREE_FEATURES, PRO_FEATURES, AGENCY_FEATURES, normalizePlan, type PlanTier } from '@/lib/plans'
import { buildReferralUrl } from '@/lib/referrals'
import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  MODULE_CATALOG,
  DEFAULT_MODULES,
  CRAFT_PRESETS,
  resolveModules
} from '@/lib/modules'
import type { UserCraft, WorkspaceModules } from '@/types'

const ACCENT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#22C55E', '#14B8A6', '#3B82F6',
]

const PLAN_META: Record<PlanTier, {
  label: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  features: string[]
}> = {
  free: {
    label: 'Free',
    icon: Zap,
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-white/5',
    border: 'border-slate-200 dark:border-white/10',
    features: FREE_FEATURES,
  },
  pro: {
    label: 'Pro',
    icon: Sparkles,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    features: PRO_FEATURES,
  },
  agency: {
    label: 'Agency',
    icon: Shield,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/20',
    features: AGENCY_FEATURES,
  },
  agency_scale: {
    label: 'Agency Scale',
    icon: Crown,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    features: AGENCY_FEATURES,
  },
}

const MODULE_ICONS: Record<keyof WorkspaceModules, React.ElementType> = {
  developer: Code2,
  marketing: BarChart3,
  design: Palette,
  time_tracking: Clock,
  contracts_billing: FileText,
}

const CRAFT_PRESET_ITEMS: Array<{ id: UserCraft; label: string; icon: React.ElementType }> = [
  { id: 'developer', label: 'Developer', icon: Code2 },
  { id: 'marketer', label: 'Marketer', icon: TrendingUp },
  { id: 'designer', label: 'Designer', icon: Palette },
  { id: 'consultant', label: 'Consultant', icon: Briefcase },
  { id: 'general', label: 'General / All', icon: Sparkles },
]

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5',
      className
    )}>
      {children}
    </div>
  )
}

function SectionHeader({ title, description, badge }: {
  title: string
  description?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-light">{description}</p>
        )}
      </div>
      {badge}
    </div>
  )
}

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [justUpgraded, setJustUpgraded] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Workspace Modules & Craft
  const [craft, setCraft] = useState<UserCraft>('general')
  const [modules, setModules] = useState<WorkspaceModules>(DEFAULT_MODULES)
  const [togglingModule, setTogglingModule] = useState<string | null>(null)
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null)

  const [tokens, setTokens] = useState<{ id: string; token_preview: string; name: string; last_used_at: string | null; created_at: string }[]>([])
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }, [])

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
      supabase.from('users').select('name, username, accent_color, plan, logo_url, craft, enabled_modules').eq('id', user.id).single()
        .then(({ data }: { data: any }) => {
          if (data) {
            setName(data.name ?? '')
            setUsername(data.username ?? '')
            setAccentColor(data.accent_color ?? '#6366F1')
            setPlan(data.plan ?? 'free')
            setLogoUrl(data.logo_url ?? null)
            if (data.craft) setCraft(data.craft)
            if (data.enabled_modules) setModules(resolveModules(data.enabled_modules))
          }
        })
    })
  }, [])

  useEffect(() => {
    fetch('/api/extension/token')
      .then(res => res.json())
      .then(data => { if (data.tokens) setTokens(data.tokens) })
      .catch(() => {})
  }, [])

  async function handleToggleModule(moduleKey: keyof WorkspaceModules) {
    const currentVal = Boolean(modules[moduleKey])
    const nextVal = !currentVal
    const updated = { ...modules, [moduleKey]: nextVal }
    setModules(updated)
    setTogglingModule(moduleKey)
    try {
      await fetch('/api/users/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [moduleKey]: nextVal }),
      })
    } catch (err) {
      console.error('Failed to update module flag:', err)
      setModules(modules)
    } finally {
      setTogglingModule(null)
    }
  }

  async function handleApplyCraftPreset(newCraft: UserCraft) {
    setCraft(newCraft)
    const preset = CRAFT_PRESETS[newCraft]
    setModules(preset)
    setApplyingPreset(newCraft)
    try {
      await fetch('/api/users/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ craft: newCraft, ...preset }),
      })
    } catch (err) {
      console.error('Failed to apply craft preset:', err)
    } finally {
      setApplyingPreset(null)
    }
  }

  function handleCopyReferral() {
    const link = buildReferralUrl(username || userId || 'creator')
    navigator.clipboard.writeText(link)
    setRefCopied(true)
    setTimeout(() => setRefCopied(false), 2000)
  }

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

  async function handleManageBilling() {
    setBillingError('')
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url; return }
    setBillingError(json.error ?? 'Failed to open billing portal.')
  }

  const normalizedPlan = normalizePlan(plan)
  const planMeta = PLAN_META[normalizedPlan]
  const PlanIcon = planMeta.icon
  const isPaid = normalizedPlan !== 'free'

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 max-w-2xl pb-12 space-y-6 animate-fade-in">

          {/* ── Page Header ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Account Settings
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Manage your profile, workspace, integrations, and subscription.
            </p>
          </div>

          {/* ── Upgrade Success Banner ─────────────────────────────────── */}
          {justUpgraded && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">You&apos;re now on Frevio Pro 🎉</div>
                <div className="text-emerald-700 dark:text-emerald-400/80 text-xs mt-0.5">
                  All Pro features and unlimited client portals have been unlocked.
                </div>
              </div>
            </div>
          )}

          {/* ── Current Plan Card (PROMINENT) ─────────────────────────── */}
          <SectionCard>
            <div className={cn('rounded-t-2xl p-5 border-b', planMeta.bg, planMeta.border)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', planMeta.bg, planMeta.border)}>
                    <PlanIcon className={cn('w-5 h-5', planMeta.color)} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Plan</div>
                    <div className={cn('text-lg font-bold leading-tight', planMeta.color)}>{planMeta.label}</div>
                  </div>
                </div>
                {isPaid ? (
                  <button
                    onClick={handleManageBilling}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  >
                    Manage Billing
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-xs font-semibold transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-light leading-relaxed">
                {PLAN_BLURB[normalizedPlan]}
              </p>
            </div>
            {/* Plan feature highlights */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {planMeta.features.slice(0, 8).map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {!isPaid && (
                <div className="col-span-full mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
                  <Link href="/upgrade" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    See everything included in Pro →
                  </Link>
                </div>
              )}
            </div>
            {billingError && (
              <div className="px-5 pb-4">
                <p className="text-xs text-rose-600 dark:text-rose-400">{billingError}</p>
              </div>
            )}
          </SectionCard>

          {/* ── Profile & Public Identity ──────────────────────────────── */}
          <SectionCard className="p-5">
            <SectionHeader
              title="Profile & Identity"
              description="How you appear to clients across project portals and your public portfolio."
            />

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="portfolio-username" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Portfolio Handle
                </label>
                <input
                  id="portfolio-username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="alexrivera"
                  className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all"
                />
                {username && !usernameError && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] text-slate-400">Public URL:</span>
                    <Link
                      href={`/u/${username}`}
                      target="_blank"
                      className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      /u/{username}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
                {usernameError && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{usernameError}</p>}
              </div>

              {saveError && <p className="text-xs text-rose-600 dark:text-rose-400">{saveError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving…' : saved ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Saved</> : 'Save Changes'}
              </button>
            </form>
          </SectionCard>

          {/* ── Appearance ────────────────────────────────────────────── */}
          <SectionCard className="p-5">
            <SectionHeader
              title="Appearance"
              description="Toggle between dark and light workspace modes."
            />
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer',
                  theme === 'light'
                    ? 'border-indigo-400 bg-indigo-50 dark:border-white/30 dark:bg-white/[0.08] text-indigo-700 dark:text-white ring-1 ring-indigo-400/30'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]'
                )}
              >
                <Sun className={cn('w-5 h-5', theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500')} />
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-white dark:border-white/30 dark:bg-white/[0.08] ring-1 ring-white/15'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]'
                )}
              >
                <Moon className={cn('w-5 h-5', theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
                <span className="text-xs font-medium">Dark</span>
              </button>
            </div>
          </SectionCard>

          {/* ── Studio Branding ───────────────────────────────────────── */}
          <SectionCard className="p-5">
            <SectionHeader
              title="Studio Branding"
              description="Customize the accent color and logo shown on client deliverables."
              badge={
                !isPaid ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                    Pro
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                    Active
                  </span>
                )
              }
            />

            <div className={cn('space-y-5', !isPaid && 'opacity-40 pointer-events-none select-none')}>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Accent Color
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
                        outline: accentColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {accentColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Brand Logo
                </label>
                <label className="flex items-center gap-3 border border-dashed border-slate-300 dark:border-white/15 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full cursor-pointer bg-slate-50/50 dark:bg-white/[0.02]">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain rounded bg-white dark:bg-black/40 p-1 border border-slate-200 dark:border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <span>{logoUploading ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload PNG, SVG, or WEBP (max 2MB)'}</span>
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

              {isPaid && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {saved ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Saved</> : 'Save Branding'}
                </button>
              )}
            </div>

            {!isPaid && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <Link
                  href="/upgrade"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade to Pro to unlock branding
                </Link>
              </div>
            )}
          </SectionCard>

          {/* ── Integrations ──────────────────────────────────────────── */}
          <Link
            href="/settings/integrations"
            className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/80 px-5 py-4 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors group"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Integrations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                Connect Google Drive, Calendar, GitHub, and Figma.
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
          </Link>

          {/* ── Workspace Modules ─────────────────────────────────────── */}
          <SectionCard className="p-5">
            <SectionHeader
              title="Workspace Modules"
              description="Enable or disable functional suites to customize your dashboard, project settings, and client portals."
              badge={
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  {Object.values(modules).filter(Boolean).length} / {MODULE_CATALOG.length} Active
                </span>
              }
            />

            {/* Quick Craft Presets */}
            <div className="mb-5 pb-4 border-b border-slate-100 dark:border-white/5 space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Craft Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {CRAFT_PRESET_ITEMS.map(p => {
                  const Icon = p.icon
                  const isCurrent = craft === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyCraftPreset(p.id)}
                      disabled={applyingPreset !== null}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border',
                        isCurrent
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs font-semibold'
                          : 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      )}
                    >
                      {applyingPreset === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Icon className="w-3 h-3" />
                      )}
                      <span>{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Individual Module Toggles */}
            <div className="space-y-3">
              {MODULE_CATALOG.map(item => {
                const Icon = MODULE_ICONS[item.id] || Sparkles
                const isEnabled = Boolean(modules[item.id])
                const isUpdating = togglingModule === item.id

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border',
                        isEnabled
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
                              {item.badge}
                            </span>
                          )}
                          <span className={cn(
                            'text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                            isEnabled
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                              : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5'
                          )}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-0.5 leading-snug">
                          {item.shortDescription}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      disabled={isUpdating}
                      onClick={() => handleToggleModule(item.id)}
                      className={cn(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none p-0.5 self-end sm:self-center',
                        isEnabled ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-white/20',
                        isUpdating && 'opacity-60 cursor-wait'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out flex items-center justify-center',
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        )}
                      >
                        {isUpdating && <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-600" />}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* ── Code Editor Extension ─────────────────────────────────── */}
          {modules.developer && (
            <SectionCard className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Code Editor Extension</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">VS Code · Cursor · Antigravity live sync</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Live Sync
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-4">
                Sync active coding intervals and live status to your client portals automatically. Only tracks workspace timestamps and duration — never raw code or filenames.
              </p>

              {generatedToken && (
                <div className="p-4 mb-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Generated Token
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80">Copy now — won&apos;t show again</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white dark:bg-black/60 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-xs font-mono text-slate-800 dark:text-emerald-200 overflow-x-auto select-all">
                      {generatedToken}
                    </code>
                    <button
                      onClick={() => copyToken(generatedToken)}
                      className="rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      {tokenCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {tokenCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {tokens.length > 0 && (
                <div className="space-y-2 mb-4">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Active Keys ({tokens.length})
                  </label>
                  <div className="space-y-2">
                    {tokens.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-900 dark:text-white">{t.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">{t.token_preview}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {t.last_used_at && (
                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                              Synced {new Date(t.last_used_at).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => handleRevokeToken(t.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400/70 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-2 text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                {generatingToken ? 'Generating…' : tokens.length > 0 ? 'Generate New Key' : 'Generate Extension Key'}
              </button>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-light">
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1.5">Setup in 60 seconds:</p>
                <p>1. Open Command Palette <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">Cmd+Shift+P</kbd></p>
                <p>2. Run <code className="font-mono text-indigo-600 dark:text-indigo-400">Frevio: Set API Token</code> and paste your key.</p>
                <p>3. Run <code className="font-mono text-indigo-600 dark:text-indigo-400">Frevio: Link Workspace to Project</code> to start sync.</p>
              </div>
            </SectionCard>
          )}

          {/* ── Referral ──────────────────────────────────────────────── */}
          <SectionCard className="p-5">
            <SectionHeader
              title="Referral Link"
              description="Share your link and earn recurring credits when friends join and subscribe."
              badge={<Gift className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />}
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <div className="flex-1 font-mono text-xs text-slate-700 dark:text-slate-300 truncate px-1">
                {buildReferralUrl(username || userId || 'creator')}
              </div>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold transition-all shadow-xs cursor-pointer flex-shrink-0"
              >
                {refCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {refCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </SectionCard>

        </div>
      </DarkShell>
    </AppLayout>
  )
}
