'use client'

import { useEffect, useState } from 'react'
import { QrCode, X, Smartphone, ExternalLink, Copy, Check } from 'lucide-react'
import { generateQrCodeDataUrl } from '@/lib/app-builds'

interface AppBuildQrModalProps {
  isOpen: boolean
  onClose: () => void
  versionName: string
  buildNumber?: string | null
  downloadUrl: string
  projectName: string
}

export function AppBuildQrModal({
  isOpen,
  onClose,
  versionName,
  buildNumber,
  downloadUrl,
  projectName,
}: AppBuildQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !downloadUrl) return
    let isMounted = true
    setLoading(true)

    generateQrCodeDataUrl(downloadUrl).then(dataUrl => {
      if (isMounted) {
        setQrDataUrl(dataUrl)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [isOpen, downloadUrl])

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Scan to Install on Mobile
              </h3>
              <p className="text-[11px] text-slate-400">
                {versionName}{buildNumber ? ` · Build #${buildNumber}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : qrDataUrl ? (
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200/80">
              <img
                src={qrDataUrl}
                alt="QR Code for APK Download"
                className="w-48 h-48 rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="text-xs text-rose-500 py-10">Failed to render QR Code</div>
          )}

          <div className="flex items-center gap-2 mt-4 text-center">
            <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Point your Android camera to download
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-1">
            No WhatsApp or manual file transfer needed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Download Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Direct Download Link</span>
              </>
            )}
          </button>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            <span>Download Directly</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
