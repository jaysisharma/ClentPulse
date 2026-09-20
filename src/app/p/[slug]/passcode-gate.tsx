'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Key } from 'lucide-react'

export function PasscodeGate({
  slug,
  projectColor,
}: {
  slug: string
  projectColor: string
}) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passcode.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/client-access/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, passcode: passcode.trim() }),
      })

      if (res.ok) {
        // Reload page to read the newly set cookie and show the status page
        window.location.reload()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Incorrect passcode.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xl dark:shadow-none p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ring-1 ring-white/20"
            style={{ backgroundColor: projectColor || '#6366F1' }}
          >
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
              Protected Status Portal
            </div>
            <h2 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
              Studio Access Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Enter the passcode provided by your studio lead to view project deliverables and updates.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Access Passcode
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full h-11 justify-center rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
            style={{ backgroundColor: projectColor || '#6366F1' }}
          >
            Unlock Portal
          </Button>
        </form>
      </div>
    </div>
  )
}
