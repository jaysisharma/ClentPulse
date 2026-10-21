'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Globe, Monitor, Tablet, Smartphone, RotateCw, ExternalLink,
  Copy, Check, ShieldCheck, Maximize2, Minimize2, RefreshCw,
  Eye, EyeOff, ChevronUp, ChevronDown
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
  initialDeviceMode?: DeviceMode
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type Orientation = 'portrait' | 'landscape'

export function PortalLivePreview({
  primaryUrl,
  projectName,
  accentColor,
  additionalUrls = [],
  initialDeviceMode = 'desktop',
}: PortalLivePreviewProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(primaryUrl)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(initialDeviceMode)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [showFullscreenHeader, setShowFullscreenHeader] = useState<boolean>(true)
  const [showCardHeader, setShowCardHeader] = useState<boolean>(true)
  const [iframeKey, setIframeKey] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const cleanUrl = sanitizePreviewUrl(currentUrl) || currentUrl
  const domain = extractDomain(cleanUrl)
  const isRestricted = isCommonFrameRestrictedDomain(cleanUrl)

  const allEnvironments: PreviewEnvironment[] = [
    { label: 'Live Deployed Site', url: primaryUrl },
    ...additionalUrls.filter(u => u.url !== primaryUrl),
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (initialDeviceMode) {
      setDeviceMode(initialDeviceMode)
    }
  }, [initialDeviceMode])

  // Handle escape key to exit fullscreen + H key to toggle header
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
      if ((e.key === 'h' || e.key === 'H') && isFullScreen) {
        setShowFullscreenHeader(prev => !prev)
      }
    }

    if (isFullScreen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullScreen])

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

  const toggleOrientation = () => {
    setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'))
  }

  // Device-specific dimensions with increased canvas height
  const getContainerStyles = (inFullscreen: boolean) => {
    const headerOffset = inFullscreen ? (showFullscreenHeader ? '76px' : '0px') : '0px'

    if (deviceMode === 'desktop') {
      return {
        wrapper: 'w-full h-full flex items-center justify-center',
        frame: inFullscreen
          ? 'w-full h-full rounded-none overflow-hidden bg-white dark:bg-[#0c0d12]'
          : 'w-full h-[880px] rounded-b-2xl overflow-hidden bg-white dark:bg-[#0c0d12]',
        notch: false,
      }
    }

    if (deviceMode === 'tablet') {
      const isPortrait = orientation === 'portrait'
      const width = isPortrait ? 'w-[768px]' : 'w-[1024px]'
      const height = isPortrait
        ? inFullscreen ? `h-[calc(100vh-${headerOffset})] max-h-[calc(100vh-${headerOffset})]` : 'h-[820px]'
        : inFullscreen ? `h-[calc(100vh-${headerOffset})] max-h-[calc(100vh-${headerOffset})]` : 'h-[620px]'

      return {
        wrapper: 'w-full h-full flex items-center justify-center p-2',
        frame: `${width} ${height} max-w-[calc(100vw-24px)] rounded-[32px] border-[10px] border-slate-800 dark:border-slate-700 shadow-2xl relative overflow-hidden ring-1 ring-slate-950/20 bg-white dark:bg-black transition-all duration-300`,
        notch: false,
      }
    }

    // mobile / phone
    const isPortrait = orientation === 'portrait'
    const width = isPortrait ? 'w-[375px]' : 'w-[780px]'
    const height = isPortrait
      ? inFullscreen ? `h-[calc(100vh-${headerOffset})] max-h-[calc(100vh-${headerOffset})]` : 'h-[800px]'
      : inFullscreen ? `h-[375px] max-h-[calc(100vh-${headerOffset})]` : 'h-[375px]'

    return {
      wrapper: 'w-full h-full flex items-center justify-center p-2',
      frame: `${width} ${height} max-w-[calc(100vw-24px)] rounded-[40px] border-[9px] border-slate-800 dark:border-slate-700 shadow-2xl relative overflow-hidden ring-1 ring-slate-950/20 bg-white dark:bg-black transition-all duration-300`,
      notch: isPortrait,
    }
  }

  const styleConfig = getContainerStyles(false)
  const fullConfig = getContainerStyles(true)

  // Reusable Device Controls component
  const DeviceControls = () => (
    <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
      <button
        onClick={() => setDeviceMode('desktop')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
          deviceMode === 'desktop'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Desktop View (100% Fluid)"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Desktop</span>
      </button>

      <button
        onClick={() => setDeviceMode('tablet')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
          deviceMode === 'tablet'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Tablet View (768px)"
      >
        <Tablet className="w-3.5 h-3.5" />
        <span>Tablet</span>
      </button>

      <button
        onClick={() => setDeviceMode('mobile')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
          deviceMode === 'mobile'
            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Phone View (375px)"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
        <span>Phone</span>
      </button>

      {/* Orientation toggle */}
      {deviceMode !== 'desktop' && (
        <button
          onClick={toggleOrientation}
          className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
          title={`Rotate to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-4">
        {/* ── Main Browser Window Card ── */}
        <div className="bg-white dark:bg-[#0c0d12]/95 rounded-3xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none overflow-hidden transition-all">
          
          {/* ── Browser Chrome Header / Navigation Bar ── */}
          {showCardHeader ? (
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
              <DeviceControls />

              {/* Right: URL Address Bar + Reload + Full Screen + External Link */}
              <div className="flex items-center gap-2">
                {/* Address Bar Pill */}
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-[240px]">
                  <span className="text-emerald-500 text-[10px]">🔒</span>
                  <span className="truncate">{cleanUrl.replace(/^https?:\/\//, '')}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="hover:text-slate-800 dark:hover:text-white transition-colors ml-1 cursor-pointer"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Reload Frame Button */}
                <button
                  onClick={handleReload}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Reload frame"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Enter Full Screen Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>

                {/* Open in New Tab */}
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs"
                  title="Open full site in new tab"
                >
                  <span className="hidden sm:inline">New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {/* Hide Card Header */}
                <button
                  onClick={() => setShowCardHeader(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Hide header"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-400">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{projectName}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCardHeader(true)}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Show header</span>
                </button>
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Full screen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Viewport Canvas Area ── */}
          <div className="relative bg-slate-100 dark:bg-[#07080a] p-2 sm:p-4 overflow-x-auto flex items-center justify-center">
            
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
                
                {/* Phone Speaker Slit Notch (for phone device view) */}
                {styleConfig.notch && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 dark:bg-slate-700 rounded-full z-30 flex items-center justify-center pointer-events-none">
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

          {/* ── Bottom Notice Bar ── */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>
                Fully interactive preview. Switch device views or expand to Full Screen to test responsiveness.
              </span>
            </div>

            <button
              onClick={() => setIsFullScreen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Full Screen tester</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* ── FULL SCREEN MODAL: MOUNTED DIRECTLY TO DOCUMENT.BODY VIA PORTAL ──
          Clean, minimalist top bar with hide-header option and 100vh pure screen view. ── */}
      {isFullScreen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 dark:bg-[#060709] flex flex-col overflow-hidden animate-fade-in">
          
          {/* Full Screen Top Toolbar: Clean title on left, device controls in center, icon buttons on right */}
          {showFullscreenHeader ? (
            <div className="px-4 sm:px-6 py-2.5 border-b border-white/10 bg-slate-900/95 dark:bg-black/95 flex items-center justify-between gap-3 flex-shrink-0 z-30 shadow-md transition-all duration-300">
              
              {/* Left: macOS Window Dots + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 hidden sm:flex" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>

                <span className="font-semibold text-sm text-white truncate">
                  {projectName}
                </span>
              </div>

              {/* Center: Device Type Adjustment Controls */}
              <div className="flex items-center gap-2">
                <DeviceControls />
              </div>

              {/* Right: Icon-only Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Reload */}
                <button
                  onClick={handleReload}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  title="Reload Frame"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                </button>

                {/* Open in new tab icon button */}
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Hide Header Button */}
                <button
                  onClick={() => setShowFullscreenHeader(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  title="Hide Header (H)"
                >
                  <EyeOff className="w-4 h-4" />
                </button>

                {/* Exit Full Screen icon button */}
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  title="Exit Fullscreen (Esc)"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Floating pill when header is hidden */
            <div className="fixed top-3 right-3 z-50 flex items-center gap-1 p-1 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-md shadow-2xl transition-all opacity-40 hover:opacity-100">
              <button
                onClick={() => setShowFullscreenHeader(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Show Header (H)"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Show Header</span>
              </button>
              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Full Screen Viewport: Maximized height, zero clutter */}
          <div className={`flex-1 w-full overflow-hidden flex items-center justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:bg-[radial-gradient(#182030_1px,transparent_1px)] [background-size:16px_16px] ${showFullscreenHeader ? 'p-1 sm:p-2' : 'p-0'}`}>
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <div className="text-xs font-medium text-slate-300">
                  Reloading preview...
                </div>
              </div>
            )}

            {/* Device Wrapper */}
            <div className={`${fullConfig.wrapper} transition-all duration-300 ease-out`}>
              <div className={`${fullConfig.frame} relative transition-all duration-300 ease-out`}>
                
                {/* Phone Speaker Slit Notch */}
                {fullConfig.notch && (
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 dark:bg-slate-700 rounded-full z-30 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-1 bg-slate-600 rounded-full" />
                  </div>
                )}

                {/* The Fullscreen Iframe */}
                <iframe
                  key={`fs-${iframeKey}`}
                  src={cleanUrl}
                  title={`${projectName} Fullscreen Preview`}
                  className="w-full h-full border-0 bg-white"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </div>

          </div>

        </div>,
        document.body
      )}
    </>
  )
}
