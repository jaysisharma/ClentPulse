'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Unread studio messages per project. "Read" is remembered per browser until the
// workspace gets server-side read receipts.

const key = (projectId: string) => `last_read_comment_at_client:${projectId}`

function lastRead(projectId: string): string {
  try {
    return localStorage.getItem(key(projectId)) || '1970-01-01T00:00:00.000Z'
  } catch {
    return '1970-01-01T00:00:00.000Z'
  }
}

export function useClientUnread(projectIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const idsKey = projectIds.join(',')

  useEffect(() => {
    if (!idsKey) return
    let cancelled = false
    const supabase = createClient()
    Promise.all(
      idsKey.split(',').map(async id => {
        const { count } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', id)
          .eq('author_role', 'owner')
          .gt('created_at', lastRead(id))
        return [id, count ?? 0] as const
      })
    ).then(entries => {
      if (!cancelled) setCounts(Object.fromEntries(entries))
    })
    return () => { cancelled = true }
  }, [idsKey])

  const markRead = useCallback((projectId: string) => {
    try {
      localStorage.setItem(key(projectId), new Date().toISOString())
    } catch {}
    setCounts(prev => ({ ...prev, [projectId]: 0 }))
  }, [])

  const total = Object.values(counts).reduce((s, n) => s + n, 0)
  return { counts, total, markRead }
}
