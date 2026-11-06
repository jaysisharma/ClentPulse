'use client'

import { useEffect, useRef } from 'react'

interface ReadReceiptTrackerProps {
  projectId: string
  entityType: 'portal' | 'invoice' | 'contract' | 'doc'
  entityId?: string
}

export function ReadReceiptTracker({ projectId, entityType, entityId }: ReadReceiptTrackerProps) {
  const sentRef = useRef(false)

  useEffect(() => {
    if (sentRef.current || !projectId) return

    // Debounce / session deduplication to prevent spamming on rapid re-renders
    const storageKey = `rr_${entityType}_${entityId || projectId}`
    try {
      const lastSent = sessionStorage.getItem(storageKey)
      const now = Date.now()
      if (lastSent && now - parseInt(lastSent, 10) < 60_000) {
        // Sent within the last 60 seconds
        return
      }
      sessionStorage.setItem(storageKey, now.toString())
    } catch {
      // Ignore sessionStorage disabled/quota issues
    }

    sentRef.current = true

    fetch('/api/telemetry/read-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        entityType,
        entityId,
        viewerSource: 'client',
      }),
    }).catch(() => {
      // Non-blocking telemetry
    })
  }, [projectId, entityType, entityId])

  return null
}

