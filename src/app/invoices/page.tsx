import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import Link from 'next/link'
import { Plus, FileText, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react'
import { InvoiceList } from './invoice-list'

function formatCurrency(items: { amount: number }[]) {
  const total = items.reduce((s, i) => s + (i.amount ?? 0), 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)
}

function OveradsInvoiceSummaryCard({
  label,
  value,
  icon: Icon,
  caption,
  tone = 'default',
}: {
  label: string
  value: string
  icon: React.ElementType
  caption?: string
  tone?: 'default' | 'success' | 'warning'
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 p-5 ring-1 ring-slate-950/5 dark:ring-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 shadow-xs dark:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`mt-3 text-2xl sm:text-3xl font-light font-mono tracking-tight tabular-nums ${
          tone === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
          tone === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
        }`}>
          {value}
        </div>
      </div>
      {caption && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {caption}
        </div>
      )}
    </div>
  )
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load invoices: ${error.message}`)

  const allInvoices = invoices ?? []
  const totalBilled = formatCurrency(allInvoices.flatMap(i => i.items ?? []))
  const paidAmount  = formatCurrency(allInvoices.filter(i => i.status === 'paid').flatMap(i => i.items ?? []))
  const unpaidAmount = formatCurrency(allInvoices.filter(i => i.status === 'sent').flatMap(i => i.items ?? []))

  return (
    <AppLayout>
      <DarkShell>
        <div className="relative z-10 space-y-7 pb-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
                Invoices
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-2">
                <span>Create, track, and collect Stripe payments directly from clients.</span>
              </p>
            </div>

            <Link href="/invoices/new">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-4 py-2 text-xs font-semibold dark:hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New invoice
              </button>
            </Link>
          </div>

          {!allInvoices.length ? (
            /* Empty state */
            <div className="rounded-3xl bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 py-16 px-6 flex flex-col items-center text-center shadow-md dark:shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight mt-5">No invoices created yet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                Bill clients professionally with itemized invoices, downloadable PDFs, and one-click Stripe payments.
              </p>
              <Link href="/invoices/new" className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-xs font-semibold dark:hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create first invoice
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <OveradsInvoiceSummaryCard
                  label="Total Invoiced"
                  value={totalBilled}
                  icon={DollarSign}
                  caption={`${allInvoices.length} total issued`}
                />
                <OveradsInvoiceSummaryCard
                  label="Collected (Paid)"
                  value={paidAmount}
                  icon={CheckCircle2}
                  caption="Cleared via Stripe"
                  tone="success"
                />
                <OveradsInvoiceSummaryCard
                  label="Awaiting Payment"
                  value={unpaidAmount}
                  icon={AlertCircle}
                  caption="Sent to clients"
                  tone="warning"
                />
              </div>

              {/* Invoices List with Segmented Switcher & Search */}
              <InvoiceList invoices={allInvoices} />
            </>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}
