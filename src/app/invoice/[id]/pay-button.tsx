'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

export function PayNowButton({ invoiceId, total, accentColor }: {
  invoiceId: string
  total: number
  accentColor: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)

  async function handlePay() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/pay-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        style={{ backgroundColor: accentColor }}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <CreditCard className="w-4 h-4" />
        }
        {loading ? 'Redirecting to checkout…' : `Pay ${fmt} securely`}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
      <p className="text-xs text-center text-slate-400">
        Secured by Stripe · SSL encrypted
      </p>
    </div>
  )
}
