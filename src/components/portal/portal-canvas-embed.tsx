'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Layout, Monitor, Tablet, Smartphone, RotateCw, ExternalLink,
  Maximize2, Minimize2, RefreshCw, Eye, EyeOff, ChevronUp, ChevronDown
} from 'lucide-react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'
export type Orientation = 'portrait' | 'landscape'

interface PortalCanvasEmbedProps {
  embedUrl: string
  originalUrl: string
  title?: string | null
  platformName: string
  accentColor?: string
  initialDeviceMode?: DeviceMode
}

export function PortalCanvasEmbed({
  embedUrl,
  originalUrl,
  title,
  platformName,
  accentColor = '#6366f1',
  initialDeviceMode = 'desktop',
}: PortalCanvasEmbedProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(initialDeviceMode)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [showFullscreenHeader, setShowFullscreenHeader] = useState<boolean>(true)
  const [showCardHeader, setShowCardHeader] = useState<boolean>(true)
  const [iframeKey, setIframeKey] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const displayTitle = title || 'Strategy & Presentation Canvas'

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
    setIframeKey(prev => prev + 1)
  }

  const toggleOrientation = () => {
    setOrientation(prev => (prev === 'portrait' ? 'landscape' : 'portrait'))
  }

  // Frame sizing logic with increased canvas height
  const getFrameStyles = (inFullscreen: boolean) => {
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

  const normalConfig = getFrameStyles(false)
  const fullConfig = getFrameStyles(true)

  // Reusable Device Switcher component
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

      {/* Orientation toggle when in phone or tablet */}
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
      {/* ── CARD EMBED (Embedded in Portal Page) ── */}
      <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden shadow-xs dark:shadow-none">
        
        {/* Card Header Bar */}
        {showCardHeader ? (
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
            {/* Title & Badge */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate block">
                  {displayTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {platformName} · Interactive Presentation
                </span>
              </div>
            </div>

            {/* Device Switcher & Action Buttons */}
            <div className="flex items-center flex-wrap gap-1.5">
              {/* Responsiveness Device Toggles */}
              <DeviceControls />

              {/* Reload button */}
              <button
                onClick={handleReload}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Reload canvas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsFullScreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
                title="Enter Full Screen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </button>

              {/* External Link */}
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
                title={`Open in ${platformName}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Hide Card Header Button */}
              <button
                onClick={() => setShowCardHeader(false)}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Hide toolbar"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-400">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{displayTitle}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCardHeader(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show Toolbar</span>
              </button>
              <button
                onClick={() => setIsFullScreen(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                title="Full screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport Canvas Container */}
        <div className="relative w-full bg-slate-100 dark:bg-[#07080a] p-2 sm:p-4 overflow-x-auto flex items-center justify-center">
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-[#07080a]/80 backdrop-blur-xs space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Loading canvas...
              </div>
            </div>
          )}

          {/* Device Mockup Wrapper */}
          <div className={`${normalConfig.wrapper} transition-all duration-300 ease-out`}>
            <div className={`${normalConfig.frame} relative transition-all duration-300 ease-out`}>
              
              {/* Phone Speaker Slit Notch (for phone device view) */}
              {normalConfig.notch && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 dark:bg-slate-700 rounded-full z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-1 bg-slate-600 rounded-full" />
                </div>
              )}

              {/* The Live Interactive Iframe */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={embedUrl}
                title={displayTitle}
                className="w-full h-full border-0 bg-white"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>
        </div>

        {/* Card Footer Info */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Switch device view (Desktop, Tablet, Phone) or click Full Screen to test responsiveness.</span>
          <button
            onClick={() => setIsFullScreen(true)}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Full screen mode</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── FULL SCREEN MODAL: MOUNTED DIRECTLY TO DOCUMENT.BODY VIA PORTAL ──
          Clean, minimalist top bar with hide-header option and 100vh pure screen view. ── */}
      {isFullScreen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 dark:bg-[#060709] flex flex-col overflow-hidden animate-fade-in">
          
          {/* Full Screen Top Toolbar: Clean title on left, device controls in center, icon buttons on right */}
          {showFullscreenHeader ? (
            <div className="px-4 sm:px-6 py-2.5 border-b border-white/10 bg-slate-900/95 dark:bg-black/95 flex items-center justify-between gap-3 flex-shrink-0 z-30 shadow-md transition-all duration-300">
              
              {/* Left: macOS Window Dots + Clean Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1.5 hidden sm:flex" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>

                <span className="font-semibold text-sm text-white truncate">
                  {displayTitle}
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

                {/* Open in external tab icon button */}
                <a
                  href={originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                  title={`Open in ${platformName}`}
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
                  Reloading viewport...
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
                  src={embedUrl}
                  title={`${displayTitle} Fullscreen`}
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
