'use client'

import { fmtCurrency } from '@/lib/currencies'

interface LineItem { description: string; quantity: number; rate: number; amount: number }
interface Invoice {
  invoice_number: string
  client_name: string
  client_email: string | null
  due_date: string | null
  status: string
  currency?: string | null
  tax_rate?: number | null
  tax_id?: string | null
  is_deposit?: boolean | null
  items: LineItem[]
  notes: string | null
  created_at: string
}
interface Owner { name: string | null; logo_url: string | null; accent_color: string | null }

const STATUS_STYLES: Record<string, string> = {
  draft:   'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5',
  sent:    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  paid:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  overdue: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
}

function isOverdue(inv: { status: string; due_date: string | null }) {
  if (inv.status === 'paid' || !inv.due_date) return false
  return new Date(inv.due_date) < new Date(new Date().toDateString())
}

export function InvoicePrint({ invoice, owner }: { invoice: Invoice; owner: Owner | null }) {
  const currency = invoice.currency || 'USD'
  const subtotal = (invoice.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
  const taxRate = Number(invoice.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount

  const accent = owner?.accent_color ?? '#6366F1'
  const overdue = isOverdue(invoice)
  const statusKey = overdue ? 'overdue' : invoice.status

  return (
    <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden backdrop-blur-md shadow-xs dark:shadow-none print:border-0 print:rounded-none print:shadow-none">
      {/* Invoice header */}
      <div className="px-6 sm:px-8 py-8 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-start justify-between">
          <div>
            {owner?.logo_url ? (
              <img src={owner.logo_url} alt="Logo" className="h-10 w-auto object-contain mb-4" />
            ) : (
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-lg shadow-xs" style={{ backgroundColor: accent }}>
                {(owner?.name ?? 'F')[0].toUpperCase()}
              </div>
            )}
            <div className="font-semibold text-slate-900 dark:text-white text-base">{owner?.name ?? 'Studio'}</div>
            {invoice.tax_id && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Tax/VAT ID: {invoice.tax_id}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-light uppercase tracking-tight text-slate-900 dark:text-white mb-1">INVOICE</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono">{invoice.invoice_number}</div>
            <div className="flex items-center justify-end gap-1.5 mt-2">
              {invoice.is_deposit && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Deposit
                </span>
              )}
              <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STATUS_STYLES[statusKey]}`}>
                {statusKey.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Billed Client</div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{invoice.client_name}</div>
            {invoice.client_email && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{invoice.client_email}</div>}
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Billing Terms</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono space-y-1">
              <div>Issued: {new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              {invoice.due_date && (
                <div>Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="px-6 sm:px-8 py-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5">
              <th className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">Description</th>
              <th className="text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">Qty</th>
              <th className="text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">Rate</th>
              <th className="text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pb-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-white/[0.03]">
                <td className="py-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">{item.description}</td>
                <td className="py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono">{item.quantity}</td>
                <td className="py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono">{fmtCurrency(item.rate, currency)}</td>
                <td className="py-3.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-right font-mono">{fmtCurrency(item.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total breakdown */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1.5 text-right">
            <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{fmtCurrency(subtotal, currency)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400">
                <span>Tax / VAT ({taxRate}%):</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{fmtCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline py-2.5 border-t border-slate-200 dark:border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Due</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-2xl tracking-tight">{fmtCurrency(total, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Payment Terms & Notes</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-light">{invoice.notes}</p>
        </div>
      )}

      {/* Accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
    </div>
  )
}
