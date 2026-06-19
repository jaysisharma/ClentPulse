'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import {
  FREE_FEATURES as freeFeatures,
  PRO_FEATURES as proFeatures,
  PRICING,
  ANNUAL_MONTHLY_EQUIV,
  ANNUAL_DISCOUNT_PCT,
} from '@/lib/plans'

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-950 transition-colors" id="pricing">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 rounded-full">Fair Pricing</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fair pricing, scale when ready</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">Get started completely free. Upgrade anytime as your roster grows.</p>

          {/* Premium Segmented Pricing Toggle Switch */}
          <div className="flex items-center justify-center pt-4 select-none">
            <div className="relative flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-full border border-slate-200/50 dark:border-slate-700/50 w-80 animate-fade-in">
              {/* Sliding background */}
              <div
                className={`absolute top-1 bottom-1 w-[156px] rounded-full bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 ease-out ${billingPeriod === 'monthly'
                    ? 'left-1'
                    : 'left-[160px]'
                  }`}
              />

              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-200 ${billingPeriod === 'monthly'
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors duration-200 ${billingPeriod === 'annual'
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
              >
                <span>Annually</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold transition-colors duration-200 ${billingPeriod === 'annual'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  }`}>
                  -{ANNUAL_DISCOUNT_PCT}%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Free Plan</h3>
                <div className="text-4xl font-black text-slate-900 dark:text-white mt-2">$0</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Forever free tier</div>
              </div>
              <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
              <ul className="space-y-3">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <Check className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/auth/login?mode=signup" className="block text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all">
                Get started free
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            {/* Decorative Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Pro Plan</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-white transition-all duration-300">
                      {billingPeriod === 'monthly' ? `$${PRICING.monthly}` : `$${PRICING.annual}`}
                    </span>
                    <span className="text-xs text-indigo-200 font-semibold transition-all duration-300">
                      {billingPeriod === 'monthly' ? '/mo' : '/yr'}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-200 font-medium mt-1 h-5 flex items-center gap-1.5 transition-all duration-300">
                    {billingPeriod === 'monthly' ? (
                      <span>billed monthly</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-300/80 line-through decoration-indigo-200/40">${PRICING.monthly}</span>
                        <span className="text-white font-bold">${ANNUAL_MONTHLY_EQUIV}</span>
                        <span className="text-indigo-200/90">/mo</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Popular Choice</span>
              </div>
              <div className="w-full h-px bg-indigo-500/40" />
              <ul className="space-y-3">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-indigo-50 font-medium">
                    <Check className="w-4 h-4 text-indigo-200 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 relative z-10">
              <Link href="/auth/login?mode=signup" className="block text-center bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider py-3 rounded-xl shadow-md transition-all">
                Get started with Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
