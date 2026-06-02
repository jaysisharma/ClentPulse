'use client'

import { useState, useRef, useEffect } from 'react'
import { BellRing, Check, Loader2 } from 'lucide-react'

export function RemindSelfButton({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (status !== 'idle') return
    setStatus('loading')
    const res = await fetch('/api/remind-self', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })
    if (!mountedRef.current) return
    setStatus(res.ok ? 'sent' : 'error')
    if (res.ok) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => { if (mountedRef.current) setStatus('idle') }, 4000)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading' || status === 'sent'}
      title="Email yourself a reminder to send an update"
      className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full transition-all flex-shrink-0 disabled:opacity-60
        bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
    >
      {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'sent'    && <Check   className="w-3 h-3 text-emerald-500" />}
      {status === 'idle' || status === 'error'
        ? <BellRing className="w-3 h-3" />
        : null
      }
      {status === 'sent' ? 'Reminder sent' : status === 'error' ? 'Failed' : 'Remind me'}
    </button>
  )
}
