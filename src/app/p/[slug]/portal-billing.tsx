'use client'

import Link from 'next/link'
import { FileText, Receipt } from 'lucide-react'
import { fmtCurrency } from '@/lib/currencies'
import { formatDate, cn } from '@/lib/utils'
import { CARD } from '@/components/dashboard/styles'
import type { ChangeOrder } from '@/types'
import { ChangeOrderStatusPill } from './change-order-card'
import { billingSummary, changeOrderNeedsPayment, invoiceTotal, type PortalInvoice } from './portal-model'
import { DIVIDE, EmptyState, MUTED, PayChangeOrderButton, Section, SECONDARY_BUTTON, PRIMARY_BUTTON } from './portal-ui'

export function BillingTab({
  invoices,
  changeOrders,
  depositRequired,
  depositPaid,
  accent,
  isDemo,
}: {
  invoices: PortalInvoice[]
  changeOrders: ChangeOrder[]
  depositRequired: number
  depositPaid: boolean
  accent: string
  isDemo: boolean
}) {
  const billableChanges = changeOrders.filter(
    c => c.requires_payment && Number(c.amount) > 0 && (c.status === 'approved' || c.status === 'paid')
  )
  const summary = billingSummary(invoices, changeOrders)
  const hasAnything = invoices.length > 0 || billableChanges.length > 0

  return (
    <div className="space-y-6">
      {hasAnything && summary.currency && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={cn(CARD, 'p-5')}>
            <p className={cn('text-xs font-semibold', MUTED)}>Outstanding</p>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums mt-1">{fmtCurrency(summary.outstanding, summary.currency)}</p>
          </div>
          <div className={cn(CARD, 'p-5')}>
            <p className={cn('text-xs font-semibold', MUTED)}>Paid so far</p>
            <p className="text-2xl font-extrabold tracking-tight tabular-nums mt-1">{fmtCurrency(summary.paid, summary.currency)}</p>
          </div>
        </div>
      )}

      <Section title="Invoices" bodyClassName={invoices.length > 0 ? '' : 'px-5 pb-5'}>
        {invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet."
            detail={depositRequired > 0 && !depositPaid ? 'Your kickoff deposit invoice will appear here.' : 'Invoices from your studio will appear here.'}
          />
        ) : (
          <ul className={cn(DIVIDE, 'border-t border-[#f1f3f7] dark:border-white/[0.05]')}>
            {invoices.map(inv => {
              const paid = inv.status === 'paid'
              return (
                <li key={inv.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-5 py-3.5">
                  <span className={cn(
                    'w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0',
                    paid
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
                  )}>
                    <FileText className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {inv.invoice_number ? `Invoice ${inv.invoice_number}` : 'Invoice'}
                      {inv.is_deposit ? ' · Upfront Deposit' : inv.is_retainer ? ` · ${inv.retainer_period === 'quarterly' ? 'Quarterly' : inv.retainer_period === 'annual' ? 'Annual' : 'Monthly'} Retainer` : ''}
                    </p>
                    <p className={cn('text-xs', paid ? MUTED : 'text-amber-700 dark:text-amber-400 font-medium')}>
                      {paid ? `Paid${inv.paid_at ? ` ${formatDate(inv.paid_at)}` : ''}` : inv.due_date ? `Due ${formatDate(inv.due_date)}` : 'Due on receipt'}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{fmtCurrency(invoiceTotal(inv), inv.currency || 'USD')}</span>
                  <Link
                    href={`/invoice/${inv.id}`}
                    className={paid ? SECONDARY_BUTTON : PRIMARY_BUTTON}
                    style={paid ? undefined : { backgroundColor: accent }}
                  >
                    {paid ? 'Receipt' : 'Pay'}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {billableChanges.length > 0 && (
        <Section title="Scope changes" bodyClassName="">
          <ul className={cn(DIVIDE, 'border-t border-[#f1f3f7] dark:border-white/[0.05]')}>
            {billableChanges.map(co => (
              <li key={co.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words">{co.title}</p>
                  <div className="mt-1"><ChangeOrderStatusPill order={co} /></div>
                </div>
                <span className="text-sm font-bold tabular-nums">{fmtCurrency(Number(co.amount), co.currency || 'USD')}</span>
                {changeOrderNeedsPayment(co) && (
                  <PayChangeOrderButton changeOrderId={co.id} label="Pay" accent={accent} isDemo={isDemo} />
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
