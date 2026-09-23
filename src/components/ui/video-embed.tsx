'use client'

import { parseVideoEmbedUrl } from '@/lib/video-embed'
import { Play, ExternalLink, Video } from 'lucide-react'

interface VideoEmbedProps {
  url: string | null | undefined
  title?: string
  accentColor?: string
  className?: string
}

export function VideoEmbed({ url, title, accentColor = '#6366F1', className = '' }: VideoEmbedProps) {
  const parsed = parseVideoEmbedUrl(url)

  if (!parsed) {
    if (!url) return null
    // Fallback if URL is non-empty but couldn't be parsed into an iframe embed
    return (
      <div className={`rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {title || 'Video Walkthrough'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
              {url}
            </div>
          </div>
        </div>
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-2xs flex-shrink-0"
        >
          <span>Watch Video</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  const platformLabels: Record<string, string> = {
    loom: 'Loom Walkthrough',
    youtube: 'Video Walkthrough',
    vimeo: 'Video Presentation',
  }

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-950 shadow-xs dark:shadow-none ${className}`}>
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 dark:bg-[#0c0d12]/95 border-b border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-white tracking-wide truncate">
            {title || platformLabels[parsed.platform] || 'Sprint Video Walkthrough'}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 hidden sm:inline-block">
            {parsed.platform}
          </span>
        </div>

        <a
          href={parsed.originalUrl.startsWith('http') ? parsed.originalUrl : `https://${parsed.originalUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors flex-shrink-0"
        >
          <span>Open Fullscreen</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 16:9 Responsive Aspect Ratio Container */}
      <div className="relative w-full pb-[56.25%] bg-black">
        <iframe
          src={parsed.embedUrl}
          title={title || 'Video Walkthrough'}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  )
}
