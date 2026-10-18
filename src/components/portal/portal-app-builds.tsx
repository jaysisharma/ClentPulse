'use client'

import { useState } from 'react'
import {
  Smartphone, Download, QrCode, CheckCircle2, AlertCircle,
  HelpCircle, ChevronDown, ChevronUp, History, Sparkles, ExternalLink,
  ShieldCheck, ArrowRight
} from 'lucide-react'
import { formatFileSize, getEnvironmentConfig } from '@/lib/app-builds'
import { AppBuildQrModal } from '@/components/project/app-build-qr-modal'
import type { AppBuild } from '@/types'

interface PortalAppBuildsProps {
  builds: AppBuild[]
  projectName: string
  accentColor: string
}

export function PortalAppBuilds({
  builds,
  projectName,
  accentColor,
}: PortalAppBuildsProps) {
  const activeBuilds = builds.filter(b => b.is_active)
  const [selectedQrBuild, setSelectedQrBuild] = useState<AppBuild | null>(null)
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  if (activeBuilds.length === 0) return null

  const latestBuild = activeBuilds[0]
  const previousBuilds = activeBuilds.slice(1)
  const envConfig = getEnvironmentConfig(latestBuild.environment)

  const handleDownload = async (build: AppBuild) => {
    setDownloadingId(build.id)
    try {
      // Fire-and-forget download count increment
      fetch(`/api/builds/${build.id}/download`, { method: 'POST' }).catch(() => {})

      // Open / trigger download
      window.open(build.file_url, '_blank')
    } finally {
      setTimeout(() => setDownloadingId(null), 1500)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Main Featured Latest Build Card ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 sm:p-7 shadow-xs dark:shadow-none ring-1 ring-slate-950/5 dark:ring-white/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 space-y-6">
          {/* Card Top Pill & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: accentColor }}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Android Mobile App
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${envConfig.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${envConfig.dotClass}`} />
                    {envConfig.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>Version {latestBuild.version_name}</span>
                  {latestBuild.build_number && (
                    <span className="text-xs font-mono font-normal text-slate-400">
                      (Build #{latestBuild.build_number})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {latestBuild.file_size_bytes ? (
                <span className="font-mono bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {formatFileSize(latestBuild.file_size_bytes)}
                </span>
              ) : null}
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px]">
                Updated {new Date(latestBuild.created_at).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Changelog / What to test */}
          {latestBuild.changelog && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                What to Test in this Release
              </span>
              <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {latestBuild.changelog}
              </div>
            </div>
          )}

          {/* Action Row: 1-Tap Download & Scan QR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              onClick={() => handleDownload(latestBuild)}
              disabled={downloadingId === latestBuild.id}
              className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-semibold text-sm text-white shadow-md hover:opacity-95 transition-all cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadingId === latestBuild.id
                  ? 'Starting Download...'
                  : `Download APK ${latestBuild.file_size_bytes ? `(${formatFileSize(latestBuild.file_size_bytes)})` : ''}`}
              </span>
            </button>

            <button
              onClick={() => setSelectedQrBuild(latestBuild)}
              className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-semibold text-xs border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Show QR code to install on mobile phone"
            >
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>Scan QR Code with Phone</span>
            </button>

            <button
              onClick={() => setShowInstallGuide(!showInstallGuide)}
              className="inline-flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-2xl font-medium text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Install Help</span>
              {showInstallGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expandable Android Installation Guide */}
          {showInstallGuide && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>How to Install this APK on your Android Phone:</span>
              </div>
              <ol className="space-y-2 pl-4 list-decimal text-xs text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Download:</strong> Tap the <em>Download APK</em> button above (or point your phone&apos;s camera at the QR code).
                </li>
                <li>
                  <strong>Open:</strong> When download finishes, pull down your notification tray and tap the completed file (or find it in your <em>Files &gt; Downloads</em> folder).
                </li>
                <li>
                  <strong>Permissions (if prompted):</strong> Android will ask <em>&quot;For your security, your phone is not allowed to install unknown apps&quot;</em>. Tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong>.
                </li>
                <li>
                  <strong>Confirm:</strong> Tap <strong>Install</strong> to test the latest version!
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* ── Previous Versions / Build Archive ── */}
      {previousBuilds.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 overflow-hidden shadow-xs dark:shadow-none">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Previous APK Builds ({previousBuilds.length})
              </span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showHistory && (
            <div className="divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 animate-fade-in">
              {previousBuilds.map(prevBuild => {
                const prevEnv = getEnvironmentConfig(prevBuild.environment)
                return (
                  <div key={prevBuild.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {prevBuild.version_name}
                        </span>
                        {prevBuild.build_number && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            (#{prevBuild.build_number})
                          </span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${prevEnv.badgeClass}`}>
                          {prevEnv.shortLabel}
                        </span>
                      </div>
                      {prevBuild.changelog && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {prevBuild.changelog}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Released {new Date(prevBuild.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedQrBuild(prevBuild)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 inline mr-1" />
                        QR
                      </button>
                      <button
                        onClick={() => handleDownload(prevBuild)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-3 h-3 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {selectedQrBuild && (
        <AppBuildQrModal
          isOpen={Boolean(selectedQrBuild)}
          onClose={() => setSelectedQrBuild(null)}
          versionName={selectedQrBuild.version_name}
          buildNumber={selectedQrBuild.build_number}
          downloadUrl={selectedQrBuild.file_url}
          projectName={projectName}
        />
      )}
    </div>
  )
}
