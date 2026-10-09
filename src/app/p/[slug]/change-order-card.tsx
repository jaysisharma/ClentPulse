'use client'

import { useState } from 'react'
import {
  ShieldAlert, CheckCircle2, XCircle, Clock, DollarSign,
  Calendar, ArrowRight, Loader2, CreditCard, Check
} from 'lucide-react'
import { ChangeOrder } from '@/types'
import { fmtCurrency } from '@/lib/currencies'

export function ChangeOrderCard({
  changeOrder,
  accentColor = '#6366F1',
  onStatusChange,
}: {
  changeOrder: ChangeOrder
  accentColor?: string
  onStatusChange?: (co: ChangeOrder) => void
}) {
  const [order, setOrder] = useState<ChangeOrder>(changeOrder)
  const [loading, setLoading] = useState(false)
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [declineNotes, setDeclineNotes] = useState('')

  const isPending = order.status === 'pending'
  const isApproved = order.status === 'approved'
  const isPaid = order.status === 'paid'
  const isDeclined = order.status === 'declined'

  async function handleApproveAndPay() {
    setLoading(true)
    try {
      if (order.requires_payment && order.amount > 0) {
        // Launch Stripe Checkout directly
        const res = await fetch(`/api/change-orders/${order.id}/checkout`, { method: 'POST' })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
        throw new Error(data.error || 'Failed to initiate checkout')
      } else {
        // Simple 1-click approve
        const res = await fetch(`/api/change-orders/${order.id}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        })
        const data = await res.json()
        if (data.changeOrder) {
          setOrder(data.changeOrder)
          onStatusChange?.(data.changeOrder)
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error processing approval')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecline() {
    setLoading(true)
    try {
      const res = await fetch(`/api/change-orders/${order.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', notes: declineNotes }),
      })
      const data = await res.json()
      if (data.changeOrder) {
        setOrder(data.changeOrder)
        setShowDeclineForm(false)
        onStatusChange?.(data.changeOrder)
      }
    } catch (err: any) {
      alert(err.message || 'Error declining change order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      id={`co-${order.id}`}
      className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md shadow-xs dark:shadow-none p-5 sm:p-6 transition-all space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
              {order.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono pl-10">
            <span className="text-slate-900 dark:text-white font-semibold text-sm">
              +{fmtCurrency(order.amount, order.currency || 'USD')}
            </span>
            {Boolean(order.timeline_days && order.timeline_days > 0) && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                +{order.timeline_days} days delivery adjustment
              </span>
            )}
            {order.estimated_hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {order.estimated_hours}h estimated
              </span>
            )}
          </div>
        </div>

        {/* Status Pill */}
        <div className="self-start sm:self-auto flex-shrink-0">
          {isPending && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Sign-off Required
            </span>
          )}
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Approved · Payment Due
            </span>
          )}
          {isPaid && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" />
              Approved &amp; Paid via Stripe
            </span>
          )}
          {isDeclined && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full">
              <XCircle className="w-3 h-3" />
              Declined (Original Scope)
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {order.description && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
          {order.description}
        </div>
      )}

      {/* Decline Form / Notes */}
      {showDeclineForm && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/[0.03] space-y-3">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Decline Note for Studio (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Let's stick with the original project scope for now..."
            value={declineNotes}
            onChange={e => setDeclineNotes(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowDeclineForm(false)}
              className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDecline}
              className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Confirm Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons for Client */}
      {isPending && !showDeclineForm && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Approving authorizes the deliverable addition and updates project timeline.
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowDeclineForm(true)}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Decline Change
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleApproveAndPay}
              className="px-5 py-2 rounded-full text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : order.requires_payment && order.amount > 0 ? (
                <CreditCard className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>
                {order.requires_payment && order.amount > 0
                  ? `Approve & Pay (${fmtCurrency(order.amount, order.currency || 'USD')})`
                  : 'Approve Scope Change'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Approved but payment pending */}
      {isApproved && order.amount > 0 && !isPaid && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Scope approved. Payment can be finalized now via Stripe.
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={handleApproveAndPay}
            className="px-4 py-1.5 rounded-full text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: accentColor }}
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            <CreditCard className="w-3 h-3" />
            <span>Pay {fmtCurrency(order.amount, order.currency || 'USD')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
