'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import {
  DollarSign, Calculator, ArrowUpRight, ShieldCheck, Zap,
  TrendingUp, Clock, Calendar, Check, Sparkles, ChevronRight
} from 'lucide-react'

export default function FreelanceRateCalculatorPage() {
  const [targetIncome, setTargetIncome] = useState(120000)
  const [annualExpenses, setAnnualExpenses] = useState(12000)
  const [vacationWeeks, setVacationWeeks] = useState(4)
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState(25)
  const [taxBufferPercent, setTaxBufferPercent] = useState(25)

  // Generate unique accessible IDs for inputs
  const targetIncomeId = useId()
  const annualExpensesId = useId()
  const vacationWeeksId = useId()
  const billableHoursId = useId()
  const taxBufferId = useId()

  // ── Calculation Logic ──
  // Total gross needed before taxes:
  const targetPostTax = targetIncome + annualExpenses
  const grossNeeded = targetPostTax / (1 - taxBufferPercent / 100)

  // Working weeks & total billable hours per year:
  const workingWeeks = Math.max(1, 52 - vacationWeeks)
  const totalBillableHoursPerYear = workingWeeks * billableHoursPerWeek

  // Rates:
  const hourlyRate = Math.ceil(grossNeeded / totalBillableHoursPerYear)
  const dayRate = hourlyRate * 8
  const weeklySprintRate = hourlyRate * billableHoursPerWeek
  const kickoffDeposit = Math.ceil(weeklySprintRate * 0.5) // 50% deposit
  const annualSavedAdminValue = Math.ceil(hourlyRate * 3.5 * workingWeeks)

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 selection:bg-indigo-500/20 flex flex-col justify-between">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,rgba(168,85,247,0.1)_40%,transparent_75%)] blur-3xl opacity-75" />
        <div
          className="absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_20%,transparent_85%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Top Header */}
      <header className="w-full border-b border-white/5 py-4 px-6 sticky top-0 bg-[#08090a]/85 backdrop-blur-xl z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="font-bold text-sm tracking-tight text-white">Frevio</span>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-1">
              Tools
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Agency & Freelance Tool</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.02em] text-white">
            Freelance & Agency <span className="text-indigo-400">Rate Calculator</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            Stop guessing your rates or undercharging. Calculate your true hourly, daily, and sprint pricing based on billable utilization, taxes, and upfront kickoff deposits.
          </p>
        </div>

        {/* 2-Column Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Sliders & Controls */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0e1017]/90 p-6 sm:p-8 backdrop-blur-xl ring-1 ring-white/5 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-white/5 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Your Financial Target & Capacity</span>
            </h2>

            {/* Target Take-Home */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={targetIncomeId} className="text-slate-300 font-medium">Desired Net Annual Income (After Taxes)</label>
                <span className="font-mono text-sm text-white font-semibold">${targetIncome.toLocaleString()}</span>
              </div>
              <input
                id={targetIncomeId}
                aria-label="Desired Net Annual Income"
                type="range"
                min="40000"
                max="300000"
                step="5000"
                value={targetIncome}
                onChange={(e) => setTargetIncome(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$40k</span>
                <span>$150k</span>
                <span>$300k+</span>
              </div>
            </div>

            {/* Annual Overhead / Expenses */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={annualExpensesId} className="text-slate-300 font-medium">Annual Business Expenses & Software</label>
                <span className="font-mono text-sm text-white font-semibold">${annualExpenses.toLocaleString()}</span>
              </div>
              <input
                id={annualExpensesId}
                aria-label="Annual Business Expenses"
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <p className="text-[11px] text-slate-400">Hardware, software subscriptions, coworking, accounting, and insurance.</p>
            </div>

            {/* Billable Hours / Week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor={billableHoursId} className="text-slate-300 font-medium">Actual Billable Hours / Week</label>
                <span className="font-mono text-sm text-indigo-400 font-semibold">{billableHoursPerWeek} hrs / week</span>
              </div>
              <input
                id={billableHoursId}
                aria-label="Actual Billable Hours Per Week"
                type="range"
                min="10"
                max="40"
                step="1"
                value={billableHoursPerWeek}
                onChange={(e) => setBillableHoursPerWeek(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                ⚠️ <strong>The 40h myth</strong>: Most freelancers spend 10–15 hours weekly on non-billable client emails, status updates, and invoicing. Frevio automates this back into billable time.
              </p>
            </div>

            {/* Vacation / Time Off Weeks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor={vacationWeeksId} className="text-slate-300 font-medium">Time Off / Vacation Weeks</label>
                  <span className="font-mono text-xs text-white">{vacationWeeks} wks</span>
                </div>
                <input
                  id={vacationWeeksId}
                  aria-label="Time Off or Vacation Weeks"
                  type="range"
                  min="2"
                  max="10"
                  value={vacationWeeks}
                  onChange={(e) => setVacationWeeks(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor={taxBufferId} className="text-slate-300 font-medium">Estimated Tax Reserve</label>
                  <span className="font-mono text-xs text-white">{taxBufferPercent}%</span>
                </div>
                <input
                  id={taxBufferId}
                  aria-label="Estimated Tax Reserve Percentage"
                  type="range"
                  min="15"
                  max="40"
                  step="1"
                  value={taxBufferPercent}
                  onChange={(e) => setTaxBufferPercent(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Results & Pricing Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-[#0e1017] p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-indigo-500/20 space-y-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400">
                  Target Pricing Architecture
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-light text-white tracking-tight">${hourlyRate}</span>
                  <span className="text-slate-400 text-sm font-medium">/ hour (USD)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Gross revenue required: <strong>${Math.ceil(grossNeeded).toLocaleString()} / yr</strong> across {workingWeeks} active weeks.
                </p>
              </div>

              {/* Rate Breakdown Table */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400">Day Rate (8 billable hrs)</span>
                  <span className="font-mono text-sm font-semibold text-white">${dayRate.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400">Weekly Sprint Retainer</span>
                  <span className="font-mono text-sm font-semibold text-white">${weeklySprintRate.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span className="font-medium">Recommended 50% Kickoff Deposit</span>
                  <span className="font-mono text-sm font-bold text-white">${kickoffDeposit.toLocaleString()}</span>
                </div>
              </div>

              {/* ROI Callout */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hidden Admin Waste</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Writing manual client updates and chasing invoices consumes ~3.5 hrs/week. Automating this with Frevio recovers <strong>${annualSavedAdminValue.toLocaleString()}</strong> in billable capacity each year.
                </p>
              </div>

              {/* Action Button */}
              <Link
                href="/auth/signup"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-950 transition-all hover:bg-slate-100 hover:scale-[1.01] shadow-lg cursor-pointer"
              >
                <span>Lock In Your Rates With Frevio</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Points */}
            <div className="grid grid-cols-2 gap-3 text-center text-[11px] text-slate-400">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <strong className="block text-white font-medium">Free Forever</strong>
                <span>1 Active Client Portal</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <strong className="block text-white font-medium">Deposit Gating</strong>
                <span>Stripe Settlements</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Frevio Technologies Inc. Built for independent software engineers & design studios.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/auth/signup" className="text-indigo-400 hover:underline">Get started free</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
