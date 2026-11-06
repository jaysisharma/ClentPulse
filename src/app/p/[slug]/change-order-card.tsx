'use client'

import { useState } from 'react'
import { ShieldAlert, CheckCircle2, XCircle, Clock, Calendar, Loader2, Check } from 'lucide-react'
import { ChangeOrder } from '@/types'
import { fmtCurrency } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { changeOrderNeedsPayment } from './portal-model'
import { MUTED, PRIMARY_BUTTON, SECONDARY_BUTTON, PayChangeOrderButton, shortDate } from './portal-ui'

function amountLabel(order: ChangeOrder) {
  return fmtCurrency(order.amount, order.currency || 'USD')
}

export function ChangeOrderStatusPill({ order }: { order: ChangeOrder }) {
  const base = 'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0'
  if (order.status === 'pending') {
    return <span className={cn(base, 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20')}><Clock className="w-3 h-3" />Awaiting you</span>
  }
  if (changeOrderNeedsPayment(order)) {
    return <span className={cn(base, 'text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20')}><CheckCircle2 className="w-3 h-3" />Approved · payment due</span>
  }
  if (order.status === 'approved') {
    return <span className={cn(base, 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20')}><CheckCircle2 className="w-3 h-3" />Approved</span>
  }
  if (order.status === 'paid') {
    return <span className={cn(base, 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20')}><Check className="w-3 h-3" />Approved · paid</span>
  }
  return <span className={cn(base, 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/10')}><XCircle className="w-3 h-3" />Declined</span>
}

/** A proposed scope change: the client approves or declines, then pays if required. */
export function ChangeOrderCard({
  changeOrder,
  accentColor = '#6366F1',
  onStatusChange,
  isDemo = false,
}: {
  changeOrder: ChangeOrder
  accentColor?: string
  onStatusChange?: (co: ChangeOrder) => void
  isDemo?: boolean
}) {
  const [order, setOrder] = useState<ChangeOrder>(changeOrder)
  const [loading, setLoading] = useState(false)
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [declineNotes, setDeclineNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function review(action: 'approve' | 'decline') {
    setLoading(true)
    setError(null)
    if (isDemo) {
      const next = { ...order, status: action === 'approve' ? 'approved' : 'declined' } as ChangeOrder
      setOrder(next)
      onStatusChange?.(next)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/change-orders/${order.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'approve' ? { action } : { action, notes: declineNotes.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.changeOrder) throw new Error(data.error || 'We couldn’t record your decision. Please try again.')
      setOrder(data.changeOrder)
      setShowDeclineForm(false)
      onStatusChange?.(data.changeOrder)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isPending = order.status === 'pending'
  const needsPayment = changeOrderNeedsPayment(order)

  return (
    <div className="p-4 rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-white/[0.02] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold break-words">Scope change: {order.title}</p>
            <p className={cn('text-xs mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5', MUTED)}>
              {order.amount > 0 && <span className="font-semibold text-slate-900 dark:text-white">+{amountLabel(order)}</span>}
              {Boolean(order.timeline_days && order.timeline_days > 0) && (
                <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />+{order.timeline_days} days</span>
              )}
              {order.estimated_hours ? <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{order.estimated_hours}h estimated</span> : null}
            </p>
          </div>
        </div>
        <ChangeOrderStatusPill order={order} />
      </div>

      {order.description && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">{order.description}</p>
      )}

      {isPending && showDeclineForm && (
        <div>
          <label htmlFor={`co-note-${order.id}`} className="block text-xs font-semibold mb-1.5">Note for the studio (optional)</label>
          <textarea
            id={`co-note-${order.id}`}
            rows={2}
            maxLength={2000}
            placeholder="e.g. Let’s stick with the original scope for now."
            value={declineNotes}
            onChange={e => setDeclineNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-[#eaecf2] dark:border-white/10 bg-white dark:bg-white/[0.03] placeholder:text-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none"
          />
        </div>
      )}

      {isPending && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showDeclineForm ? (
            <>
              <button type="button" onClick={() => setShowDeclineForm(false)} disabled={loading} className={SECONDARY_BUTTON}>Cancel</button>
              <button type="button" onClick={() => review('decline')} disabled={loading} className={cn(PRIMARY_BUTTON, 'bg-slate-700 dark:bg-slate-600')}>
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Decline change
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setShowDeclineForm(true)} disabled={loading} className={SECONDARY_BUTTON}>Decline</button>
              <button type="button" onClick={() => review('approve')} disabled={loading} className={PRIMARY_BUTTON} style={{ backgroundColor: accentColor }}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approve{order.amount > 0 ? ` +${amountLabel(order)}` : ''}
              </button>
            </>
          )}
        </div>
      )}

      {needsPayment && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f3f7] dark:border-white/[0.05]">
          <p className={cn('text-xs', MUTED)}>You approved this change. Pay to add it to the project.</p>
          <PayChangeOrderButton changeOrderId={order.id} label={`Pay ${amountLabel(order)}`} accent={accentColor} isDemo={isDemo} />
        </div>
      )}

      {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}

/** A decided scope change, for history lists. */
export function ChangeOrderHistoryRow({ order }: { order: ChangeOrder }) {
  const decidedAt = order.paid_at || order.approved_at
  return (
    <li className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold break-words">{order.title}</p>
        <p className={cn('text-xs mt-0.5', MUTED)}>
          {order.amount > 0 ? `+${amountLabel(order)}` : 'No cost'}
          {order.timeline_days ? ` · +${order.timeline_days} days` : ''}
          {decidedAt ? ` · ${shortDate(decidedAt)}` : ''}
        </p>
        {order.client_notes && <p className={cn('text-xs mt-1.5 italic break-words', MUTED)}>“{order.client_notes}”</p>}
      </div>
      <ChangeOrderStatusPill order={order} />
    </li>
  )
}
