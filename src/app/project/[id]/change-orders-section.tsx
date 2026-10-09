'use client'

import { useState } from 'react'
import {
  ShieldAlert, Plus, CheckCircle2, Clock, DollarSign,
  AlertCircle, Trash2, Edit2, Copy, Check, ExternalLink, Calendar
} from 'lucide-react'
import { ChangeOrder } from '@/types'
import { fmtCurrency } from '@/lib/currencies'
import { ChangeOrderModal } from '@/components/project/change-order-modal'

interface ChangeOrdersSectionProps {
  projectId: string
  projectSlug: string
  currency?: string
  initialChangeOrders: ChangeOrder[]
  canManage?: boolean
}

export function ChangeOrdersSection({
  projectId,
  projectSlug,
  currency = 'USD',
  initialChangeOrders,
  canManage = true,
}: ChangeOrdersSectionProps) {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(initialChangeOrders)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ChangeOrder | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const protectedRevenue = changeOrders
    .filter(co => ['approved', 'paid'].includes(co.status))
    .reduce((s, co) => s + (Number(co.amount) || 0), 0)

  const pendingCount = changeOrders.filter(co => co.status === 'pending').length
  const paidCount = changeOrders.filter(co => co.status === 'paid').length

  function handleSuccess(saved: ChangeOrder) {
    setChangeOrders(prev => {
      const idx = prev.findIndex(item => item.id === saved.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = saved
        return copy
      }
      return [saved, ...prev]
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this change order?')) return
    try {
      const res = await fetch(`/api/change-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setChangeOrders(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert('Error deleting change order')
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      const res = await fetch(`/api/change-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      const data = await res.json()
      if (res.ok && data.changeOrder) {
        handleSuccess(data.changeOrder)
      }
    } catch {
      alert('Error marking change order as paid')
    }
  }

  function handleCopyPortalLink(coId: string) {
    const appUrl = window.location.origin
    const url = `${appUrl}/p/${projectSlug}?tab=scope#co-${coId}`
    navigator.clipboard.writeText(url)
    setCopiedId(coId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-5 sm:p-6 shadow-xs dark:shadow-sm space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                Scope Creep Shield &amp; Change Orders
              </h2>
              {protectedRevenue > 0 && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  +{fmtCurrency(protectedRevenue, currency)} protected revenue
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light pl-10">
            Never do out-of-scope work for free. Convert extra client requests into approved, billed change orders.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setEditingOrder(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Change Order</span>
          </button>
        )}
      </div>

      {/* Mini KPI row */}
      {changeOrders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-slate-400">Protected</div>
            <div className="text-base sm:text-lg font-mono font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{fmtCurrency(protectedRevenue, currency)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Issued</div>
            <div className="text-base sm:text-lg font-mono font-medium text-slate-900 dark:text-white mt-0.5">
              {changeOrders.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-slate-400">Pending Review</div>
            <div className="text-base sm:text-lg font-mono font-medium text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="text-[10px] uppercase font-mono text-slate-400">Settled (Paid)</div>
            <div className="text-base sm:text-lg font-mono font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
              {paidCount}
            </div>
          </div>
        </div>
      )}

      {/* List of Change Orders */}
      {changeOrders.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
          <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            No change orders issued for this project yet.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-light mt-1 max-w-sm mx-auto">
            When a client asks for additional features or revisions outside original milestones, issue a change order here to lock in budget and delivery extension.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {changeOrders.map(co => {
            const isPending = co.status === 'pending'
            const isApproved = co.status === 'approved'
            const isPaid = co.status === 'paid'
            const isDeclined = co.status === 'declined'

            return (
              <div
                key={co.id}
                id={`co-${co.id}`}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {co.title}
                    </h3>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        Pending Client Approval
                      </span>
                    )}
                    {isApproved && (
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        Approved · Payment Due
                      </span>
                    )}
                    {isPaid && (
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Paid via Stripe
                      </span>
                    )}
                    {isDeclined && (
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                        Declined by Client
                      </span>
                    )}
                  </div>

                  {co.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed whitespace-pre-wrap">
                      {co.description}
                    </p>
                  )}

                  {co.client_notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-black/30 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                      Client note: &ldquo;{co.client_notes}&rdquo;
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 font-mono">
                    <span className="text-slate-900 dark:text-white font-semibold">
                      +{fmtCurrency(co.amount, co.currency || currency)}
                    </span>
                    {co.estimated_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {co.estimated_hours}h estimated
                      </span>
                    )}
                    {Boolean(co.timeline_days && co.timeline_days > 0) && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Calendar className="w-3 h-3" />
                        +{co.timeline_days} days extension
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0">
                    <button
                      type="button"
                      title="Copy Client Approval Link"
                      onClick={() => handleCopyPortalLink(co.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === co.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Link</span>
                        </>
                      )}
                    </button>

                    {!isPaid && (
                      <button
                        type="button"
                        title="Mark Paid"
                        onClick={() => handleMarkPaid(co.id)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors text-[10px] font-semibold cursor-pointer"
                      >
                        Mark Paid
                      </button>
                    )}

                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditingOrder(co)
                        setModalOpen(true)
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDelete(co.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <ChangeOrderModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingOrder(null)
        }}
        projectId={projectId}
        currency={currency}
        initialData={editingOrder}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
