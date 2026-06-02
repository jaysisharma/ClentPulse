'use client'

interface LineItem { description: string; quantity: number; rate: number; amount: number }
interface Invoice {
  invoice_number: string
  client_name: string
  client_email: string | null
  due_date: string | null
  status: string
  items: LineItem[]
  notes: string | null
  created_at: string
}
interface Owner { name: string | null; logo_url: string | null; accent_color: string | null }

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent:  'bg-blue-50 text-blue-700',
  paid:  'bg-emerald-50 text-emerald-700',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function InvoicePrint({ invoice, owner }: { invoice: Invoice; owner: Owner | null }) {
  const total = (invoice.items ?? []).reduce((s, i) => s + (i.amount ?? 0), 0)
  const accent = owner?.accent_color ?? '#6366F1'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden print:border-0 print:rounded-none print:shadow-none">
      {/* Invoice header */}
      <div className="px-8 py-8 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            {owner?.logo_url ? (
              <img src={owner.logo_url} alt="Logo" className="h-10 w-auto object-contain mb-4" />
            ) : (
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: accent }}>
                {(owner?.name ?? 'F')[0].toUpperCase()}
              </div>
            )}
            <div className="font-semibold text-slate-900">{owner?.name ?? 'Freelancer'}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900 mb-1">INVOICE</div>
            <div className="text-slate-500 text-sm">{invoice.invoice_number}</div>
            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[invoice.status]}`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill to</div>
            <div className="font-semibold text-slate-900">{invoice.client_name}</div>
            {invoice.client_email && <div className="text-sm text-slate-500">{invoice.client_email}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Details</div>
            <div className="text-sm text-slate-600">
              <div>Issued {new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              {invoice.due_date && (
                <div>Due {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="px-8 py-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Description</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Qty</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Rate</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items ?? []).map((item, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-3 text-sm text-slate-700">{item.description}</td>
                <td className="py-3 text-sm text-slate-600 text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-slate-600 text-right">{fmt(item.rate)}</td>
                <td className="py-3 text-sm font-medium text-slate-900 text-right">{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="mt-4 flex justify-end">
          <div className="w-48">
            <div className="flex justify-between py-2 border-t-2 border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-slate-900 text-lg">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</div>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
    </div>
  )
}
