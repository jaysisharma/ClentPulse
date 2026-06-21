'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: projectColor || '#6366F1' }}
          >
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Protected Status Page</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the passcode provided by your freelancer to view this page.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Passcode"
            placeholder="••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full justify-center"
            style={{ backgroundColor: projectColor || '#6366F1' }}
          >
            Unlock page
          </Button>
        </form>
      </div>
    </div>
  )
}
