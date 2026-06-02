import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { InvoiceList } from './invoice-list'

function formatCurrency(items: { amount: number }[]) {
  const total = items.reduce((s, i) => s + (i.amount ?? 0), 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
            <p className="text-slate-500 text-sm mt-1">Create and track client invoices.</p>
          </div>
          <Link href="/invoices/new">
            <Button><Plus className="w-4 h-4" />New invoice</Button>
          </Link>
        </div>

        {!invoices?.length ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No invoices yet</h3>
            <p className="text-slate-500 text-sm mb-5">Create your first invoice to start billing clients.</p>
            <Link href="/invoices/new"><Button><Plus className="w-4 h-4" />Create invoice</Button></Link>
          </div>
        ) : (
          <>
            {/* Summary strip — always reflects full data, not filtered view */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total invoiced', value: formatCurrency((invoices ?? []).flatMap(i => i.items ?? [])) },
                { label: 'Paid',           value: formatCurrency((invoices ?? []).filter(i => i.status === 'paid').flatMap(i => i.items ?? [])) },
                { label: 'Unpaid',         value: formatCurrency((invoices ?? []).filter(i => i.status === 'sent').flatMap(i => i.items ?? [])) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <InvoiceList invoices={invoices} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
