'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Sparkles, User, Building2, FolderPlus, Send, Eye,
  Check, Copy, ArrowRight, ArrowLeft, Lock, Mail, Plus,
  Trash2, ShieldCheck, Globe, Palette, Upload, Loader2, ExternalLink
} from 'lucide-react'

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#22C55E', '#3B82F6', '#F97316'
]

type OnboardingStep =
  | 'welcome'
  | 'persona'
  | 'project'
  | 'team'
  | 'update'
  | 'portal'
  | 'complete'

type Persona = 'freelancer' | 'agency'

export default function OnboardingPage() {
  const router = useRouter()
  const [initLoading, setInitLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [persona, setPersona] = useState<Persona>('freelancer')

  // Step 1: Welcome & Studio Identity
  const [name, setName] = useState('')
  const [studioName, setStudioName] = useState('')
  const [accentColor, setAccentColor] = useState(COLORS[0])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')

  // Step 3: First Project
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [projectColor, setProjectColor] = useState(COLORS[0])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectSlug, setProjectSlug] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)

  // Agency Team Invites
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [currentInviteEmail, setCurrentInviteEmail] = useState('')
  const [invitingTeam, setInvitingTeam] = useState(false)

  // Step 4: First Update Composer
  const [updateCompleted, setUpdateCompleted] = useState('Kickoff checklist established and initial project scope defined.')
  const [updateNext, setUpdateNext] = useState('Reviewing client assets and preparing initial concepts.')
  const [updateNote, setUpdateNote] = useState('')
  const [updatePublished, setUpdatePublished] = useState(false)

  // Step 5: Portal Settings & Sharing
  const [passcode, setPasscode] = useState('')
  const [savingPasscode, setSavingPasscode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
  }, [])

  // ── Load persisted state on mount ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }: { data: any }) => {
      const user = data?.user
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)
      setUserEmail(user.email || '')

      try {
        const res = await fetch('/api/onboarding/state')
        const data = await res.json()
        if (data.profile) {
          if (data.profile.onboarded) {
            router.push('/dashboard')
            return
          }
          if (data.profile.name) setName(data.profile.name)
          if (data.profile.studio_name) setStudioName(data.profile.studio_name)
          if (data.profile.accent_color) setAccentColor(data.profile.accent_color)
          if (data.profile.logo_url) setLogoUrl(data.profile.logo_url)
          if (data.profile.onboarding_persona) setPersona(data.profile.onboarding_persona)
          if (data.profile.onboarding_step && data.profile.onboarding_step !== 'complete') {
            setStep(data.profile.onboarding_step)
          }
          if (data.profile.onboarding_org_id) setOrgId(data.profile.onboarding_org_id)
        }

        if (data.project) {
          setProjectId(data.project.id)
          setProjectName(data.project.project_name)
          setClientName(data.project.client_name)
          setClientEmail(data.project.client_email || '')
          setProjectSlug(data.project.slug)
          setProjectColor(data.project.color || COLORS[0])
          if (data.project.passcode) setPasscode(data.project.passcode)
        }
      } catch (err) {
        console.error('Failed to load onboarding state:', err)
      } finally {
        setInitLoading(false)
      }
    })
  }, [router])

  // ── Sync step to DB ────────────────────────────────────────────────────────
  async function persistStep(nextStep: OnboardingStep, extraUpdates: Record<string, any> = {}) {
    setStep(nextStep)
    setError('')
    try {
      await fetch('/api/onboarding/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_step: nextStep,
          onboarding_persona: persona,
          ...extraUpdates,
        }),
      })
    } catch (err) {
      console.warn('Failed to persist onboarding state:', err)
    }
  }

  // ── Step 1: Welcome & Studio Identity ──────────────────────────────────────
  async function handleWelcome(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const cleanName = name.trim()
    const cleanStudio = studioName.trim() || cleanName

    await persistStep('persona', {
      name: cleanName,
      studio_name: cleanStudio,
      accent_color: accentColor,
    })

    setLoading(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setLogoUploading(true)
    setLogoError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${userId}/logo.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

      if (uploadErr) {
        setLogoError('Could not upload logo. You can add one later in Settings.')
        setLogoUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      await fetch('/api/onboarding/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: publicUrl }),
      })
      setLogoUrl(publicUrl)
    } catch (err) {
      setLogoError('Logo upload failed. You can add one later.')
    } finally {
      setLogoUploading(false)
    }
  }

  // ── Step 2: Persona Choice ────────────────────────────────────────────────
  async function handleSelectPersona(selected: Persona) {
    setPersona(selected)
    setLoading(true)
    setError('')

    let createdOrgId = orgId
    if (selected === 'agency' && !createdOrgId) {
      try {
        const res = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studioName || `${name}'s Studio`,
            accent_color: accentColor,
          }),
        })
        const data = await res.json()
        if (data.organization?.id) {
          createdOrgId = data.organization.id
          setOrgId(createdOrgId)
        }
      } catch (err) {
        console.warn('Agency organization creation deferred:', err)
      }
    }

    await persistStep('project', {
      onboarding_persona: selected,
      onboarding_org_id: createdOrgId,
    })
    setLoading(false)
  }

  // ── Step 3: First Project ─────────────────────────────────────────────────
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!projectName.trim() || !clientName.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Duplicate Prevention: Check if user already created their onboarding project
    if (projectId) {
      // Simply update the existing project record rather than creating a duplicate
      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          project_name: projectName.trim(),
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          color: projectColor,
        })
        .eq('id', projectId)

      if (updateErr) {
        setError(updateErr.message)
        setLoading(false)
        return
      }

      await persistStep(persona === 'agency' ? 'team' : 'update', {
        onboarding_project_id: projectId,
      })
      setLoading(false)
      return
    }

    // 2. Create fresh project
    const baseSlug = generateSlug(projectName.trim())
    let slug = baseSlug
    let attempt = 0
    while (attempt < 5) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('slug', slug)
      if ((count ?? 0) === 0) break
      attempt++
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const { data: newProj, error: createErr } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        org_id: orgId || null,
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        project_name: projectName.trim(),
        slug,
        color: projectColor,
        status: 'active',
      })
      .select()
      .single()

    if (createErr) {
      setError(
        createErr.message.includes('FREE_PROJECT_LIMIT')
          ? "You've reached your free plan limit of 2 active projects."
          : "We couldn't create your project. Please try again."
      )
      setLoading(false)
      return
    }

    setProjectId(newProj.id)
    setProjectSlug(newProj.slug)

    // 3. Seed starter checklist items automatically
    try {
      await supabase.from('checklist_items').insert([
        { project_id: newProj.id, user_id: userId, title: 'Project kickoff & scope alignment', assigned_to: 'freelancer', position: 0 },
        { project_id: newProj.id, user_id: userId, title: 'Provide brand assets, copy & access logins', assigned_to: 'client', position: 1 },
        { project_id: newProj.id, user_id: userId, title: 'First concept review & walkthrough', assigned_to: 'freelancer', position: 2 },
        { project_id: newProj.id, user_id: userId, title: 'Final deliverable approval & signoff', assigned_to: 'client', position: 3 },
      ])
    } catch (chkErr) {
      console.warn('Checklist seeding warning:', chkErr)
    }

    // 4. Track first_project_created activation event
    fetch('/api/activation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'first_project_created',
        projectId: newProj.id,
        metadata: { persona, hasClientEmail: Boolean(clientEmail.trim()) },
      }),
    }).catch(() => {})

    await persistStep(persona === 'agency' ? 'team' : 'update', {
      onboarding_project_id: newProj.id,
    })
    setLoading(false)
  }

  // ── Skip project creation ──────────────────────────────────────────────────
  async function handleSkipProject(skipToDashboard = false) {
    setLoading(true)
    setError('')
    if (persona === 'agency' && !skipToDashboard) {
      await persistStep('team')
      setLoading(false)
    } else {
      await persistStep('complete', { onboarded: true })
      router.push('/dashboard')
    }
  }

  // ── Step 3b: Agency Team Invites ──────────────────────────────────────────
  async function handleSendTeamInvites(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId || inviteEmails.length === 0) {
      if (!projectId) {
        await persistStep('complete', { onboarded: true })
        router.push('/dashboard')
      } else {
        await persistStep('update')
      }
      return
    }

    setInvitingTeam(true)
    setError('')

    try {
      for (const email of inviteEmails) {
        await fetch(`/api/organizations/${orgId}/invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'member' }),
        })
      }
    } catch (err) {
      console.warn('Team invites sent with partial warnings')
    } finally {
      setInvitingTeam(false)
      if (!projectId) {
        await persistStep('complete', { onboarded: true })
        router.push('/dashboard')
      } else {
        await persistStep('update')
      }
    }
  }

  function addInviteEmail() {
    const clean = currentInviteEmail.trim().toLowerCase()
    if (clean && clean.includes('@') && !inviteEmails.includes(clean)) {
      setInviteEmails(prev => [...prev, clean])
      setCurrentInviteEmail('')
    }
  }

  // ── Step 4: First Update ──────────────────────────────────────────────────
  async function handlePublishUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const bullets = [updateCompleted.trim(), updateNext.trim()].filter(Boolean)

    const { data: updateData, error: updateErr } = await supabase
      .from('updates')
      .insert({
        project_id: projectId,
        bullets,
        note: updateNote.trim() || null,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (updateErr) {
      setError("Your update couldn't be published. Please try again.")
      setLoading(false)
      return
    }

    setUpdatePublished(true)

    // Track first_update_published activation event
    fetch('/api/activation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'first_update_published',
        projectId,
        metadata: { bulletCount: bullets.length },
      }),
    }).catch(() => {})

    await persistStep('portal')
    setLoading(false)
  }

  // ── Step 5: Portal Settings & Sharing ─────────────────────────────────────
  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${projectSlug}`

  async function copyPortalLink() {
    await navigator.clipboard.writeText(portalUrl)
    setCopiedLink(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopiedLink(false), 2000)

    fetch('/api/activation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'first_portal_viewed',
        projectId,
      }),
    }).catch(() => {})
  }

  async function handleSavePasscode() {
    if (!projectId) return
    setSavingPasscode(true)
    const supabase = createClient()
    await supabase
      .from('projects')
      .update({ passcode: passcode.trim() || null })
      .eq('id', projectId)
    setSavingPasscode(false)
  }

  async function handleSendClientEmail() {
    if (!projectId || !clientEmail) return
    setSendingInvite(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/send-portal-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: clientEmail }),
      })
      if (res.ok) {
        setInviteSent(true)
      }
    } catch (err) {
      console.warn('Invite email error:', err)
    } finally {
      setSendingInvite(false)
    }
  }

  // ── Step 6: Complete & Handoff ────────────────────────────────────────────
  async function handleFinish(destination: 'project' | 'dashboard') {
    setLoading(true)
    await persistStep('complete', { onboarded: true })
    if (destination === 'project' && projectId) {
      router.push(`/project/${projectId}`)
    } else {
      router.push('/dashboard')
    }
  }

  if (initLoading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-indigo-500/30 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Frevio Brand Header */}
      <div className="flex items-center gap-2.5 mb-8 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="text-lg font-light uppercase tracking-wider text-white">
          Frevio
        </span>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-xl relative z-10 animate-fade-in">

        {/* ── STEP 1: Welcome & Studio Identity ────────────────────────────── */}
        {step === 'welcome' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                <span>Welcome</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Let&apos;s set up your Frevio workspace.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                We&apos;ll get your first client project ready in a few minutes.
              </p>
            </div>

            <form onSubmit={handleWelcome} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Studio or business name <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rivera Creative"
                  value={studioName}
                  onChange={e => setStudioName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Brand Accent Color
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-1 ring-white/10 cursor-pointer"
                      style={{
                        backgroundColor: c,
                        outline: accentColor === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                      aria-label={`Select accent ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Studio Logo <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <label className="flex items-center gap-3 border-2 border-dashed border-white/10 rounded-xl p-4 text-xs sm:text-sm text-slate-400 hover:border-white/20 hover:text-white transition-colors w-full cursor-pointer bg-white/[0.02]">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="h-8 w-auto object-contain rounded" />
                  ) : (
                    <Upload className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  )}
                  <span>{logoUploading ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo (PNG, SVG, JPG)'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />
                </label>
                {logoError && <p className="text-xs text-rose-400 mt-1">{logoError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Persona Choice ───────────────────────────────────────── */}
        {step === 'persona' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <button
              type="button"
              onClick={() => setStep('welcome')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                <span>Work Style</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                How do you work?
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5">
                We&apos;ll tailor your initial workspace and client tools accordingly.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleSelectPersona('freelancer')}
                className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  persona === 'freelancer'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-white shadow-lg'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">I&apos;m a freelancer</div>
                  <div className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                    I work with clients on my own. Keep things simple, direct, and fast.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectPersona('agency')}
                className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  persona === 'agency'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-white shadow-lg'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">I run a studio or agency</div>
                  <div className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                    I work with a team, project managers, and multiple concurrent client projects.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: First Project ────────────────────────────────────────── */}
        {step === 'project' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <button
              type="button"
              onClick={() => setStep('persona')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <span>First Project</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Let&apos;s create your first project.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5">
                This is what your client will see in their Frevio workspace.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Project name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website redesign"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Client name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Client email <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="client@acme.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Project Color Badge
                </label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setProjectColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-1 ring-white/10 cursor-pointer"
                      style={{
                        backgroundColor: c,
                        outline: projectColor === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSkipProject(false)}
                  className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 px-5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading || !projectName.trim() || !clientName.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSkipProject(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Skip setup &amp; go directly to dashboard &rarr;
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3b: Agency Team Invites (Optional) ──────────────────────── */}
        {step === 'team' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <span>Studio Team</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Bring your team into Frevio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5">
                You can invite your team now or do it later from Settings.
              </p>
            </div>

            <form onSubmit={handleSendTeamInvites} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Team member email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="colleague@agency.com"
                    value={currentInviteEmail}
                    onChange={e => setCurrentInviteEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInviteEmail()
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addInviteEmail}
                    className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {inviteEmails.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    Pending invitations ({inviteEmails.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inviteEmails.map(m => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-200"
                      >
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{m}</span>
                        <button
                          type="button"
                          onClick={() => setInviteEmails(prev => prev.filter(x => x !== m))}
                          className="text-slate-500 hover:text-white ml-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={invitingTeam}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {invitingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{inviteEmails.length > 0 ? 'Invite team & continue' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!projectId) {
                      await persistStep('complete', { onboarded: true })
                      router.push('/dashboard')
                    } else {
                      await persistStep('update')
                    }
                  }}
                  className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 px-5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  I&apos;ll do this later
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 4: First Update ─────────────────────────────────────────── */}
        {step === 'update' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                <span>First Update</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Give your client their first update.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                A simple progress update is all you need to see Frevio from your client&apos;s perspective.
              </p>
            </div>

            <form onSubmit={handlePublishUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  What was completed
                </label>
                <input
                  type="text"
                  required
                  value={updateCompleted}
                  onChange={e => setUpdateCompleted(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  What&apos;s next
                </label>
                <input
                  type="text"
                  required
                  value={updateNext}
                  onChange={e => setUpdateNext(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Note or needs from client <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please confirm login details when ready."
                  value={updateNote}
                  onChange={e => setUpdateNote(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => persistStep('portal')}
                  className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 px-5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Skip update
                </button>
                <button
                  type="submit"
                  disabled={loading || !updateCompleted.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Publish update</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 5: The Aha Moment / Client Portal Preview ───────────────── */}
        {step === 'portal' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <span>The Client Experience</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                This is what your client sees.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                A live, interactive portal branded with your studio identity. No account or password required for them to view progress.
              </p>
            </div>

            {/* Live Client Portal Preview Box */}
            <div className="rounded-2xl border border-white/10 bg-[#08090a] p-5 space-y-4 shadow-inner">
              {/* Fake browser address bar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 text-center font-mono text-[11px] text-slate-400 truncate bg-white/5 rounded-lg py-1 px-3 border border-white/5">
                  {portalUrl}
                </div>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Open portal in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Portal Content Snippet */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        {(studioName || name).charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">{projectName}</div>
                      <div className="text-[11px] text-slate-400 font-light">{clientName}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Now
                  </span>
                </div>

                {/* Latest Update Card Preview */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Latest Progress Update
                  </div>
                  <ul className="space-y-1.5 text-slate-300 font-light list-disc list-inside">
                    <li>{updateCompleted}</li>
                    <li>{updateNext}</li>
                  </ul>
                  {updateNote && (
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                      Note: {updateNote}
                    </div>
                  )}
                </div>

                {/* Starter Checklist Indicator */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex items-center justify-between text-slate-400 font-light">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    4 Kickoff Checklist items initialized
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Ready</span>
                </div>
              </div>
            </div>

            {/* Share link & Passcode options */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Share this link with your client
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={portalUrl}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyPortalLink}
                    className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
                  </button>
                </div>
              </div>

              {/* Passcode Protection (Optional) */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Portal Passcode Protection</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-light mt-0.5">
                    {passcode ? 'Passcode enabled for additional security' : 'Optional PIN protection for this workspace'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    maxLength={10}
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    className="w-24 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-center text-white focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleSavePasscode}
                    disabled={savingPasscode}
                    className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors cursor-pointer"
                  >
                    {savingPasscode ? 'Saving…' : 'Save PIN'}
                  </button>
                </div>
              </div>

              {/* Email direct to client button if email provided */}
              {clientEmail && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email portal link to {clientEmail}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-light mt-0.5">
                      Sends a clean invitation email with direct portal access
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendClientEmail}
                    disabled={sendingInvite || inviteSent}
                    className="px-3.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer flex-shrink-0"
                  >
                    {sendingInvite ? 'Sending…' : inviteSent ? 'Sent ✓' : 'Send invitation'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => persistStep('complete')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-4"
              >
                <span>Continue to complete</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Completion Screen ────────────────────────────────────── */}
        {step === 'complete' && (
          <div className="bg-[#0c0d12]/95 rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                Your client workspace is ready.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-2 max-w-md mx-auto leading-relaxed">
                Your project is live. Share the portal with your client and keep every update, approval, and payment in one place.
              </p>
            </div>

            {/* Direct copy link snippet */}
            <div className="bg-[#08090a] rounded-2xl border border-white/10 p-4 max-w-md mx-auto text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Client Portal URL
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={portalUrl}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyPortalLink}
                  className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleFinish('project')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-3 px-6 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <span>Open project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleFinish('dashboard')}
                className="w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors py-2 cursor-pointer"
              >
                Go to dashboard &rarr;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
