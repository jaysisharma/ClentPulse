'use client'

import { useState } from 'react'
import { Shield, Sparkles, Copy, Check, ArrowRight, Loader2, DollarSign, Clock, AlertCircle } from 'lucide-react'

interface ScopeDefenderModalProps {
  projectId: string
  hourlyRate?: number | null
  currency?: string
  isOpen: boolean
  onClose: () => void
  onApplyChangeOrder?: (title: string, amount: number) => void
}

export function ScopeDefenderModal({
  projectId,
  hourlyRate = 125,
  currency = 'USD',
  isOpen,
  onClose,
  onApplyChangeOrder,
}: ScopeDefenderModalProps) {
  const [clientMessage, setClientMessage] = useState('')
  const [rate, setRate] = useState<number>(hourlyRate || 125)
  const [hours, setHours] = useState<number>(8)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [result, setResult] = useState<{
    title: string
    amount: number
    estimatedHours: number
    politeResponse: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!clientMessage.trim()) return

    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scope_defender',
          projectId,
          clientMessage,
          projectRate: rate,
          currency,
          estimatedHours: hours,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate scope defense')
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.politeResponse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f7] dark:border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AI Scope Defender</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Defend Cash Flow
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transform awkward out-of-scope client requests into polite, itemized change orders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Client Request Message
            </label>
            <textarea
              rows={3}
              placeholder={`"Hey! Can we also quickly add multi-currency checkout, dark mode toggle, and an export CSV button before launch?"`}
              value={clientMessage}
              onChange={e => setClientMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Hourly Rate ({currency})
              </label>
              <input
                type="number"
                min={1}
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Estimated Hours
              </label>
              <input
                type="number"
                min={1}
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !clientMessage.trim()}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Draft Diplomatic Response</span>
            </button>
          </div>
        </form>

        {/* Results display */}
        {result && (
          <div className="mt-4 pt-4 border-t border-[#f1f3f7] dark:border-white/[0.05] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Suggested Change Order: {currency} {result.amount.toLocaleString()} ({result.estimatedHours}h)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy Response</>
                )}
              </button>
            </div>

            <div className="rounded-md bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-3 text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
              {result.politeResponse}
            </div>

            {onApplyChangeOrder && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onApplyChangeOrder(result.title, result.amount)
                    onClose()
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Apply as Change Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

