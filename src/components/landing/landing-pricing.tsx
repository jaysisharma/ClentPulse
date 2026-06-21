'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PRICING } from '@/lib/plans'

const ACCENT = '#6C4CFD'

const FREE = ['3 active projects', 'Client portal', 'Updates & files', 'Invoicing & contracts']
const PRO = ['Unlimited projects', 'Custom branding', 'Automatic client emails', 'White-label portals', 'Portfolio pages', 'Priority support']

export function LandingPricing() {
  const [annual, setAnnual] = useState(false)
  const proPrice = annual ? Math.round(PRICING.annual / 12) : PRICING.monthly

  return (
    <div>
      {/* toggle */}
      <div className="mb-12 flex justify-center">
        <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/5">
          {(['monthly', 'annual'] as const).map(key => {
            const active = (key === 'annual') === annual
            return (
              <button
                key={key}
                onClick={() => setAnnual(key === 'annual')}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all cursor-pointer ${
                  active 
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70'
                }`}
              >
                {key}
                {key === 'annual' && <span className="ml-1.5 text-xs font-bold text-[#6C4CFD] dark:text-[#B7A6FF]">−33%</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-slate-350 dark:hover:border-white/15 hover:shadow-lg dark:hover:shadow-[0_24px_60px_-24px_rgba(255,255,255,0.02)]">
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Free</div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">$0</span>
            <span className="text-sm text-slate-500">/forever</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Everything you need to run your first few clients.</p>
          <a
            href="/auth/login?mode=signup"
            className="mt-7 block rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white transition-colors"
          >
            Get started
          </a>
          <ul className="mt-8 space-y-3.5">
            {FREE.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Check className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-slate-500" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro — highlighted */}
        <div className="relative rounded-3xl bg-[#0B0B12] p-8 text-white shadow-[0_30px_70px_-30px_rgba(108,76,253,0.3)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1">
          <div
            className="absolute right-7 top-7 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: ACCENT }}
          >
            Popular
          </div>
          <div className="text-sm font-semibold" style={{ color: '#B7A6FF' }}>Pro</div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">${proPrice}</span>
            <span className="text-sm text-white/40">/month</span>
          </div>
          <p className="mt-2 text-sm text-white/50">
            {annual ? `Billed $${PRICING.annual} yearly. ` : ''}For freelancers and agencies scaling up.
          </p>
          <a
            href="/auth/login?mode=signup"
            className="mt-7 block rounded-xl py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: ACCENT }}
          >
            Start free trial
          </a>
          <ul className="mt-8 space-y-3.5">
            {PRO.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#B7A6FF' }} /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
