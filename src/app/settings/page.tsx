'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Check, Upload, Sun, Moon } from 'lucide-react'
import { PLAN_BLURB } from '@/lib/plans'
import { useTheme } from '@/components/theme-provider'

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
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }, [])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  // Resolved after mount, not during render — reading window.location during
  // render makes the server (false) and client (true) disagree → hydration error.
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
      // Don't fake a "Saved" — only the unique-username case has a tailored hint.
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
      <div className="max-w-xl animate-fade-in pb-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Manage your profile and billing.</p>

        {/* Upgrade success */}
        {justUpgraded && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl px-5 py-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">You&apos;re now on Pro!</div>
              <div className="text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">All Pro features are unlocked. Billing will be set up when payment processing launches.</div>
            </div>
          </div>
        )}

        {/* Profile */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-slate-900 dark:text-white">Profile</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                id="display-name"
                label="Display name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
              <div>
                <Input
                  id="portfolio-username"
                  label="Portfolio username"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="yourname"
                />
                {username && !usernameError && (
                  <p className="text-xs text-slate-400 mt-1">
                    Public URL: <span className="font-mono text-indigo-500">/u/{username}</span>
                  </p>
                )}
                {usernameError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{usernameError}</p>
                )}
              </div>
              {saveError && <p className="text-xs text-red-500 dark:text-red-400">{saveError}</p>}
              <Button type="submit" loading={loading} size="sm">
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-slate-900 dark:text-white">Theme</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>Light Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>Dark Mode</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Branding (Pro) */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Branding</h2>
              {plan !== 'pro' && <Badge variant="free">Pro feature</Badge>}
            </div>
          </CardHeader>
          <CardContent className={plan !== 'pro' ? 'opacity-50 pointer-events-none' : ''}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Accent color</label>
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                      style={{
                        backgroundColor: c,
                        outline: accentColor === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {accentColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Logo</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-500 transition-colors w-full cursor-pointer">
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
                {logoError && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{logoError}</p>}
              </div>
              {plan === 'pro' && (
                <Button size="sm" onClick={handleSave} loading={loading}>
                  {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save branding'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card id="billing">
          <CardHeader>
            <h2 className="font-semibold text-slate-900 dark:text-white">Billing</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 dark:text-white">Current plan</span>
                  <Badge variant={plan}>{plan === 'pro' ? 'Pro' : 'Free'}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {plan === 'pro' ? PLAN_BLURB.pro : PLAN_BLURB.free}
                </p>
              </div>
              {plan === 'free' ? (
                <Button onClick={handleUpgrade} size="sm">Upgrade to Pro</Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={handleManageBilling}>Manage billing</Button>
              )}
            </div>
            {billingError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-3">{billingError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

