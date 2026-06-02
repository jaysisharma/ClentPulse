import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { TrendingUp, Download } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function getMonthLabel(y: number, m: number) {
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, items, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const paid   = (invoices ?? []).filter(i => i.status === 'paid')
  const sent   = (invoices ?? []).filter(i => i.status === 'sent')
  const all    = invoices ?? []

  const total  = (inv: typeof paid) => inv.flatMap(i => i.items ?? []).reduce((s: number, x: { amount: number }) => s + (x.amount ?? 0), 0)

  // Build last-12-months buckets
  const now = new Date()
  const months: { label: string; amount: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear(), m = d.getMonth() + 1
    const bucket = paid.filter(inv => {
      const d2 = new Date(inv.created_at)
      return d2.getFullYear() === y && d2.getMonth() + 1 === m
    })
    months.push({ label: getMonthLabel(y, m), amount: total(bucket) })
  }

  const maxAmt = Math.max(...months.map(m => m.amount), 1)
  const thisMonth = months[months.length - 1].amount
  const lastMonth = months[months.length - 2].amount
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
            <p className="text-slate-500 text-sm mt-1">Revenue from paid invoices.</p>
          </div>
          <a
            href="/api/export-csv?type=earnings"
            download
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Download className="w-3.5 h-3.5" />Export CSV
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total earned', value: fmt(total(paid)), sub: 'all time' },
            { label: 'This month', value: fmt(thisMonth), sub: growth !== 0 ? `${growth > 0 ? '+' : ''}${growth.toFixed(0)}% vs last month` : 'no change' },
            { label: 'Unpaid', value: fmt(total(sent)), sub: `${sent.length} invoice${sent.length !== 1 ? 's' : ''}` },
            { label: 'Total invoiced', value: fmt(total(all)), sub: `${all.length} invoice${all.length !== 1 ? 's' : ''}` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{label}</div>
              <div className="text-xs text-slate-400 mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Monthly revenue (last 12 months)</span>
          </div>

          {total(paid) === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">
              No paid invoices yet. Mark invoices as paid to see your earnings.
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {months.map(({ label, amount }) => {
                const heightPct = (amount / maxAmt) * 100
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end" style={{ height: '160px' }}>
                      {amount > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap">
                            {fmt(amount)}
                          </span>
                        </div>
                      )}
                      <div
                        className="w-full rounded-t-md transition-all bg-indigo-500 group-hover:bg-indigo-600"
                        style={{ height: `${heightPct}%`, minHeight: amount > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent paid invoices */}
        {paid.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent payments</h2>
            <div className="space-y-2">
              {paid.slice(-5).reverse().map((inv, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-3">
                  <div className="text-sm text-slate-700">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div className="font-semibold text-emerald-600">{fmt(total([inv]))}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
