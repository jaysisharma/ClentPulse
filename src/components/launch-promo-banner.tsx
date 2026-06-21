'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

/**
 * "First 50 freelancers get Pro free" banner. Reads the live count from the
 * public launch_promo counter (anon-readable) and hides itself once the promo
 * is full or if the table isn't there yet.
 */
export function LaunchPromoBanner({ className = '' }: { className?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('launch_promo')
      .select('claimed, cap')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }: { data: { claimed: number; cap: number } | null }) => {
        if (data) setRemaining(Math.max(0, data.cap - data.claimed))
      })
  }, [])

  // Hide until we know there are spots left.
  if (remaining === null || remaining <= 0) return null

  return (
    <div
      className={
        'inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 ' +
        'px-3.5 py-1.5 text-sm font-medium text-accent ' + className
      }
    >
      <Sparkles className="h-4 w-4 flex-shrink-0" />
      <span>
        <span className="font-bold">First 50:</span> get Pro free for 1 month — only{' '}
        <span className="font-bold">{remaining}</span> spot{remaining === 1 ? '' : 's'} left
      </span>
    </div>
  )
}
