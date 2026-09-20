'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Radio, RefreshCw, CheckCircle2 } from 'lucide-react'

interface PortalRealtimeProps {
  projectId: string
  clientName?: string
  accentColor?: string
}

export function PortalRealtimeSubscriber({
  projectId,
  clientName = 'Client',
  accentColor = '#6366F1',
}: PortalRealtimeProps) {
  const router = useRouter()
  const routerRef = useRef(router)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  const [status, setStatus] = useState<'connecting' | 'connected' | 'updating'>('connecting')
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const channelName = `portal:${projectId}`

    // Trigger debounced refresh when database records change
    const triggerRefresh = (eventType: string, table: string) => {
      setStatus('updating')
      setLastEvent(`${table.replace('_', ' ')} updated`)

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }

      refreshTimerRef.current = setTimeout(() => {
        routerRef.current.refresh()
        setTimeout(() => {
          setStatus('connected')
          setTimeout(() => setLastEvent(null), 3500)
        }, 600)
      }, 350)
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: { key: `client-${projectId}` },
        },
      })
      // Listen for project settings or status changes
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'project')
      )
      // Listen for new or modified updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'updates', filter: `project_id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'updates')
      )
      // Listen for approvals (new requests or status changes)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'approvals', filter: `project_id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'approvals')
      )
      // Listen for milestones changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'milestones')
      )
      // Listen for kickoff checklist changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checklist_items', filter: `project_id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'checklist')
      )
      // Listen for comments
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'update_comments', filter: `project_id=eq.${projectId}` },
        () => triggerRefresh('UPDATE', 'comments')
      )

    channel.subscribe(async (subscriptionStatus: string) => {
      if (subscriptionStatus === 'SUBSCRIBED') {
        setStatus('connected')
        // Track client presence so freelancer knows client is viewing the portal
        await channel.track({
          role: 'client',
          clientName,
          onlineAt: new Date().toISOString(),
        })
      }
    })

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      channel.untrack().catch(() => {})
      supabase.removeChannel(channel)
    }
  }, [projectId, clientName])

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0c0d12]/90 backdrop-blur-sm text-[11px] font-medium transition-all shadow-2xs">
      {status === 'updating' ? (
        <>
          <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
          <span className="text-slate-700 dark:text-slate-200">Updating live…</span>
        </>
      ) : lastEvent ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-400 capitalize">{lastEvent}</span>
        </>
      ) : (
        <>
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: status === 'connected' ? '#22c55e' : '#94a3b8' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: status === 'connected' ? '#22c55e' : '#94a3b8' }}
            />
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-light">
            {status === 'connected' ? 'Live synced' : 'Connecting…'}
          </span>
        </>
      )}
    </div>
  )
}
