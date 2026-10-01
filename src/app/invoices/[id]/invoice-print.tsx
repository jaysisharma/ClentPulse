'use client'

import { fmtCurrency } from '@/lib/currencies'
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  id?: string
  invoice_number: string
  client_name: string
  client_email: string | null
  due_date: string | null
  status: string
  paid_at?: string | null
  currency?: string | null
  tax_rate?: number | null
  tax_id?: string | null
  is_deposit?: boolean | null
  items: LineItem[]
  notes: string | null
  created_at: string
}

interface Owner {
  name: string | null
  email?: string | null
  logo_url: string | null
  accent_color: string | null
}

function isOverdue(inv: { status: string; due_date: string | null }) {
  if (inv.status === 'paid' || !inv.due_date) return false
  return new Date(inv.due_date) < new Date(new Date().toDateString())
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function InvoicePrint({
  invoice,
  owner,
  projectName,
}: {
  invoice: Invoice
  owner: Owner | null
  projectName?: string | null
}) {
  const currency = invoice.currency || 'USD'
  const subtotal = (invoice.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
  const taxRate = Number(invoice.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount

  const overdue = isOverdue(invoice)
  const isPaid = invoice.status === 'paid'

  const issueDateFormatted = formatDate(invoice.created_at) || 'Today'
  const dueDateFormatted = formatDate(invoice.due_date)
  const paidDateFormatted = formatDate(invoice.paid_at)

  // Dynamic invoice status resolver
  const normalizedStatus = invoice.status?.toLowerCase() || 'sent'
  let statusBadge = (
    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 print:text-slate-800">
      <span className="size-1.5 rounded-full bg-slate-400" />
      <span>PAYMENT DUE {dueDateFormatted ? `· DUE ${dueDateFormatted.toUpperCase()}` : ''}</span>
    </div>
  )

  if (isPaid) {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 print:text-emerald-800">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <span>PAID {paidDateFormatted ? `· ${paidDateFormatted.toUpperCase()}` : `· ${issueDateFormatted.toUpperCase()}`}</span>
      </div>
    )
  } else if (overdue) {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 print:text-rose-800">
        <span className="size-1.5 rounded-full bg-rose-500" />
        <span>OVERDUE {dueDateFormatted ? `· DUE ${dueDateFormatted.toUpperCase()}` : ''}</span>
      </div>
    )
  } else if (normalizedStatus === 'draft') {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-slate-600">
        <span className="size-1.5 rounded-full bg-slate-400" />
        <span>DRAFT · NOT ISSUED</span>
      </div>
    )
  } else if (normalizedStatus === 'viewed') {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-700">
        <span className="size-1.5 rounded-full bg-indigo-500" />
        <span>VIEWED BY CLIENT</span>
      </div>
    )
  } else if (normalizedStatus === 'partially_paid') {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 print:text-amber-800">
        <span className="size-1.5 rounded-full bg-amber-500" />
        <span>PARTIALLY PAID</span>
      </div>
    )
  } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
    statusBadge = (
      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 print:text-slate-500">
        <span className="size-1.5 rounded-full bg-slate-400" />
        <span>CANCELLED</span>
      </div>
    )
  }

  return (
    <>
      {/* ── Strict Print CSS Overrides ─────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 14mm 12mm 14mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px;
          }
          .print-hide {
            display: none !important;
          }
          .print-invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-invoice-sheet * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>

      {/* ── Outer Invoice Container (Quiet, modern document layout) ─────────── */}
      <div className="print-invoice-sheet relative bg-white dark:bg-[#0c0d12] rounded-2xl border border-slate-200/90 dark:border-white/10 p-8 sm:p-12 shadow-sm dark:shadow-xl transition-colors duration-200">

        {/* ── 1. HEADER: ISSUER & INVOICE DETAILS ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/10 print:border-slate-300">
          
          {/* Left: Issuer / Studio */}
          <div className="space-y-1.5">
            {owner?.logo_url && (
              <img
                src={owner.logo_url}
                alt={owner?.name || 'Studio Logo'}
                className="h-10 w-auto max-w-[130px] object-contain rounded-md mb-3"
              />
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-slate-950 dark:text-white tracking-tight print:text-slate-950">
              {owner?.name || 'Studio & Consulting'}
            </h1>
            {owner?.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono print:text-slate-600">
                {owner.email}
              </p>
            )}
            {invoice.tax_id && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono print:text-slate-500 pt-0.5">
                Tax ID: {invoice.tax_id}
              </p>
            )}
          </div>

          {/* Right: INVOICE Heading, Number & Dynamic Status */}
          <div className="text-left sm:text-right space-y-1.5">
            <div className="text-2xl sm:text-3xl font-light tracking-tight text-slate-950 dark:text-white uppercase font-sans print:text-slate-950">
              INVOICE
            </div>
            
            <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 print:text-slate-700">
              #{invoice.invoice_number}
            </div>

            <div className="pt-2 flex items-center sm:justify-end gap-2 flex-wrap">
              {statusBadge}
              {invoice.is_deposit && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 print:border-indigo-300">
                  Upfront Deposit
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ── 2. METADATA: BILLED TO & INVOICE DETAILS ─────────────────────── */}
        <div className="py-8 border-b border-slate-200 dark:border-white/10 print:border-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Left: BILLED TO */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold mb-3 print:text-slate-500">
                BILLED TO
              </div>
              <div className="text-base font-semibold text-slate-950 dark:text-white tracking-tight print:text-slate-950">
                {invoice.client_name}
              </div>
              {invoice.client_email && (
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono print:text-slate-600">
                  {invoice.client_email}
                </div>
              )}
              {projectName && (
                <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                  <span className="text-slate-400 dark:text-slate-500 font-normal print:text-slate-500">Project:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200 print:text-slate-800">{projectName}</span>
                </div>
              )}
            </div>

            {/* Right: INVOICE DETAILS */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold mb-3 print:text-slate-500">
                INVOICE DETAILS
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-baseline justify-between sm:justify-start sm:gap-10">
                  <span className="text-slate-400 dark:text-slate-500 font-light w-20 print:text-slate-500">Issued</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium print:text-slate-900">{issueDateFormatted}</span>
                </div>
                <div className="flex items-baseline justify-between sm:justify-start sm:gap-10">
                  <span className="text-slate-400 dark:text-slate-500 font-light w-20 print:text-slate-500">Due</span>
                  <span className={`font-mono font-medium ${overdue ? 'text-rose-600 dark:text-rose-400 print:text-rose-700' : 'text-slate-900 dark:text-white print:text-slate-900'}`}>
                    {dueDateFormatted || 'Upon Receipt'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between sm:justify-start sm:gap-10">
                  <span className="text-slate-400 dark:text-slate-500 font-light w-20 print:text-slate-500">Currency</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium print:text-slate-900">{currency}</span>
                </div>
                <div className="flex items-baseline justify-between sm:justify-start sm:gap-10">
                  <span className="text-slate-400 dark:text-slate-500 font-light w-20 print:text-slate-500">Payment</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium print:text-slate-900">Stripe / Bank</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. LINE ITEMS TABLE ──────────────────────────────────────────── */}
        <div className="py-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 print:border-slate-300">
                  <th className="pb-3 px-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-600">
                    DESCRIPTION
                  </th>
                  <th className="pb-3 px-1 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-600 w-20">
                    QTY
                  </th>
                  <th className="pb-3 px-1 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-600 w-28">
                    RATE
                  </th>
                  <th className="pb-3 px-1 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-600 w-32">
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] print:divide-slate-200">
                {(invoice.items ?? []).map((item, i) => (
                  <tr key={i} className="group">
                    <td className="py-4.5 px-1 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium print:text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-4.5 px-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono print:text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-4.5 px-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono print:text-slate-700">
                      {fmtCurrency(item.rate, currency)}
                    </td>
                    <td className="py-4.5 px-1 text-xs sm:text-sm font-semibold text-slate-950 dark:text-white text-right font-mono print:text-slate-950">
                      {fmtCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── 4. TOTALS SUMMARY ────────────────────────────────────────── */}
          <div className="mt-6 flex flex-col items-end border-t border-slate-200 dark:border-white/10 print:border-slate-300 pt-6">
            <div className="w-full sm:w-72 space-y-2.5">
              <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white print:text-slate-950">
                  {fmtCurrency(subtotal, currency)}
                </span>
              </div>

              {taxRate > 0 && (
                <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                  <span>Tax / VAT ({taxRate}%)</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white print:text-slate-950">
                    +{fmtCurrency(taxAmount, currency)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 print:border-slate-300 flex justify-between items-baseline">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white print:text-slate-950">
                  {isPaid ? 'Total Paid' : 'Total Due'}
                </span>
                <span className="font-mono font-bold text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight print:text-slate-950">
                  {fmtCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. PAYMENT INFORMATION & NOTES ───────────────────────────────── */}
        <div className="pt-6 pb-6 border-t border-slate-200 dark:border-white/10 print:border-slate-300 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-500">
            PAYMENT INFORMATION
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1 print:text-slate-700">
            {isPaid ? (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 print:text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Paid via Stripe {paidDateFormatted ? `· ${paidDateFormatted}` : ''}</span>
              </div>
            ) : overdue ? (
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 print:text-rose-800 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Payment is past due. Please settle online via card or bank wire.</span>
              </div>
            ) : (
              <p>
                Payable securely online via Stripe (Credit Card, Debit, Apple Pay) or direct bank transfer.
              </p>
            )}

            {invoice.notes && (
              <p className="pt-2 text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-sans text-xs print:text-slate-600">
                {invoice.notes}
              </p>
            )}
          </div>
        </div>

        {/* ── 6. DOCUMENT FOOTER ───────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/5 print:border-slate-200 text-[10px] font-mono text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 print:text-slate-500">
          <div>
            Invoice #{invoice.invoice_number} · Page 1 of 1
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <strong className="text-slate-600 dark:text-slate-400 font-bold print:text-slate-700">Frevio</strong>
          </div>
        </div>

      </div>
    </>
  )
}
