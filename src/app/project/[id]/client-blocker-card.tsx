'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Send, CheckCircle2, Clock, ShieldAlert,
  Sparkles, Loader2, Check, ArrowRight
} from 'lucide-react'
import { fmtCurrency } from '@/lib/currencies'
import Link from 'next/link'

const PRESET_REASONS = [
  'Awaiting brand assets & final copy',
  'Waiting on Stripe / API credentials',
  'Awaiting DNS / server access',
  'Pending feedback on latest milestone',
  'Awaiting kickoff contract signature',
]

interface ClientBlockerCardProps {
  projectId: string
  clientName: string
  clientEmail?: string | null
  initialWaiting: boolean
  initialReason?: string | null
  depositRequired?: number | null
  depositPaid?: boolean | null
  currency?: string | null
}

export function ClientBlockerCard({
  projectId,
  clientName,
  clientEmail,
  initialWaiting,
  initialReason,
  depositRequired,
  depositPaid,
  currency = 'USD',
}: ClientBlockerCardProps) {
  const router = useRouter()
  const [isWaiting, setIsWaiting] = useState(initialWaiting)
  const [reason, setReason] = useState(initialReason || '')
  const [saving, setSaving] = useState(false)
  const [nudging, setNudging] = useState(false)
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null)
  const [nudgeError, setNudgeError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)

  async function handleToggle(waiting: boolean) {
    setIsWaiting(waiting)
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('projects')
      .update({
        waiting_on_client: waiting,
        waiting_reason: waiting ? (reason || 'Awaiting client response / assets') : null,
      })
      .eq('id', projectId)

    setSaving(false)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
    router.refresh()
  }

  async function handleSaveReason() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('projects')
      .update({
        waiting_on_client: isWaiting,
        waiting_reason: reason || null,
      })
      .eq('id', projectId)

    setSaving(false)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
    router.refresh()
  }

  async function handleSendNudge() {
    setNudging(true)
    setNudgeSuccess(null)
    setNudgeError(null)

    try {
      const res = await fetch('/api/remind-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send client reminder')
      }

      setNudgeSuccess(`Gentle reminder email successfully delivered to ${clientEmail || clientName}!`)
      setTimeout(() => setNudgeSuccess(null), 6000)
    } catch (err: any) {
      setNudgeError(err.message || 'Error delivering reminder email')
      setTimeout(() => setNudgeError(null), 6000)
    } finally {
      setNudging(false)
    }
  }

  const isDepositPending = Boolean(depositRequired && depositRequired > 0 && !depositPaid)

  return (
    <div className="space-y-4">
      {/* Upfront Deposit Gate Notice if applicable */}
      {isDepositPending && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-5 ring-1 ring-indigo-500/10 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Upfront Kickoff Deposit Required
                </div>
                <div className="text-sm font-light text-slate-700 dark:text-slate-300 mt-1">
                  A deposit of <span className="font-mono font-medium text-slate-900 dark:text-white">{fmtCurrency(depositRequired!, currency || 'USD')}</span> is required before work commences. The client portal features an upfront payment gate until Stripe settlement is confirmed.
                </div>
              </div>
            </div>
            <Link
              href={`/invoices/new?project=${projectId}&deposit=true`}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
            >
              Deposit Invoices <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Waiting on Client Blocker Box */}
      <div className={`rounded-2xl border transition-all p-5 backdrop-blur-md shadow-xs ${
        isWaiting
          ? 'border-amber-500/30 bg-amber-500/5 dark:bg-[#0c0d12]/95 ring-1 ring-amber-500/20'
          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 ring-1 ring-slate-950/5 dark:ring-white/5'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              isWaiting
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Client Blocker Status
                </span>
                {isWaiting ? (
                  <span className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Blocked on Client
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    On Track
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                {isWaiting
                  ? 'Client portal displays a high-visibility amber notice prompting them for action.'
                  : 'Toggle when your progress is delayed awaiting files, credentials, or review.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isWaiting ? (
              <button
                type="button"
                onClick={() => handleToggle(false)}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-xs"
              >
                Mark Unblocked
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggle(true)}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-colors shadow-xs"
              >
                Flag as Blocked
              </button>
            )}
          </div>
        </div>

        {/* Blocker details when active */}
        {isWaiting && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Blocker Reason / Required Asset
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Awaiting Stripe API keys and DNS record setup"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 dark:focus:border-amber-500/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSaveReason}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 flex-shrink-0 shadow-xs"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {/* Quick preset tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1">Presets:</span>
              {PRESET_REASONS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* 1-Click Client Nudge Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-light">
                Prompt {clientName} via email to remove this blocker.
              </div>
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={nudging}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xs disabled:opacity-50"
              >
                {nudging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting reminder…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Nudge Client (1-Click)</span>
                  </>
                )}
              </button>
            </div>

            {nudgeSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>{nudgeSuccess}</span>
              </div>
            )}

            {nudgeError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-rose-800 dark:text-rose-300 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span>{nudgeError}</span>
              </div>
            )}

            {savedNotice && (
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Blocker status synchronized
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
