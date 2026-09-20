import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { InvoiceActions } from './invoice-actions'
import { InvoicePrint } from './invoice-print'

import { DarkShell } from '@/components/layout/dark-shell'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single()
  if (!invoice) notFound()

  const { data: owner } = await supabase.from('users').select('name, logo_url, accent_color').eq('id', user.id).single()

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Link 
              href="/invoices" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to invoices
            </Link>
            <InvoiceActions invoice={{ id: invoice.id, status: invoice.status, client_email: invoice.client_email }} />
          </div>

          <InvoicePrint invoice={invoice} owner={owner} />
        </div>
      </DarkShell>
    </AppLayout>
  )
}

