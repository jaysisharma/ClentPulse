'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import {
  Check, Upload, Sun, Moon, Copy, Code2, Key, Trash2,
  ArrowUpRight, Sparkles, ExternalLink, Gift, Zap, Shield,
  Crown, TrendingUp, Palette, Briefcase, Layers,
  Clock, FileText, BarChart3, Loader2, Lock, Eye, EyeOff,
  User, Globe, AlertCircle, RefreshCw
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
  { hex: '#6366F1', name: 'Electric Indigo' },
  { hex: '#8B5CF6', name: 'Cyber Violet' },
  { hex: '#EC4899', name: 'Neon Pink' },
  { hex: '#EF4444', name: 'Crimson Red' },
  { hex: '#F97316', name: 'Solar Orange' },
  { hex: '#22C55E', name: 'Emerald Green' },
  { hex: '#14B8A6', name: 'Teal Cyan' },
  { hex: '#3B82F6', name: 'Deep Blue' },
]

const SETTINGS_TABS = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'security',     label: 'Security',      icon: Lock },
  { id: 'appearance',   label: 'Branding',      icon: Palette },
  { id: 'modules',      label: 'Modules',       icon: Layers },
  { id: 'integrations', label: 'Integrations',  icon: Globe },
  { id: 'developer',    label: 'Developer',     icon: Code2 },
  { id: 'billing',      label: 'Subscription',  icon: Sparkles },
] as const

type SettingsTab = typeof SETTINGS_TABS[number]['id']

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

function SectionCard({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 transition-all',
        className
      )}
    >
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
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()

  const requestedTab = (searchParams?.get('tab') as SettingsTab) || 'profile'
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    SETTINGS_TABS.some(t => t.id === requestedTab) ? requestedTab : 'profile'
  )

  const [name, setName] = useState('')
  const [initialName, setInitialName] = useState('')
  const [username, setUsername] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
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
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null)
  const [generatingToken, setGeneratingToken] = useState(false)

  // Security & Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

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
        .then(({ data: profile }: { data: any }) => {
          if (profile) {
            setName(profile.name ?? '')
            setInitialName(profile.name ?? '')
            setUsername(profile.username ?? '')
            setInitialUsername(profile.username ?? '')
            setAccentColor(profile.accent_color ?? '#6366F1')
            setPlan(profile.plan ?? 'free')
            setLogoUrl(profile.logo_url ?? null)
            if (profile.craft) setCraft(profile.craft)
            if (profile.enabled_modules) setModules(resolveModules(profile.enabled_modules))
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

  function switchTab(t: SettingsTab) {
    setActiveTab(t)
    startTransition(() => {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', t)
      window.history.replaceState({}, '', url.toString())
    })
  }

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
    setRevokingTokenId(null)
    if (generatedToken) setGeneratedToken(null)
  }

  async function copyToken(text: string) {
    await navigator.clipboard.writeText(text)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setPasswordError(error.message || 'Failed to update password.')
        setPasswordLoading(false)
        return
      }

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err: any) {
      setPasswordError(err?.message || 'An error occurred while updating your password.')
    } finally {
      setPasswordLoading(false)
    }
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
    setInitialName(name)
    setInitialUsername(slug)
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setLogoUploading(true)
    setLogoError('')

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setLogoError('Please upload a valid image file (PNG, JPG, SVG, or WEBP).')
      setLogoUploading(false)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be less than 2MB.')
      setLogoUploading(false)
      return
    }

    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'png'
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
  const hasUnsavedProfile = name !== initialName || username !== initialUsername

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 max-w-4xl pb-12 space-y-6 animate-fade-in">

          {/* ── Page Header ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Workspace Controls
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Configure your profile, security, appearance, workspace modules, and billing.
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

          {/* ── Navigation Tabs ────────────────────────────────────────── */}
          <div className="border-b border-slate-200 dark:border-white/10 pb-1">
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1" aria-label="Settings categories">
              {SETTINGS_TABS.map(t => {
                const Icon = t.icon
                const isActive = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => switchTab(t.id)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* ── TAB 1: Profile & Public Identity ──────────────────────── */}
          {activeTab === 'profile' && (
            <SectionCard className="p-5 sm:p-6">
              <SectionHeader
                title="Profile & Identity"
                description="How you appear to clients across project portals and your public portfolio."
                badge={
                  hasUnsavedProfile ? (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                      Unsaved changes
                    </span>
                  ) : null
                }
              />

              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
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
                    className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-mono"
                  />
                  {username && !usernameError && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-400">Public profile URL:</span>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2 text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : saved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Saved</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </SectionCard>
          )}

          {/* ── TAB 2: Security & Password ────────────────────────────── */}
          {activeTab === 'security' && (
            <SectionCard className="p-5 sm:p-6">
              <SectionHeader
                title="Security & Password"
                description="Update your account credentials to keep your studio workspace and client data secure."
                badge={<Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />}
              />

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                <div>
                  <label htmlFor="new-password" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 pr-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 pr-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-white/30 focus:ring-1 focus:ring-indigo-500/20 dark:focus:ring-white/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{passwordError}</p>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Password updated successfully.</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2 text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating password…</span>
                      </>
                    ) : passwordSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Updated</span>
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </SectionCard>
          )}

          {/* ── TAB 3: Appearance & Studio Branding ───────────────────── */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Appearance Mode */}
              <SectionCard className="p-5 sm:p-6">
                <SectionHeader
                  title="Appearance"
                  description="Toggle between dark and light workspace modes."
                />
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      theme === 'light'
                        ? 'border-indigo-400 bg-indigo-50 dark:border-white/30 dark:bg-white/[0.08] text-indigo-700 dark:text-white ring-1 ring-indigo-400/30'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]'
                    )}
                  >
                    <Sun className={cn('w-5 h-5', theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500')} />
                    <span className="text-xs font-medium">Light Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                      theme === 'dark'
                        ? 'border-slate-700 bg-slate-900 text-white dark:border-white/30 dark:bg-white/[0.08] ring-1 ring-white/15'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]'
                    )}
                  >
                    <Moon className={cn('w-5 h-5', theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
                    <span className="text-xs font-medium">Dark Canvas</span>
                  </button>
                </div>
              </SectionCard>

              {/* Studio Branding */}
              <SectionCard className="p-5 sm:p-6">
                <SectionHeader
                  title="Studio Branding"
                  description="Customize the brand accent color and studio logo presented on client deliverables."
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

                <div className={cn('space-y-5', !isPaid && 'opacity-50 pointer-events-none select-none')}>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Accent Color
                    </label>
                    <div className="flex gap-2.5 flex-wrap">
                      {ACCENT_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setAccentColor(c.hex)}
                          aria-label={`Select ${c.name} accent`}
                          title={c.name}
                          className="w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: accentColor === c.hex ? `0 0 14px ${c.hex}88` : 'none',
                            outline: accentColor === c.hex ? `2px solid ${c.hex}` : 'none',
                            outlineOffset: '2px',
                          }}
                        >
                          {accentColor === c.hex && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Studio Logo
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

                  {/* Live Branding Preview */}
                  <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Live Client Preview</div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#07080a] border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2.5">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Studio" className="h-5 w-auto object-contain" />
                        ) : (
                          <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: accentColor }}>
                            F
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{name || 'Your Studio'}</span>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: accentColor }}>
                        Client Portal
                      </span>
                    </div>
                  </div>

                  {isPaid && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2 text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
                      Upgrade to Pro to unlock custom branding
                    </Link>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ── TAB 4: Workspace Modules & Craft ──────────────────────── */}
          {activeTab === 'modules' && (
            <SectionCard className="p-5 sm:p-6">
              <SectionHeader
                title="Workspace Modules & Craft"
                description="Tailor active modules for your specific craft (developer, marketer, designer, or consultant)."
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
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
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
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 p-0.5 self-end sm:self-center',
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
          )}

          {/* ── TAB 5: Integrations ───────────────────────────────────── */}
          {activeTab === 'integrations' && (
            <SectionCard className="p-5 sm:p-6 space-y-4">
              <SectionHeader
                title="Integrations & OAuth Connections"
                description="Connect external creative tools to embed assets and synchronize project resources."
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Google Drive & Calendar</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Deliverable assets & meeting sync</p>
                  </div>
                  <Link
                    href="/settings/integrations"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Manage Google
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">GitHub Repositories</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Commit milestones & code links</p>
                  </div>
                  <Link
                    href="/settings/integrations"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Manage GitHub
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Figma Files</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Live design review embeds</p>
                  </div>
                  <Link
                    href="/settings/integrations"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Manage Figma
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/settings/integrations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
                >
                  <span>Open Full Integrations Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </SectionCard>
          )}

          {/* ── TAB 6: Developer Settings & API Keys ──────────────────── */}
          {activeTab === 'developer' && (
            <SectionCard className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Developer Settings & API Keys</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">VS Code · Cursor · Antigravity CLI live sync</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                  Live Sync
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-4">
                Sync active coding intervals and live presence to your client portals automatically. Only tracks workspace timestamps and duration — never raw source code or filenames.
              </p>

              {generatedToken && (
                <div className="p-4 mb-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Generated Key (One-time Reveal)
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
                    Active Extension Tokens ({tokens.length})
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
                          {revokingTokenId === t.id ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <span>Revoke?</span>
                              <button
                                onClick={() => handleRevokeToken(t.id)}
                                className="font-bold underline hover:text-rose-300 cursor-pointer"
                              >
                                Yes
                              </button>
                              <span className="text-slate-600">·</span>
                              <button
                                onClick={() => setRevokingTokenId(null)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setRevokingTokenId(t.id)}
                              className="text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400/70 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                              title="Revoke Token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

          {/* ── TAB 7: Subscription & Referrals ──────────────────────── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Current Plan Card */}
              <SectionCard>
                <div className={cn('rounded-t-2xl p-5 border-b', planMeta.bg, planMeta.border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center border', planMeta.bg, planMeta.border)}>
                        <PlanIcon className={cn('w-5 h-5', planMeta.color)} />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Workspace Plan</div>
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
                        Upgrade to Pro
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

              {/* Referral Link Card */}
              <SectionCard className="p-5 sm:p-6">
                <SectionHeader
                  title="Referral Program"
                  description="Share your unique referral URL and receive recurring platform credits when invited creators subscribe."
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
          )}

        </div>
      </DarkShell>
    </AppLayout>
  )
}
