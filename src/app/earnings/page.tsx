import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { StatCard } from '@/components/ui/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Download, DollarSign, TrendingUp, Clock, Wallet } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function monthStart(offset = 0) {
  // Build the 1st directly so the Date constructor normalizes the month — using
  // setMonth() on today's date overflows on month-end days (e.g. shifting Mar 31
  // back a month yields "Feb 31" → Mar 3, landing in the wrong month).
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - offset, 1)
}

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: invoices, error: invErr }, { data: expenses, error: expErr }] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, invoice_number, status, items, client_name, created_at, paid_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', user.id),
  ])

  if (invErr || expErr) throw new Error(`Failed to load earnings: ${(invErr ?? expErr)!.message}`)

  type Invoice = { id: string; invoice_number: string; status: string; items: { amount: number }[]; client_name: string; created_at: string; paid_at: string | null }
  const allInvoices = (invoices ?? []) as Invoice[]

  const sumItems = (inv: { items: { amount: number }[] }[]) =>
    inv.flatMap(i => i.items ?? []).reduce((s, x) => s + (x.amount ?? 0), 0)

  const paid = allInvoices.filter(i => i.status === 'paid')
  const sent = allInvoices.filter(i => i.status === 'sent')

  const totalEarned   = sumItems(paid)
  const unpaid        = sumItems(sent)
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const netProfit     = totalEarned - totalExpenses

  // This month vs last month (by payment/created date)
  const thisStart = monthStart(0)
  const lastStart = monthStart(1)
  const paidDate  = (i: Invoice) => new Date(i.paid_at ?? i.created_at)
  const thisMonth = sumItems(paid.filter(i => paidDate(i) >= thisStart))
  const lastMonth = sumItems(paid.filter(i => paidDate(i) >= lastStart && paidDate(i) < thisStart))
  const growthDiff = thisMonth - lastMonth
  const growthPct  = Math.round((Math.abs(growthDiff) / Math.max(lastMonth, 1)) * 100)

  // Chart data — reuse the dashboard's revenue-vs-expenses chart
  const paidPoints = paid.map(i => ({
    date: paidDate(i).toISOString().split('T')[0],
    amount: sumItems([i]),
  }))
  const expensePoints = (expenses ?? []).map(e => ({
    date: new Date(e.date).toISOString().split('T')[0],
    amount: Number(e.amount) || 0,
  }))

  const recentPayments = [...paid].sort((a, b) => paidDate(b).getTime() - paidDate(a).getTime()).slice(0, 5)

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Earnings</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">What you&apos;ve made, spent, and kept.</p>
            </div>
            <a
              href="/api/export-csv?type=earnings"
              download
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 px-3 py-2 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />Export CSV
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total earned" value={fmt(totalEarned)} icon={DollarSign} caption="all time" />
            <StatCard
              label="This month"
              value={fmt(thisMonth)}
              icon={TrendingUp}
              trend={
                thisMonth > 0 || lastMonth > 0
                  ? { dir: growthDiff > 0 ? 'up' : growthDiff < 0 ? 'down' : 'flat', label: `${growthPct}%`, goodWhen: 'up' }
                  : undefined
              }
              caption="vs last month"
            />
            <StatCard label="Unpaid" value={fmt(unpaid)} icon={Clock} caption={`${sent.length} invoice${sent.length !== 1 ? 's' : ''}`} />
            <StatCard
              label="Net profit"
              value={fmt(netProfit)}
              icon={Wallet}
              tone={netProfit < 0 ? 'danger' : 'default'}
              caption={
                <span>
                  {fmt(totalExpenses)} expenses ·{' '}
                  <a href="/expenses" className="text-indigo-600 hover:underline font-medium">manage</a>
                </span>
              }
            />
          </div>

          {/* Revenue vs expenses chart (shared with the dashboard) */}
          <RevenueChart paid={paidPoints} expenses={expensePoints} />

          {/* Recent payments */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent payments</h2>
            {recentPayments.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 py-10 px-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No paid invoices yet.</p>
                <p className="text-xs text-slate-400 mt-1">Mark invoices as paid to see your earnings here.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
                {recentPayments.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{inv.client_name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {inv.invoice_number ? `#${inv.invoice_number} · ` : ''}
                        {paidDate(inv).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="font-bold text-emerald-600 tabular-nums flex-shrink-0">{fmt(sumItems([inv]))}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
