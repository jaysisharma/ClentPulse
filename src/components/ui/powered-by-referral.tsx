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
        className="inline-flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors uppercase tracking-wider font-medium cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Powered by Frevio</span>
      </Link>
    </div>
  )
}
