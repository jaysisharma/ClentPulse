import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { fmtCurrency } from '@/lib/currencies'
import { Download, TrendingUp, DollarSign, Clock, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface InvoiceLineItem {
  description?: string
  quantity?: number
  rate?: number
  amount?: number
  unit_price?: number
}

interface InvoiceRecord {
  id: string
  user_id: string
  invoice_number?: string | null
  client_name?: string | null
  status: string
  total?: number | null
  amount?: number | null
  tax_rate?: number | null
  currency?: string | null
  is_deposit?: boolean | null
  items?: InvoiceLineItem[] | null
  paid_at?: string | null
  created_at: string
  updated_at?: string | null
}

function getInvoiceAmount(inv: InvoiceRecord): number {
  if (typeof inv.total === 'number' && inv.total > 0) return inv.total
  if (typeof inv.amount === 'number' && inv.amount > 0) return inv.amount
  
  const items = Array.isArray(inv.items) ? inv.items : []
  const subtotal = items.reduce((s: number, it: InvoiceLineItem) => {
    if (typeof it.amount === 'number') return s + it.amount
    const qty = Number(it.quantity || 1)
    const rate = Number(it.rate || it.unit_price || 0)
    return s + (qty * rate)
  }, 0)

  const taxRate = Number(inv.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  return subtotal + taxAmount
}

function sumInvoices(invList: InvoiceRecord[]): number {
  return invList.reduce((sum, inv) => sum + getInvoiceAmount(inv), 0)
}

function paidDate(inv: InvoiceRecord): Date {
  const raw = inv.paid_at || inv.created_at
  const d = new Date(raw)
  return isNaN(d.getTime()) ? new Date() : d
}

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: invoices, error: invError }, { data: expenses, error: expError }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false }),
  ])

  if (invError) {
    console.error('[Earnings] Error loading invoices:', invError)
  }
  if (expError) {
    console.error('[Earnings] Error loading expenses:', expError)
  }

  const allInvoices = (invoices ?? []) as InvoiceRecord[]
  const allExpenses = expenses ?? []

  // Detect studio primary currency from invoices (fallback to USD)
  const primaryCurrency = allInvoices.find(i => i.currency)?.currency || 'USD'

  function fmt(n: number, currency = primaryCurrency) {
    return fmtCurrency(n, currency)
  }

  const paid = allInvoices.filter(i => i.status === 'paid')
  const sent = allInvoices.filter(i => i.status === 'sent')

  const totalEarned = sumInvoices(paid)
  const unpaid = sumInvoices(sent)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthPaid = paid.filter(i => paidDate(i) >= thisMonthStart)
  const lastMonthPaid = paid.filter(i => {
    const d = paidDate(i)
    return d >= lastMonthStart && d < thisMonthStart
  })

  const thisMonth = sumInvoices(thisMonthPaid)
  const lastMonth = sumInvoices(lastMonthPaid)

  const growthDiff = thisMonth - lastMonth
  const growthPct = lastMonth > 0
    ? Math.round(Math.abs(growthDiff) / lastMonth * 100)
    : thisMonth > 0 ? 100 : 0

  const totalExpenses = allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const netProfit = totalEarned - totalExpenses

  const paidPoints = paid.map(i => ({
    date: paidDate(i).toISOString().slice(0, 10),
    amount: getInvoiceAmount(i),
  }))

  const expensePoints = allExpenses.map(e => ({
    date: e.date,
    amount: Number(e.amount || 0),
  }))

  const recentPayments = [...paid]
    .sort((a, b) => paidDate(b).getTime() - paidDate(a).getTime())
    .slice(0, 8)

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Financial Overview
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Earnings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                What you&apos;ve made, spent, and kept across all client engagements.
              </p>
            </div>
            <a
              href="/api/export-csv?type=earnings"
              download
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all w-fit shadow-xs dark:shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-4 sm:p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total earned</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {fmt(totalEarned)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">all time collected</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-4 sm:p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">This month</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {fmt(thisMonth)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5 flex items-center gap-1.5">
                {thisMonth > 0 || lastMonth > 0 ? (
                  <span className={`inline-flex items-center font-mono ${growthDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {growthDiff >= 0 ? '+' : '−'}{growthPct}%
                  </span>
                ) : null}
                <span>vs last month</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-4 sm:p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unpaid</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                {fmt(unpaid)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">{sent.length} awaiting payment</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-4 sm:p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Net profit</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className={`font-mono font-light text-2xl sm:text-3xl tracking-tight ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {fmt(netProfit)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5 flex items-center gap-1.5">
                <span>{fmt(totalExpenses)} expenses</span>
                <span>·</span>
                <a href="/expenses" className="text-slate-900 dark:text-white hover:underline font-medium">manage</a>
              </div>
            </div>
          </div>

          {/* Revenue vs expenses chart */}
          <RevenueChart paid={paidPoints} expenses={expensePoints} />

          {/* Recent settlements */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Recent Settlements
              </span>
            </div>
            {recentPayments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 py-12 px-6 text-center ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-light">No paid invoices yet.</p>
                <p className="text-xs text-slate-500 mt-1">Mark invoices as paid to see your settlements recorded here.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none">
                {recentPayments.map(inv => {
                  const invAmt = getInvoiceAmount(inv)
                  const invCurr = inv.currency || primaryCurrency
                  return (
                    <div key={inv.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {inv.client_name || 'Client'}
                          </p>
                          {inv.currency && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {inv.currency}
                            </span>
                          )}
                          {inv.is_deposit && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              Deposit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                          {inv.invoice_number ? `#${inv.invoice_number} · ` : ''}
                          {paidDate(inv).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums flex-shrink-0">
                        +{fmtCurrency(invAmt, invCurr)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
