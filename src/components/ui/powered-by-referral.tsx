'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { buildReferralUrl } from '@/lib/referrals'

interface PoweredByReferralProps {
  refHandle?: string | null
  className?: string
  isWhiteLabel?: boolean
}

export function PoweredByReferral({
  refHandle,
  className = 'py-6 text-center border-t border-slate-200 dark:border-white/10 relative z-10',
  isWhiteLabel = false,
}: PoweredByReferralProps) {
  if (isWhiteLabel) return null

  const targetUrl = buildReferralUrl(refHandle)

  return (
    <div className={className}>
      <Link
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all font-medium cursor-pointer shadow-2xs group"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
        <span>Powered by <strong>Frevio</strong> · Create your client portal</span>
        <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all">→</span>
      </Link>
    </div>
  )
}
