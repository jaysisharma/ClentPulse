'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ToolsSubnav } from '@/components/tools/tools-subnav'
import {
  ShieldAlert, DollarSign, Clock, Zap, Copy, Check,
  Sparkles, ArrowUpRight, MessageSquare, AlertCircle
} from 'lucide-react'

export default function ScopeCreepCalculatorPage() {
  const [hourlyRate, setHourlyRate] = useState(100)
  const [extraHours, setExtraHours] = useState(12)
  const [rushMultiplier, setRushMultiplier] = useState(1.0)
  const [complexityMultiplier, setComplexityMultiplier] = useState(1.0)
  const [relationshipFactor, setRelationshipFactor] = useState(1.0)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Calculations
  const basePrice = hourlyRate * extraHours
  const rushSurcharge = basePrice * (rushMultiplier - 1.0)
  const complexityBuffer = (basePrice + rushSurcharge) * (complexityMultiplier - 1.0)
  const rawSubtotal = (basePrice + rushSurcharge + complexityBuffer) * relationshipFactor
  const recommendedQuote = Math.ceil(rawSubtotal / 25) * 25 // Round to nearest $25

  function copyScript(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2500)
  }

  // Scripts
  const scripts = [
    {
      title: 'Standard Professional Change Order',
      desc: 'Transparent, friendly, and sets a clear financial boundary.',
      text: `Hi [Client Name],\n\nThanks for sharing the updated requirements regarding [Feature / Extra Task].\n\nBecause this falls outside the initial scope agreed upon in our project milestone, I've prepared a brief Change Order estimate so we can implement it without delay:\n\n• Estimated Scope: ~${extraHours} hours\n• Change Order Investment: $${recommendedQuote.toLocaleString()}\n• Delivery Impact: [e.g. +3 business days]\n\nIf you'd like to proceed with this addition, please confirm and I will queue it right up. Otherwise, we can keep focus on our current milestone deliverables.\n\nBest,\n[Your Name]`,
    },
    {
      title: 'The Budget-Friendly Scope Swap',
      desc: 'Allows the client to get their new request without increasing their total spend.',
      text: `Hi [Client Name],\n\nI can definitely help with [New Request]! Adding this will require approximately ${extraHours} hours ($${recommendedQuote.toLocaleString()}).\n\nTo keep the current project budget and deadline completely unchanged, we could swap this in place of [Existing Lower-Priority Task], or we can add it as an official Change Order for $${recommendedQuote.toLocaleString()}.\n\nLet me know which option you prefer!\n\nBest,\n[Your Name]`,
    },
    {
      title: 'Phase 2 Backlog Deferral',
      desc: 'Protects the launch timeline while acknowledging the client\'s idea.',
      text: `Hi [Client Name],\n\nThat's a fantastic idea for [Feature]. To ensure we hit our scheduled launch date for the current phase, I recommend noting this in our Phase 2 backlog.\n\nFor reference, implementing this in Phase 2 will run approximately $${recommendedQuote.toLocaleString()} (~${extraHours} hours). Let's finalize and deploy what we have on deck first, then dive straight into this next.\n\nBest,\n[Your Name]`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#08090a] text-slate-100 selection:bg-indigo-500/20 flex flex-col justify-between">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.12)_0%,rgba(99,102,241,0.08)_40%,transparent_75%)] blur-3xl opacity-75" />
      </div>

      {/* Top Header */}
      <header className="w-full border-b border-white/5 py-4 px-6 sticky top-0 bg-[#08090a]/85 backdrop-blur-xl z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="w-6 h-6 text-white transition-transform group-hover:scale-105" />
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
              href="/auth/login?mode=signup"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-sm"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <ToolsSubnav />

        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-mono text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scope Creep Protection & Change Orders</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-[-0.02em] text-white">
            Scope Creep & <span className="text-rose-400">Change Order</span> Estimator
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            Stop giving away free revisions and unbilled hours. Calculate the true value of out-of-scope requests and copy-paste professional client response scripts in seconds.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Calculator Controls */}
          <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0e1017]/90 p-6 sm:p-8 backdrop-blur-xl ring-1 ring-white/5 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-white/5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>Scope Request Parameters</span>
            </h2>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Your Base Hourly Rate</label>
                <span className="font-mono text-indigo-400 font-bold">${hourlyRate}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={hourlyRate}
                onChange={e => setHourlyRate(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Extra Hours */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Estimated Extra Hours Required</label>
                <span className="font-mono text-rose-400 font-bold">{extraHours} hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={extraHours}
                onChange={e => setExtraHours(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Turnaround / Rush Factor */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">Urgency & Timeline Requirement</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Standard', sub: '+0%', val: 1.0 },
                  { label: 'Rush (3 Days)', sub: '+25%', val: 1.25 },
                  { label: 'Weekend / 24h', sub: '+50%', val: 1.5 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setRushMultiplier(opt.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      rushMultiplier === opt.val
                        ? 'border-rose-500/50 bg-rose-500/10 text-white ring-1 ring-rose-500/20'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity Factor */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">Technical / Design Complexity</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Minor Tweak', sub: 'Low Risk', val: 1.0 },
                  { label: 'New Feature', sub: 'Moderate', val: 1.2 },
                  { label: 'Major Pivot', sub: 'High Risk', val: 1.5 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setComplexityMultiplier(opt.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      complexityMultiplier === opt.val
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-white ring-1 ring-indigo-500/20'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Multiplier */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">Client Relationship</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'VIP Repeat', sub: '-10% Loyalty', val: 0.9 },
                  { label: 'Standard', sub: 'Regular', val: 1.0 },
                  { label: 'High-Demand', sub: '+15% Buffer', val: 1.15 },
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setRelationshipFactor(opt.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      relationshipFactor === opt.val
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-white ring-1 ring-emerald-500/20'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Quote Calculation & Scripts */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* The Big Number Card */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-[#0e1017] to-[#08090a] p-6 sm:p-8 backdrop-blur-xl ring-1 ring-rose-500/20 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  Recommended Change Order Quote
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Fixed Price
                </span>
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-light text-white tracking-tight">
                ${recommendedQuote.toLocaleString()}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] font-mono uppercase">Base Labor</div>
                  <div className="font-mono text-slate-300 font-semibold mt-0.5">${basePrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-mono uppercase">Rush Surcharge</div>
                  <div className="font-mono text-rose-400 font-semibold mt-0.5">+${Math.round(rushSurcharge).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-mono uppercase">Complexity Buffer</div>
                  <div className="font-mono text-indigo-400 font-semibold mt-0.5">+${Math.round(complexityBuffer).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Client Response Scripts */}
            <div className="rounded-2xl border border-white/10 bg-[#0e1017]/90 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Client Email / Slack Scripts</span>
              </div>
              <p className="text-xs text-slate-400">
                Copy one of these battle-tested scripts directly into your email or Slack conversation:
              </p>

              <div className="space-y-3">
                {scripts.map((script, idx) => (
                  <div key={script.title} className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{script.title}</div>
                        <div className="text-[11px] text-slate-400">{script.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyScript(script.text, idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-[#08090a] p-3 rounded-lg border border-white/5 leading-relaxed overflow-x-auto max-h-36">
                      {script.text}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── CTA BANNER ─────────────────────────────────────────────── */}
        <div className="mt-12 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-[#0e1017] p-8 text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built into Frevio Client Portals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-tight">
            Stop doing revisions for free
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Frevio allows you to submit change orders directly within the client portal. Clients review the itemized price and approve or pay via card in 1 click before extra work begins.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login?mode=signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/10"
            >
              <span>Get Started Free on Frevio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>© {new Date().getFullYear()} Frevio. All rights reserved.</p>
      </footer>

    </div>
  )
}
