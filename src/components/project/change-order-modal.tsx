'use client'

import { useState, useEffect } from 'react'
import {
  ShieldAlert, X, DollarSign, Clock, Calendar, Check,
  AlertCircle, Sparkles, Loader2
} from 'lucide-react'
import { ChangeOrder } from '@/types'

interface ChangeOrderModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  currency?: string
  initialData?: Partial<ChangeOrder> | null
  sourceFeedbackMessage?: string | null
  sourceFeedbackId?: string | null
  onSuccess: (co: ChangeOrder) => void
}

export function ChangeOrderModal({
  isOpen,
  onClose,
  projectId,
  currency = 'USD',
  initialData,
  sourceFeedbackMessage,
  sourceFeedbackId,
  onSuccess,
}: ChangeOrderModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<string>('350')
  const [estimatedHours, setEstimatedHours] = useState<string>('4')
  const [timelineDays, setTimelineDays] = useState<string>('2')
  const [requiresPayment, setRequiresPayment] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '')
        setDescription(initialData.description || '')
        setAmount(initialData.amount ? String(initialData.amount) : '350')
        setEstimatedHours(initialData.estimated_hours ? String(initialData.estimated_hours) : '')
        setTimelineDays(initialData.timeline_days ? String(initialData.timeline_days) : '0')
        setRequiresPayment(initialData.requires_payment ?? true)
      } else if (sourceFeedbackMessage) {
        setTitle('Out-of-Scope Client Request')
        setDescription(
          `Requested addition based on feedback:\n"${sourceFeedbackMessage}"\n\nDeliverable details:\n- `
        )
        setAmount('350')
        setEstimatedHours('4')
        setTimelineDays('2')
        setRequiresPayment(true)
      } else {
        setTitle('')
        setDescription('')
        setAmount('350')
        setEstimatedHours('4')
        setTimelineDays('2')
        setRequiresPayment(true)
      }
      setError(null)
    }
  }, [isOpen, initialData, sourceFeedbackMessage])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const isEditing = Boolean(initialData?.id)
      const url = isEditing
        ? `/api/change-orders/${initialData!.id}`
        : '/api/change-orders'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          amount: parseFloat(amount) || 0,
          currency: currency.toUpperCase(),
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
          timelineDays: parseInt(timelineDays, 10) || 0,
          requiresPayment,
          sourceFeedbackId: sourceFeedbackId || initialData?.source_feedback_id || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save change order')
      }

      onSuccess(data.changeOrder)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {initialData?.id ? 'Edit Change Order' : 'Scope Creep Shield · New Change Order'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                Protect your profit by scoping and billing extra work upfront.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sourceFeedbackMessage && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300">
              <span className="font-semibold uppercase tracking-wider text-[10px] block text-indigo-600 dark:text-indigo-400 mb-1">
                Triggered from Client Feedback:
              </span>
              <p className="italic text-slate-700 dark:text-slate-300">&ldquo;{sourceFeedbackMessage}&rdquo;</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Change Order Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Additional Landing Page Variant & Motion Graphics"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Out-of-Scope Description & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Describe the exact deliverable so the client understands what this covers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Price ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="350"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Est. Hours
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="4.0"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Timeline Impact
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="+2 days"
                  value={timelineDays}
                  onChange={e => setTimelineDays(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Upfront payment checkbox */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Require 1-Click Stripe Deposit on Approval
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light">
                Client must pay upfront before work begins to avoid unpaid overtime.
              </div>
            </div>
            <input
              type="checkbox"
              checked={requiresPayment}
              onChange={e => setRequiresPayment(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-white/20 cursor-pointer"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData?.id ? 'Save Changes' : 'Issue Change Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
