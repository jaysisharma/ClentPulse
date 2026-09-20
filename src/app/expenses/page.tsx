import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { ExpensesClient } from './expenses-client'
import { Receipt, Calendar, Wallet } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function monthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: expenses, error: expErr }, { data: projects, error: projErr }, { data: paidInvoices, error: invErr }] = await Promise.all([
    supabase.from('expenses').select('id, description, amount, category, date, project_id').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('projects').select('id, project_name').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('items, status, created_at').eq('user_id', user.id).eq('status', 'paid'),
  ])

  // Fail honestly rather than rendering a misleading empty/zeroed state.
  if (expErr || projErr || invErr) throw new Error(`Failed to load expenses: ${(expErr ?? projErr ?? invErr)!.message}`)

  // `amount` is a numeric(10,2) column, which PostgREST returns as a STRING.
  // Coerce to a real number here so the sums below add instead of concatenate.
  type RawExpense = { id: string; description: string; amount: string | number; category: string | null; date: string; project_id: string | null }
  const allExpenses = ((expenses ?? []) as RawExpense[]).map(e => ({ ...e, amount: Number(e.amount) || 0 }))
  const allProjects = (projects ?? []) as { id: string; project_name: string }[]
  const projectName = new Map(allProjects.map(p => [p.id, p.project_name]))

  const ms = monthStart()
  const totalSpent     = allExpenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const spentThisMonth = allExpenses.filter(e => e.date >= ms).reduce((s, e) => s + (e.amount ?? 0), 0)

  const revenuePaid = (paidInvoices ?? []).flatMap(i => i.items ?? []).reduce((s: number, x: { amount: number }) => s + (x.amount ?? 0), 0)
  const netProfit = revenuePaid - totalSpent

  const expensesWithNames = allExpenses.map(e => ({ ...e, projectName: e.project_id ? projectName.get(e.project_id) : undefined }))

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 animate-fade-in space-y-8 pb-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Studio Expenses
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Expenses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Track production costs, tools, and contractor fees to measure real take-home net profit.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total spent</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{fmt(totalSpent)}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">all time disbursements</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">This month</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="font-mono font-light text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{fmt(spentThisMonth)}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">current billing cycle</div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/90 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Net profit</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className={`font-mono font-light text-2xl sm:text-3xl tracking-tight ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {fmt(netProfit)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1.5">paid revenue − total expenses</div>
            </div>
          </div>

          <ExpensesClient expenses={expensesWithNames} projects={allProjects} />
        </div>
      </DarkShell>
    </AppLayout>
  )
}
