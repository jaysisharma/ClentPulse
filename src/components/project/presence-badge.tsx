'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PresenceInfo {
  isLive: boolean
  label: string
  detail: string | null
}

function computePresence(
  lastHeartbeatAt: string | null,
  focusArea: string | null,
  mode: 'client' | 'freelancer'
): PresenceInfo | null {
  if (!lastHeartbeatAt) return null
  const diff = Math.floor((Date.now() - new Date(lastHeartbeatAt).getTime()) / 60000)

  if (diff <= 5) {
    return {
      isLive: true,
      label: mode === 'client' ? 'Currently working on this' : 'Editor Connected',
      detail: focusArea
        ? (mode === 'client' ? `Focus: ${focusArea}` : focusArea)
        : (mode === 'freelancer' ? 'Coding' : null),
    }
  }
  if (diff < 60) return { isLive: false, label: `Active ${diff}m ago`, detail: null }
  const diffHours = Math.floor(diff / 60)
  if (diffHours < 24) return { isLive: false, label: `Active ${diffHours}h ago`, detail: null }
  return null
}

interface Props {
  projectId: string
  initialHeartbeatAt: string | null
  initialFocusArea: string | null
  /** 'client' = public status page styling; 'freelancer' = dark project page styling */
  mode?: 'client' | 'freelancer'
}

export function PresenceBadge({
  projectId,
  initialHeartbeatAt,
  initialFocusArea,
  mode = 'client',
}: Props) {
  const [heartbeatAt, setHeartbeatAt] = useState(initialHeartbeatAt)
  const [focusArea, setFocusArea]     = useState(initialFocusArea)

  // Re-compute every 30s so "Active 5m ago" → "Active 6m ago" ticks up naturally
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  // Subscribe to Supabase Realtime — instant update when extension sends a heartbeat
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`presence:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload: { new: { last_heartbeat_at?: string; active_focus_area?: string } }) => {
          if (payload.new.last_heartbeat_at !== undefined) {
            setHeartbeatAt(payload.new.last_heartbeat_at)
          }
          if (payload.new.active_focus_area !== undefined) {
            setFocusArea(payload.new.active_focus_area)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId])

  const presence = computePresence(heartbeatAt, focusArea, mode)
  if (!presence) return null

  if (mode === 'client') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0c0d12]/90 border border-slate-200 dark:border-white/10 shadow-2xs text-xs">
        <span className="relative flex h-2 w-2">
          {presence.isLive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${presence.isLive ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
        </span>
        <span className={`font-medium ${presence.isLive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
          {presence.label}
        </span>
        {presence.detail && (
          <span className="text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-white/10 pl-2">
            {presence.detail}
          </span>
        )}
      </div>
    )
  }

  // freelancer mode
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      presence.isLive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    }`}>
      <span className="relative flex h-2 w-2">
        {presence.isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${presence.isLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </span>
      <span>{presence.label}</span>
      {presence.detail && (
        <span className="text-slate-400">({presence.detail})</span>
      )}
    </span>
  )
}
