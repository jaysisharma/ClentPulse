'use client'

import { fmtCurrency } from '@/lib/currencies'
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, CreditCard, Building2, Calendar, FileText } from 'lucide-react'

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

  const accent = owner?.accent_color ?? '#6366F1'
  const overdue = isOverdue(invoice)
  const isPaid = invoice.status === 'paid'

  const issueDateFormatted = formatDate(invoice.created_at) || 'Today'
  const dueDateFormatted = formatDate(invoice.due_date)
  const paidDateFormatted = formatDate(invoice.paid_at)

  return (
    <>
      {/* ── Strict Print CSS Overrides ─────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
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
            border: 1px solid #e2e8f0 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 24px !important;
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

      {/* ── Outer Invoice Container (Screen Card & Print Sheet) ─────────────── */}
      <div className="print-invoice-sheet relative bg-white dark:bg-[#0c0d12] rounded-3xl border border-slate-200/90 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden shadow-xl dark:shadow-2xl transition-colors duration-200">
        
        {/* Top Brand Color Indicator Beam */}
        <div
          className="h-2 w-full transition-all"
          style={{ backgroundColor: accent }}
        />

        {/* ── 1. HEADER: BRAND & INVOICE IDENTIFIER ────────────────────────── */}
        <div className="p-7 sm:p-10 border-b border-slate-100 dark:border-white/[0.08] print:border-slate-200 print:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Left: Studio Branding & Issuer Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {owner?.logo_url ? (
                  <img
                    src={owner.logo_url}
                    alt={owner?.name || 'Studio Logo'}
                    className="h-12 w-auto max-w-[140px] object-contain rounded-lg"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md tracking-tight font-mono select-none"
                    style={{ backgroundColor: accent }}
                  >
                    {(owner?.name || 'F')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight leading-snug print:text-slate-950">
                    {owner?.name || 'Studio & Consulting'}
                  </h1>
                  {owner?.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono print:text-slate-600">
                      {owner.email}
                    </p>
                  )}
                </div>
              </div>

              {invoice.tax_id && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-mono text-slate-600 dark:text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-slate-700">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Tax / VAT ID: <strong className="font-semibold">{invoice.tax_id}</strong></span>
                </div>
              )}
            </div>

            {/* Right: Invoice Label, Number & Status Badge */}
            <div className="text-left sm:text-right space-y-2">
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-slate-950 dark:text-white uppercase font-sans print:text-slate-950">
                INVOICE
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-900 dark:text-white print:bg-slate-50 print:border-slate-300 print:text-slate-900">
                <FileText className="w-3.5 h-3.5 text-indigo-500 print:text-indigo-700" />
                <span>#{invoice.invoice_number}</span>
              </div>

              {/* Status Pills */}
              <div className="flex items-center sm:justify-end gap-2 pt-1 flex-wrap">
                {invoice.is_deposit && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 print:bg-indigo-50 print:text-indigo-700 print:border-indigo-300">
                    ⚡ Upfront Deposit
                  </span>
                )}

                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-emerald-700" />
                    <span>PAID {paidDateFormatted ? `· ${paidDateFormatted}` : ''}</span>
                  </span>
                ) : overdue ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 print:bg-rose-50 print:text-rose-800 print:border-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>OVERDUE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                    <Clock className="w-3.5 h-3.5 text-blue-600 print:text-slate-700" />
                    <span>PAYMENT DUE</span>
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── 2. METADATA CARDS: CLIENT & DATES ─────────────────────────────── */}
        <div className="p-7 sm:p-10 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.08] print:bg-slate-50/80 print:border-slate-200 print:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
            
            {/* Left Card: Client Information */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131622] p-5 space-y-2 shadow-2xs dark:shadow-none print:bg-white print:border-slate-200">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-500">
                Billed To
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight print:text-slate-950">
                {invoice.client_name}
              </div>
              {invoice.client_email && (
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono print:text-slate-600">
                  {invoice.client_email}
                </div>
              )}
              {projectName && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 print:border-slate-100">
                  <span className="font-medium text-slate-700 dark:text-slate-300 print:text-slate-800">Project:</span> {projectName}
                </div>
              )}
            </div>

            {/* Right Card: Dates & Terms */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#131622] p-5 space-y-2.5 shadow-2xs dark:shadow-none print:bg-white print:border-slate-200">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 font-semibold print:text-slate-500">
                Billing Terms
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-light print:text-slate-500">
                    Date Issued
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono print:text-slate-900">
                    {issueDateFormatted}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-light print:text-slate-500">
                    Due Date
                  </span>
                  <span className={`font-semibold font-mono ${overdue ? 'text-rose-600 print:text-rose-700' : 'text-slate-900 dark:text-white print:text-slate-900'}`}>
                    {dueDateFormatted || 'Upon Receipt'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-light print:text-slate-500">
                    Currency
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono print:text-slate-900">
                    {currency}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-light print:text-slate-500">
                    Payment Method
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-slate-900">
                    Stripe / Bank Wire
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 3. LINE ITEMS TABLE ──────────────────────────────────────────── */}
        <div className="p-7 sm:p-10 print:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-white/10 print:border-slate-300">
                  <th className="py-3 px-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-semibold print:text-slate-600">
                    Item & Description
                  </th>
                  <th className="py-3 px-2 text-right text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-semibold print:text-slate-600 w-20">
                    Qty / Hrs
                  </th>
                  <th className="py-3 px-2 text-right text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-semibold print:text-slate-600 w-28">
                    Rate
                  </th>
                  <th className="py-3 px-2 text-right text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-semibold print:text-slate-600 w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] print:divide-slate-200">
                {(invoice.items ?? []).map((item, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors print:hover:bg-transparent"
                  >
                    <td className="py-4 px-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium print:text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-4 px-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono print:text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right font-mono print:text-slate-700">
                      {fmtCurrency(item.rate, currency)}
                    </td>
                    <td className="py-4 px-2 text-xs sm:text-sm font-semibold text-slate-950 dark:text-white text-right font-mono print:text-slate-950">
                      {fmtCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── 4. FINANCIAL TOTALS SUMMARY ─────────────────────────────────── */}
          <div className="mt-8 flex flex-col sm:flex-row items-start justify-between gap-8 pt-6 border-t border-slate-200 dark:border-white/10 print:border-slate-300">
            
            {/* Left Note / Remittance Notice */}
            <div className="w-full sm:max-w-xs space-y-2 text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs print:text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Official Billing Statement</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Thank you for your business. Payments can be settled securely online via card, ACH, or designated bank wire.
              </p>
            </div>

            {/* Right Totals Box */}
            <div className="w-full sm:w-80 rounded-2xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 p-5 space-y-3 print:bg-slate-50 print:border-slate-300">
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white print:text-slate-950">
                  {fmtCurrency(subtotal, currency)}
                </span>
              </div>

              {taxRate > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 print:text-slate-600">
                  <span>Tax / VAT ({taxRate}%)</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white print:text-slate-950">
                    +{fmtCurrency(taxAmount, currency)}
                  </span>
                </div>
              )}

              {/* Total Due Highlight Pill */}
              <div className="pt-3 border-t-2 border-slate-200 dark:border-white/10 print:border-slate-300 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white print:text-slate-950">
                  Total Due
                </span>
                <span className="font-mono font-bold text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight print:text-slate-950">
                  {fmtCurrency(total, currency)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 5. NOTES & PAYMENT TERMS ─────────────────────────────────────── */}
        {invoice.notes && (
          <div className="px-7 sm:px-10 py-5 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.08] print:bg-slate-50 print:border-slate-200 print:px-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 font-semibold mb-1 print:text-slate-600">
              Payment Terms & Wire Notes
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono print:text-slate-800">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* ── 6. DOCUMENT FOOTER ───────────────────────────────────────────── */}
        <div className="px-7 sm:px-10 py-4 bg-slate-100/60 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 print:border-slate-200 print:text-slate-500 print:px-6 print:py-3">
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>Powered by</span>
            <strong className="text-slate-600 dark:text-slate-400 font-bold print:text-slate-700">Frevio</strong>
            <span>· Verified Freelance Invoice</span>
          </div>

          <div className="font-mono text-[10px]">
            Page 1 of 1 · Invoice #{invoice.invoice_number}
          </div>
        </div>

      </div>
    </>
  )
}
