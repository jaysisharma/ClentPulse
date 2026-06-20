import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { ExpensesClient } from './expenses-client'

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
      <div className="animate-fade-in pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track costs to see your real take-home, not just revenue.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(totalSpent)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total spent</div>
            <div className="text-xs text-slate-400 mt-1">all time</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{fmt(spentThisMonth)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">This month</div>
            <div className="text-xs text-slate-400 mt-1">expenses logged</div>
          </div>
          <div className={`rounded-xl border p-5 ${netProfit >= 0 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40' : 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40'}`}>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{fmt(netProfit)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Net profit</div>
            <div className="text-xs text-slate-400 mt-1">paid revenue − expenses</div>
          </div>
        </div>

        <ExpensesClient expenses={expensesWithNames} projects={allProjects} />
      </div>
    </AppLayout>
  )
}
