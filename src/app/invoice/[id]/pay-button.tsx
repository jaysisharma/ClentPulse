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
    <div className="mt-6 space-y-3">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          Direct Settlement Required
        </p>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Online card settlement is temporarily disabled while studio direct payouts are configured. Please settle {fmt} directly with the studio via bank transfer or their designated invoicing details.
        </p>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-full text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-xs tracking-wide transition-all hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
        <span>Check Online Payment Availability</span>
      </button>

      {error && (
        <p className="text-xs text-amber-700 dark:text-amber-300 text-center font-medium bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40">
          {error}
        </p>
      )}
    </div>
  )
}
