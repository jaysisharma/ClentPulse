'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import {
  Building2, Users, Plus, Mail, Shield, UserX,
  Copy, Check, Trash2, ArrowRight, Loader2, Sparkles, AlertTriangle,
  Palette, Globe, ExternalLink, RefreshCw, Clock, CheckCircle2, Lock, History, Send
} from 'lucide-react'
import { Organization, OrganizationMember, OrganizationInvite, ActivityLog } from '@/types'
import { ACTIVE_WORKSPACE_COOKIE, parseActiveWorkspaceId } from '@/lib/workspace'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const COLOR_PRESETS = [
  { name: 'Electric Indigo', hex: '#6366F1' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Midnight Cyan', hex: '#06B6D4' },
]

export default function TeamSettingsPage() {
  const router = useRouter()
  const [activeOrgId, setActiveOrgId] = useState<string>('personal')
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [callerRole, setCallerRole] = useState<'owner' | 'admin' | 'member'>('member')
  const [loading, setLoading] = useState(true)

  // Agency Profile Edit
  const [orgName, setOrgName] = useState('')
  const [savingOrg, setSavingOrg] = useState(false)
  const [orgSaveSuccess, setOrgSaveSuccess] = useState(false)

  // Agency Branding & White-Labeling
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#6366F1')
  const [whiteLabel, setWhiteLabel] = useState(false)
  const [savingBranding, setSavingBranding] = useState(false)
  const [brandingSuccess, setBrandingSuccess] = useState(false)
  const [brandingError, setBrandingError] = useState('')

  // Custom Domain CNAME
  const [customDomain, setCustomDomain] = useState('')
  const [savingDomain, setSavingDomain] = useState(false)
  const [domainSuccess, setDomainSuccess] = useState(false)
  const [domainError, setDomainError] = useState('')
  const [verifyingDomain, setVerifyingDomain] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean
    message: string
    resolvedTarget?: string | null
  } | null>(null)

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Create Agency Modal for Personal Studio
  const [newAgencyName, setNewAgencyName] = useState('')
  const [creatingOrg, setCreatingOrg] = useState(false)

  useEffect(() => {
    let orgId = 'personal'
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${ACTIVE_WORKSPACE_COOKIE}=`))
      if (match) {
        orgId = parseActiveWorkspaceId(decodeURIComponent(match.split('=')[1]))
      }
    }
    setActiveOrgId(orgId)

    if (orgId === 'personal') {
      setLoading(false)
      return
    }

    loadOrgData(orgId)
  }, [])

  async function loadOrgData(id: string) {
    setLoading(true)
    try {
      const [orgRes, invitesRes, actRes] = await Promise.all([
        fetch(`/api/organizations/${id}`),
        fetch(`/api/organizations/${id}/invites`),
        fetch(`/api/organizations/${id}/activity`),
      ])

      if (orgRes.ok) {
        const data = await orgRes.json()
        setOrg(data.organization)
        setOrgName(data.organization.name)
        setLogoUrl(data.organization.logo_url || '')
        setFaviconUrl(data.organization.favicon_url || '')
        setAccentColor(data.organization.accent_color || '#6366F1')
        setWhiteLabel(Boolean(data.organization.white_label))
        setCustomDomain(data.organization.custom_domain || '')
        setMembers(data.members)
        setCallerRole(data.callerRole)
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json()
        setInvites(data.invites)
      }

      if (actRes.ok) {
        const data = await actRes.json()
        setActivities(data.activities || [])
      }
    } catch (err) {
      console.error('Error loading team:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setSavingOrg(true)
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName }),
      })
      if (res.ok) {
        setOrgSaveSuccess(true)
        setTimeout(() => setOrgSaveSuccess(false), 2500)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingOrg(false)
    }
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setSavingBranding(true)
    setBrandingError('')
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          accent_color: accentColor,
          white_label: whiteLabel,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save branding')
      setOrg(data.organization)
      setBrandingSuccess(true)
      setTimeout(() => setBrandingSuccess(false), 2500)
      router.refresh()
    } catch (err: any) {
      setBrandingError(err.message)
    } finally {
      setSavingBranding(false)
    }
  }

  async function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setSavingDomain(true)
    setDomainError('')
    setVerificationResult(null)
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_domain: customDomain,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save custom domain')
      setOrg(data.organization)
      setCustomDomain(data.organization.custom_domain || '')
      setDomainSuccess(true)
      setTimeout(() => setDomainSuccess(false), 2500)
      router.refresh()
    } catch (err: any) {
      setDomainError(err.message)
    } finally {
      setSavingDomain(false)
    }
  }

  async function handleVerifyDomain() {
    if (!org) return
    setVerifyingDomain(true)
    try {
      const res = await fetch(`/api/organizations/${org.id}/domain-verify`)
      const data = await res.json()
      setVerificationResult(data)
    } catch (err: any) {
      setVerificationResult({ verified: false, message: 'Verification request failed' })
    } finally {
      setVerifyingDomain(false)
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setInviting(true)
    setInviteError('')

    try {
      const res = await fetch(`/api/organizations/${org.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setInvites(prev => [data.invite, ...prev])
      setInviteEmail('')
      setShowInviteModal(false)
    } catch (err: any) {
      setInviteError(err.message || 'Error inviting member')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!org) return
    if (!confirm('Are you sure you want to remove this member from the organization?')) return

    try {
      const res = await fetch(`/api/organizations/${org.id}/members/${memberId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCreateAgencyFromPersonal(e: React.FormEvent) {
    e.preventDefault()
    if (!newAgencyName.trim()) return
    setCreatingOrg(true)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgencyName.trim() }),
      })

      const data = await res.json()
      if (res.ok) {
        document.cookie = `${ACTIVE_WORKSPACE_COOKIE}=${data.organization.id}; path=/; max-age=31536000`
        setActiveOrgId(data.organization.id)
        loadOrgData(data.organization.id)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingOrg(false)
    }
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2500)
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Agency Command</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-slate-900 dark:text-white">
                Team & Organization
              </h1>
            </div>

            {activeOrgId !== 'personal' && ['owner', 'admin'].includes(callerRole) && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Team Member</span>
              </button>
            )}
          </div>

          {/* If currently in Personal Workspace */}
          {activeOrgId === 'personal' ? (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 text-center max-w-xl mx-auto backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-light uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                Personal Studio Mode
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mb-6 leading-relaxed">
                You are currently in your Personal Solo Workspace. To invite developers, project managers, and deliver multi-team client portals, launch an Agency Workspace.
              </p>

              <form onSubmit={handleCreateAgencyFromPersonal} className="space-y-3 max-w-md mx-auto">
                <input
                  type="text"
                  required
                  placeholder="Enter your Agency Name (e.g. Acme Studio)"
                  value={newAgencyName}
                  onChange={e => setNewAgencyName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-center"
                />
                <button
                  type="submit"
                  disabled={creatingOrg || !newAgencyName.trim()}
                  className="w-full py-2.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {creatingOrg ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Agency…</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Agency Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Agency Profile Details */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {org?.name}
                      </h2>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        Slug: {org?.slug} · Plan: <span className="capitalize text-indigo-600 dark:text-indigo-400 font-medium">{org?.billing_plan}</span>
                      </div>
                    </div>
                  </div>

                  {['owner', 'admin'].includes(callerRole) && (
                    <form onSubmit={handleSaveOrg} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={savingOrg || orgName === org?.name}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-40"
                      >
                        {savingOrg ? 'Saving…' : 'Rename'}
                      </button>
                    </form>
                  )}
                </div>

                {orgSaveSuccess && (
                  <div className="mt-3 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Agency profile updated successfully
                  </div>
                )}
              </div>

              {/* Agency Branding & White-Labeling */}
              {['owner', 'admin'].includes(callerRole) && (
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                      >
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Agency Branding & White-Labeling
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                          Personalize logos, favicons, primary accent palette, and client portal unbranding.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBranding} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Agency Logo URL (PNG/SVG)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="https://youragency.com/logo.png"
                            value={logoUrl}
                            onChange={e => setLogoUrl(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          {logoUrl && (
                            <img src={logoUrl} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain bg-white/5 border border-white/10 p-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Portal Favicon URL (ICO/PNG)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="https://youragency.com/favicon.ico"
                            value={faviconUrl}
                            onChange={e => setFaviconUrl(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                          {faviconUrl && (
                            <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 rounded-lg object-contain bg-white/5 border border-white/10 p-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Accent Color Palette */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Portal Primary Accent Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2.5 mb-3">
                        {COLOR_PRESETS.map(preset => (
                          <button
                            key={preset.hex}
                            type="button"
                            onClick={() => setAccentColor(preset.hex)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                              accentColor.toLowerCase() === preset.hex.toLowerCase()
                                ? 'ring-2 ring-indigo-500 border-transparent bg-white/10 text-white font-semibold'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 max-w-xs">
                        <div
                          className="w-8 h-8 rounded-xl flex-shrink-0 shadow-inner border border-white/10"
                          style={{ backgroundColor: accentColor }}
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={e => setAccentColor(e.target.value)}
                          placeholder="#6366F1"
                          maxLength={7}
                          className="w-28 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white uppercase focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-light">Custom HEX</span>
                      </div>
                    </div>

                    {/* White-Label Mode Toggle */}
                    <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            100% White-Label Client Portals
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                            Agency
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
                          Completely removes "Powered by Frevio" branding and badges from all client status pages and deliverable links.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={whiteLabel}
                          onChange={e => setWhiteLabel(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {brandingError && (
                      <p className="text-xs text-rose-500 font-mono">{brandingError}</p>
                    )}

                    {brandingSuccess && (
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Branding preferences saved successfully
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingBranding}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        {savingBranding ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Branding…</span>
                          </>
                        ) : (
                          <span>Save Branding & Colors</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Custom Domain (CNAME) Configuration */}
              {['owner', 'admin'].includes(callerRole) && (
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Custom Domain & CNAME Routing
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                          Serve client status pages on your agency's own branded subdomain (e.g. status.youragency.com).
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveDomain} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Agency Custom Subdomain
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="status.youragency.com"
                            value={customDomain}
                            onChange={e => setCustomDomain(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            disabled={savingDomain}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            {savingDomain ? 'Saving…' : 'Save Domain'}
                          </button>

                          {customDomain && (
                            <button
                              type="button"
                              onClick={handleVerifyDomain}
                              disabled={verifyingDomain}
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${verifyingDomain ? 'animate-spin' : ''}`} />
                              <span>Verify DNS</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {domainError && (
                      <p className="text-xs text-rose-500 font-mono">{domainError}</p>
                    )}

                    {domainSuccess && (
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Domain settings saved
                      </div>
                    )}

                    {/* Verification Result Banner */}
                    {verificationResult && (
                      <div className={`p-4 rounded-xl border text-xs font-mono ${
                        verificationResult.verified
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className="flex items-center gap-2 font-semibold mb-1">
                          {verificationResult.verified ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          <span>{verificationResult.verified ? 'DNS Verified' : 'DNS Record Pending'}</span>
                        </div>
                        <p className="font-sans font-light text-slate-600 dark:text-slate-300">{verificationResult.message}</p>
                      </div>
                    )}

                    {/* CNAME Instructions Card */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        DNS CNAME Instructions
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                        Add the following DNS record at your domain registrar (e.g. Cloudflare, Namecheap, GoDaddy):
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] uppercase text-slate-400">Type</div>
                          <div className="font-semibold text-slate-900 dark:text-white mt-0.5">CNAME</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] uppercase text-slate-400">Host / Name</div>
                          <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                            {customDomain ? customDomain.split('.')[0] : 'status'}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase text-slate-400">Points to / Value</div>
                            <div className="font-semibold text-slate-900 dark:text-white mt-0.5">cname.frevio.app</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('cname.frevio.app')
                              alert('Copied cname.frevio.app to clipboard')
                            }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Copy CNAME value"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {customDomain && (
                        <div className="pt-1 flex items-center gap-2">
                          <a
                            href={`https://${customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            <span>Test domain link: https://{customDomain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Team Members List */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Team Seats ({members.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                      Colleagues with access to this agency workspace.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {members.map(m => (
                    <div key={m.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center uppercase">
                          {m.user?.name?.[0] || m.user?.email?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {m.user?.name || 'Studio Member'}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                            {m.user?.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full capitalize font-semibold ${
                          m.role === 'owner'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                            : m.role === 'admin'
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                        }`}>
                          {m.role === 'admin' ? 'Project Manager' : m.role}
                        </span>

                        {callerRole === 'owner' && m.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations */}
              {invites.length > 0 && (
                <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Pending Invitations ({invites.length})
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {invites.map(inv => (
                      <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{inv.email}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-2 capitalize">({inv.role})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyInviteLink(inv.token)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          >
                            {copiedToken === inv.token ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied Link</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Audit Trail */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 backdrop-blur-md shadow-xs ring-1 ring-slate-950/5 dark:ring-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Activity Audit Trail
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {activities.length} event{activities.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-4">
                  Chronological trail of internal notes, update review approvals, client broadcasts, and team operations.
                </p>

                {activities.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                    <History className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      No agency activity recorded yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-96 overflow-y-auto pr-1">
                    {activities.map(act => (
                      <div key={act.id} className="py-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {act.action === 'update.published' ? (
                            <Send className="w-3.5 h-3.5 text-emerald-500" />
                          ) : act.action === 'update.review_submitted' ? (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          ) : act.action === 'update.approved' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                          ) : act.action === 'comment.internal' ? (
                            <Lock className="w-3.5 h-3.5 text-indigo-500" />
                          ) : act.action === 'member.invited' ? (
                            <Mail className="w-3.5 h-3.5 text-purple-500" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {act.user?.name || act.user?.email?.split('@')[0] || 'Team member'}
                            </span>{' '}
                            {act.action === 'update.published' && 'published an update'}
                            {act.action === 'update.review_submitted' && 'submitted a draft for PM review'}
                            {act.action === 'update.approved' && 'approved an update draft'}
                            {act.action === 'comment.internal' && 'added an internal note'}
                            {act.action === 'comment.added' && 'commented on an update'}
                            {act.action === 'member.invited' && 'invited a new team member'}
                            {act.action === 'pod.assigned' && 'assigned a specialist to the project pod'}
                            {!['update.published', 'update.review_submitted', 'update.approved', 'comment.internal', 'comment.added', 'member.invited', 'pod.assigned'].includes(act.action) && act.action}
                            {act.project?.project_name && (
                              <span className="text-slate-500 dark:text-slate-400"> on <strong className="font-medium text-slate-700 dark:text-slate-300">{act.project.project_name}</strong></span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invite Member Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl ring-1 ring-slate-950/5 dark:ring-white/5 animate-scale-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Invite Team Member
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                      Send an invitation to join {org?.name}.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="colleague@agency.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Role & Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setInviteRole('member')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          inviteRole === 'member'
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-semibold">Specialist / Member</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-light mt-0.5">
                          Logs hours, checks off tasks, contributes deliverables.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInviteRole('admin')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          inviteRole === 'admin'
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-semibold">Project Manager</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-light mt-0.5">
                          Manages projects, invoices, and client broadcasts.
                        </div>
                      </button>
                    </div>
                  </div>

                  {inviteError && (
                    <div className="text-xs text-rose-500 font-medium">
                      {inviteError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviting || !inviteEmail.trim()}
                      className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Invite…</span>
                        </>
                      ) : (
                        <span>Send Invitation</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </DarkShell>
    </AppLayout>
  )
}
