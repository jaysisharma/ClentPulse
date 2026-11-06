import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceStudio } from '@/lib/client-workspace'

// Shared look for the client workspace pages: a calm, single reading column
// where only one thing per page is allowed to stand out.

export const MUTED = 'text-[#5A5F6B] dark:text-slate-400'
export const RULE = 'border-[#E7E7E3] dark:border-white/[0.08]'
export const SECTION_LABEL = 'mb-1.5 text-[13px] font-semibold text-[#5A5F6B] dark:text-slate-400'
export const PANEL = 'rounded-2xl bg-white dark:bg-[#12141c] p-6 sm:p-7 dark:border dark:border-white/[0.08]'
const FALLBACK_ACCENT = '#111318'

/** A studio's brand colour for a filled button, only if white text stays readable on it. */
export function buttonColor(accent: string | null): string {
  const hex = accent?.trim().match(/^#?([0-9a-f]{6})$/i)?.[1]
  if (!hex) return FALLBACK_ACCENT
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return 1.05 / (luminance + 0.05) >= 4.5 ? `#${hex}` : FALLBACK_ACCENT
}

export function dotColor(studio: WorkspaceStudio) {
  return studio.accent || '#9A9EA8'
}

export function shortDate(d: string) {
  return new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">{title}</h1>
      {subtitle && <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>{subtitle}</p>}
    </section>
  )
}

/** A quiet, full-width list row that links somewhere. */
export function Row({ href, children, meta }: { href: string; children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <li className={cn('border-t', RULE)}>
      <Link href={href} className="flex items-center gap-4 min-h-[60px] py-2 group">
        <span className="flex-1 min-w-0">{children}</span>
        {meta && <span className={cn('text-sm whitespace-nowrap text-right', MUTED)}>{meta}</span>}
        <ChevronRight aria-hidden className="w-4 h-4 text-[#9A9EA8] group-hover:text-slate-900 dark:group-hover:text-white flex-shrink-0" />
      </Link>
    </li>
  )
}

export function StudioDot({ studio }: { studio: WorkspaceStudio }) {
  return <span aria-hidden className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor(studio) }} />
}
