'use client'

import { useState } from 'react'
import { KeyRound, Check, Loader2, Sparkles } from 'lucide-react'

export function ClientMagicLinkButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopyMagicLink() {
    try {
      setLoading(true)
      const res = await fetch('/api/client-access/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate magic link')
      }

      const data = await res.json()
      const fullUrl = `${window.location.origin}${data.path}`
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopyMagicLink}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all cursor-pointer shadow-2xs"
      title="Generate 1-click passwordless access link for your client"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : copied ? (
        <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Magic Link</>
      ) : (
        <><KeyRound className="w-3.5 h-3.5 text-indigo-500" /> 1-Click Magic Link</>
      )}
    </button>
  )
}

