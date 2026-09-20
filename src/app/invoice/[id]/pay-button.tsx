'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { fmtCurrency } from '@/lib/currencies'

export function PayNowButton({ invoiceId, total, accentColor, currency = 'USD' }: {
  invoiceId: string
  total: number
  accentColor: string
  currency?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = fmtCurrency(total, currency)

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
    <div className="mt-6 space-y-2.5">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2.5 rounded-full text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-60 shadow-md cursor-pointer"
        style={{ backgroundColor: accentColor }}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <CreditCard className="w-4 h-4" />
        }
        {loading ? 'Redirecting to checkout…' : `Pay ${fmt} Securely`}
      </button>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{error}</p>
      )}
      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <span>Powered by Stripe</span>
        <span>·</span>
        <span>256-bit SSL Encrypted</span>
      </p>
    </div>
  )
}
