'use client'

import { useState } from 'react'
import {
  Smartphone, Plus, Download, QrCode, Trash2, Eye, EyeOff,
  Copy, Check, ExternalLink, Sparkles, AlertCircle, ArrowUpRight,
  FileCheck, Calendar, Clock, Layers, UploadCloud, Link as LinkIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatFileSize, getEnvironmentConfig } from '@/lib/app-builds'
import { AppBuildQrModal } from './app-build-qr-modal'
import type { AppBuild } from '@/types'

interface AppBuildsSectionProps {
  projectId: string
  projectName: string
  clientEmail?: string | null
  initialBuilds: AppBuild[]
  canManage?: boolean
}

export function AppBuildsSection({
  projectId,
  projectName,
  clientEmail,
  initialBuilds,
  canManage = true,
}: AppBuildsSectionProps) {
  const [builds, setBuilds] = useState<AppBuild[]>(initialBuilds)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeQrBuild, setActiveQrBuild] = useState<AppBuild | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form State
  const [sourceType, setSourceType] = useState<'upload' | 'url'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null)
  const [versionName, setVersionName] = useState('')
  const [buildNumber, setBuildNumber] = useState('')
  const [environment, setEnvironment] = useState<'staging' | 'client_review' | 'internal_beta' | 'production'>('staging')
  const [minOsVersion, setMinOsVersion] = useState('Android 8.0+')
  const [changelog, setChangelog] = useState('')
  const [notifyClient, setNotifyClient] = useState(Boolean(clientEmail))

  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleCopyLink = async (build: AppBuild) => {
    try {
      await navigator.clipboard.writeText(build.file_url)
      setCopiedId(build.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleActive = async (build: AppBuild) => {
    try {
      const nextActive = !build.is_active
      const res = await fetch(`/api/projects/${projectId}/builds/${build.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setBuilds(prev => prev.map(b => b.id === build.id ? { ...b, is_active: nextActive } : b))
    } catch (err: any) {
      alert(err.message || 'Error updating build')
    }
  }

  const handleDelete = async (buildId: string) => {
    if (!confirm('Are you sure you want to remove this build release?')) return
    try {
      const res = await fetch(`/api/projects/${projectId}/builds/${buildId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete build')
      setBuilds(prev => prev.filter(b => b.id !== buildId))
    } catch (err: any) {
      alert(err.message || 'Error deleting build')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setFileSizeBytes(selected.size)

      // Try auto-extracting version if name matches pattern (e.g., app-v1.0.4.apk or v2.1.apk)
      if (!versionName) {
        const match = selected.name.match(/v?(\d+\.\d+(\.\d+)?)/i)
        if (match) {
          setVersionName(`v${match[1]}`)
        }
      }
    }
  }

  const handleSaveBuild = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let finalFileUrl = fileUrl

      if (sourceType === 'upload') {
        if (!file) {
          throw new Error('Please select an .apk file to upload')
        }

        const supabase = createClient()
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const path = `${projectId}/${Date.now()}-${cleanName}`

        setUploadProgress(20)
        const { error: uploadError } = await supabase.storage
          .from('app-builds')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}. You can switch to "Paste Link" if your storage bucket is not configured.`)
        }

        setUploadProgress(80)
        const { data: { publicUrl } } = supabase.storage
          .from('app-builds')
          .getPublicUrl(path)

        finalFileUrl = publicUrl
      }

      if (!finalFileUrl) {
        throw new Error('Please provide an APK file or download URL')
      }

      const res = await fetch(`/api/projects/${projectId}/builds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_name: versionName,
          build_number: buildNumber || null,
          platform: 'android',
          environment,
          file_url: finalFileUrl,
          file_size_bytes: fileSizeBytes,
          min_os_version: minOsVersion,
          changelog,
          notify_client: notifyClient,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save build release')
      }

      setBuilds(prev => [data.build, ...prev])
      setIsModalOpen(false)

      // Reset form
      setFile(null)
      setFileUrl('')
      setFileSizeBytes(null)
      setVersionName('')
      setBuildNumber('')
      setChangelog('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Mobile App Builds & APKs
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                {builds.length} build{builds.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              Clients can download and install test APKs directly from their portal instead of WhatsApp.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish APK</span>
          </button>
        )}
      </div>

      {/* Builds List */}
      {builds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              No APK builds published yet
            </h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
              Stop sending raw APK files over WhatsApp. Publish your Android build here and your client can install it via QR code or 1-tap download on their portal.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish First Build</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {builds.map((build, index) => {
            const envConfig = getEnvironmentConfig(build.environment)
            const isLatest = index === 0

            return (
              <div
                key={build.id}
                className={`rounded-2xl border transition-all p-4.5 ${
                  isLatest
                    ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/[0.03] shadow-xs'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {build.version_name}
                      </span>
                      {build.build_number && (
                        <span className="text-xs text-slate-400 font-mono">
                          (Build #{build.build_number})
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${envConfig.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${envConfig.dotClass}`} />
                        {envConfig.shortLabel}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500 text-white shadow-2xs">
                          Active in Portal
                        </span>
                      )}
                      {!build.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-white/10 text-slate-500">
                          Hidden from Client
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      {build.file_size_bytes ? (
                        <span>{formatFileSize(build.file_size_bytes)}</span>
                      ) : null}
                      <span>{build.min_os_version || 'Android 8.0+'}</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-400" />
                        {build.download_count} client download{build.download_count === 1 ? '' : 's'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(build.created_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => setActiveQrBuild(build)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Show mobile install QR code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>QR Code</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(build)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Copy download URL"
                    >
                      {copiedId === build.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={build.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>

                    {canManage && (
                      <>
                        <button
                          onClick={() => handleToggleActive(build)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors"
                          title={build.is_active ? 'Hide from client portal' : 'Show in client portal'}
                        >
                          {build.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(build.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/30 transition-colors"
                          title="Delete build"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Changelog */}
                {build.changelog && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                      Release Notes / What to Test:
                    </span>
                    <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {build.changelog}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {activeQrBuild && (
        <AppBuildQrModal
          isOpen={Boolean(activeQrBuild)}
          onClose={() => setActiveQrBuild(null)}
          versionName={activeQrBuild.version_name}
          buildNumber={activeQrBuild.build_number}
          downloadUrl={activeQrBuild.file_url}
          projectName={projectName}
        />
      )}

      {/* Publish New Build Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Publish New Android APK Build
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Make it instantly available for {projectName}&apos;s client
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveBuild} className="space-y-4">
              {/* Source Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  APK Distribution Source
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSourceType('upload')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      sourceType === 'upload'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload .APK File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('url')}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      sourceType === 'url'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Direct Download Link</span>
                  </button>
                </div>
              </div>

              {/* Upload Input or URL Input */}
              {sourceType === 'upload' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Select .APK File
                  </label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-white/15 rounded-2xl p-6 text-center hover:border-slate-400 dark:hover:border-white/30 transition-colors bg-slate-50/50 dark:bg-white/[0.02]">
                    <input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleFileChange}
                      className="hidden"
                      id="apk-upload-input"
                    />
                    <label htmlFor="apk-upload-input" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      {file ? (
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {formatFileSize(file.size)} · Ready to upload
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Click to browse .apk file
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Android application package (.apk)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    APK Download URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or https://firebase.google.com/..."
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    required={sourceType === 'url'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Google Drive direct link, Firebase App Distribution, Expo EAS, or direct CDN download URL.
                  </p>
                </div>
              )}

              {/* Version & Build Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Version Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0.4"
                    value={versionName}
                    onChange={e => setVersionName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Build Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42"
                    value={buildNumber}
                    onChange={e => setBuildNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Environment & Min Android */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Environment
                  </label>
                  <select
                    value={environment}
                    onChange={e => setEnvironment(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#12131a] text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="staging">Staging / Test Build</option>
                    <option value="client_review">Client Review</option>
                    <option value="internal_beta">Internal Beta</option>
                    <option value="production">Production Release</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Min Android OS
                  </label>
                  <input
                    type="text"
                    placeholder="Android 8.0+"
                    value={minOsVersion}
                    onChange={e => setMinOsVersion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Changelog */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  What&apos;s New &amp; Testing Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="• Fixed login crash on Android 14&#10;• Added push notification handler&#10;• New checkout UI redesign"
                  value={changelog}
                  onChange={e => setChangelog(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none font-mono text-[11px]"
                />
              </div>

              {/* Notify Client Checkbox */}
              {clientEmail && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                  <input
                    type="checkbox"
                    id="notify-client-checkbox"
                    checked={notifyClient}
                    onChange={e => setNotifyClient(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="notify-client-checkbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Send email notification to client ({clientEmail}) with download link
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Publish Build to Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
