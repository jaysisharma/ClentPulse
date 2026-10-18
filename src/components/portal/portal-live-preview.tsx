'use client'

import { useState, useRef } from 'react'
import {
  Globe, Monitor, Tablet, Smartphone, RotateCw, ExternalLink,
  Copy, Check, ShieldCheck, AlertCircle, ChevronDown, Sparkles,
  Maximize2
} from 'lucide-react'
import { sanitizePreviewUrl, extractDomain, isCommonFrameRestrictedDomain } from '@/lib/live-preview'

interface PreviewEnvironment {
  label: string
  url: string
  type?: string
}

interface PortalLivePreviewProps {
  primaryUrl: string
  projectName: string
  accentColor: string
  additionalUrls?: PreviewEnvironment[]
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export function PortalLivePreview({
  primaryUrl,
  projectName,
  accentColor,
  additionalUrls = [],
}: PortalLivePreviewProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(primaryUrl)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [iframeKey, setIframeKey] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const cleanUrl = sanitizePreviewUrl(currentUrl) || currentUrl
  const domain = extractDomain(cleanUrl)
  const isRestricted = isCommonFrameRestrictedDomain(cleanUrl)

  const allEnvironments: PreviewEnvironment[] = [
    { label: 'Live Deployed Site', url: primaryUrl },
    ...additionalUrls.filter(u => u.url !== primaryUrl),
  ]

  const handleReload = () => {
    setIsLoading(true)
    setHasError(false)
    setIframeKey(prev => prev + 1)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cleanUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  // Device-specific dimensions
  const getContainerStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          wrapper: 'max-w-[400px] mx-auto py-6',
          frame: 'w-[375px] h-[667px] mx-auto rounded-[40px] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl relative overflow-hidden ring-1 ring-slate-950/10',
          notch: true,
        }
      case 'tablet':
        return {
          wrapper: 'max-w-[820px] mx-auto py-4',
          frame: 'w-[768px] h-[680px] mx-auto rounded-[28px] border-[8px] border-slate-800 dark:border-slate-700 shadow-xl relative overflow-hidden ring-1 ring-slate-950/10',
          notch: false,
        }
      case 'desktop':
      default:
        return {
          wrapper: 'w-full',
          frame: 'w-full h-[720px] rounded-b-2xl overflow-hidden',
          notch: false,
        }
    }
  }

  const styleConfig = getContainerStyles()

  return (
    <div className="space-y-4">
      {/* ── Main Browser Window Card ── */}
      <div className="bg-white dark:bg-[#0c0d12]/95 rounded-3xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden transition-all">
        
        {/* ── Browser Chrome Header / Navigation Bar ── */}
        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Window Controls + Optional Environment Switcher */}
          <div className="flex items-center gap-3">
            {/* macOS Window Dots */}
            <div className="flex items-center gap-1.5 hidden sm:flex" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 dark:bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
            </div>

            {/* Multiple Environments Dropdown (if any) */}
            {allEnvironments.length > 1 ? (
              <div className="relative">
                <select
                  value={currentUrl}
                  onChange={e => {
                    setCurrentUrl(e.target.value)
                    setIsLoading(true)
                    setIframeKey(prev => prev + 1)
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-hidden"
                >
                  {allEnvironments.map((env, i) => (
                    <option key={i} value={env.url}>
                      {env.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">Live Deployment</span>
              </div>
            )}
          </div>

          {/* Center: Interactive Device Viewport Mode Toggles */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceMode === 'tablet'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Mobile Phone View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: URL Address Bar + Reload + External Link */}
          <div className="flex items-center gap-2">
            {/* Address Bar Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-[280px]">
              <span className="text-emerald-500 text-[10px]">🔒</span>
              <span className="truncate">{cleanUrl.replace(/^https?:\/\//, '')}</span>
              <button
                onClick={handleCopyUrl}
                className="hover:text-slate-800 dark:hover:text-white transition-colors ml-1"
                title="Copy URL"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Reload Frame Button */}
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Reload frame"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            {/* Open Fullscreen in New Tab */}
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-2xs"
              title="Open full site in new tab"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* ── Viewport Canvas Area ── */}
        <div className="relative bg-slate-100 dark:bg-[#07080a] p-2 sm:p-4 overflow-x-auto min-h-[480px] flex items-center justify-center">
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-[#07080a]/80 backdrop-blur-xs space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Loading live preview for {projectName}...
              </div>
            </div>
          )}

          {/* Device Mockup Wrapper */}
          <div className={`${styleConfig.wrapper} transition-all duration-300 ease-out`}>
            <div className={`${styleConfig.frame} bg-white dark:bg-black relative transition-all duration-300 ease-out`}>
              
              {/* Phone Speaker Slit Notch (for mobile device view) */}
              {styleConfig.notch && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 dark:bg-slate-700 rounded-full z-30 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-600 rounded-full" />
                </div>
              )}

              {/* The Live Interactive Iframe */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={cleanUrl}
                title={`${projectName} Live Preview`}
                className="w-full h-full border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
              />
            </div>
          </div>

        </div>

        {/* ── Bottom Helpful Notice Bar ── */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>
              Fully interactive preview. Click, test, and browse your website directly inside your portal.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Security Note:</span>
            <span className="text-slate-400">
              If your deployed app restricts framing headers (X-Frame-Options),
            </span>
            <a
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Open in full window →
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
