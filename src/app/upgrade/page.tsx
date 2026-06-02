'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'

const FREE_FEATURES = [
  '3 active projects',
  'Copy-paste email updates',
  'Public client status page',
  'Basic invoicing',
]

const PRO_FEATURES = [
  'Unlimited projects',
  'Auto email sending to clients',
  'Custom branding, logo & accent color',
  'White-label status pages',
  'Hourly rate + billable tracking',
  'Priority support',
]

export default function UpgradePage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      supabase.from('users').select('plan').eq('id', user.id).single().then(({ data }) => {
        if (data?.plan === 'pro') router.push('/settings')
      })
    })
  }, [router])

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billing }),
    })
    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const monthlyPrice = 12
  const annualPrice  = 99
  const annualSaving = monthlyPrice * 12 - annualPrice

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upgrade to Pro</h1>
          <p className="text-slate-500">Unlock unlimited projects, auto emails, and custom branding.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${billing === 'annual' ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${billing === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === 'annual' ? 'text-slate-900' : 'text-slate-400'}`}>
            Annual
            <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Save ${annualSaving}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-500 mb-1">Free</div>
              <div className="text-3xl font-bold text-slate-900">$0</div>
              <div className="text-sm text-slate-400">forever</div>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 px-4 py-2.5 rounded-xl bg-slate-100 text-center text-sm font-medium text-slate-500">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="mb-4">
              <div className="text-sm font-medium text-indigo-200 mb-1">Pro</div>
              {billing === 'monthly' ? (
                <>
                  <div className="text-3xl font-bold">${monthlyPrice}</div>
                  <div className="text-sm text-indigo-300">/ month</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">${annualPrice}</div>
                  <div className="text-sm text-indigo-300">/ year · ${(annualPrice / 12).toFixed(0)}/mo</div>
                </>
              )}
            </div>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-indigo-100">
                  <Check className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleUpgrade} loading={loading} className="w-full justify-center text-base py-3">
            <Zap className="w-4 h-4" />
            Upgrade to Pro
          </Button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Secure checkout via Stripe. Cancel anytime.
        </p>
      </div>
    </AppLayout>
  )
}
