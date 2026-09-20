'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye } from 'lucide-react'

interface ClientViewingBadgeProps {
  projectId: string
  clientName?: string
}

export function ClientViewingBadge({ projectId, clientName = 'Client' }: ClientViewingBadgeProps) {
  const [isClientViewing, setIsClientViewing] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channelName = `portal:${projectId}`

    const channel = supabase.channel(channelName)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        let clientPresent = false

        for (const key of Object.keys(state)) {
          const presences = state[key] as Array<{ role?: string }>
          if (presences.some((p) => p.role === 'client')) {
            clientPresent = true
            break
          }
        }

        setIsClientViewing(clientPresent)
      })
      .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: Array<{ role?: string }> }) => {
        if (newPresences.some((p) => p.role === 'client')) {
          setIsClientViewing(true)
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: Array<{ role?: string }> }) => {
        if (leftPresences.some((p) => p.role === 'client')) {
          // Recheck state in case multiple tabs were open
          const state = channel.presenceState()
          let stillOnline = false
          for (const key of Object.keys(state)) {
            const presences = state[key] as Array<{ role?: string }>
            if (presences.some((p) => p.role === 'client')) {
              stillOnline = true
              break
            }
          }
          setIsClientViewing(stillOnline)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  if (!isClientViewing) return null

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs animate-fade-in">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>{clientName} viewing portal</span>
      </span>
    </div>
  )
}
