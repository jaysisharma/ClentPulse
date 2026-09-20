import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InvoicePrint } from '@/app/invoices/[id]/invoice-print'
import { PayNowButton } from './pay-button'
import { CheckCircle2 } from 'lucide-react'
import { PoweredByReferral } from '@/components/ui/powered-by-referral'
import { isPaidPlan } from '@/lib/plans'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!invoice) {
    return {
      title: 'Invoice | Frevio',
      robots: { index: false, follow: false }
    }
  }

  const { data: owner } = await supabase
    .from('users')
    .select('name')
    .eq('id', invoice.user_id)
    .single()

  return {
    title: `Invoice from ${owner?.name ?? 'Studio'} | Frevio`,
    description: `Pay invoice securely online via Stripe.`,
    robots: {
      index: false,
      follow: false
    }
  }
}

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ paid?: string }>
}) {
  const { id } = await params
  const { paid } = await searchParams
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const { data: owner } = await supabase
    .from('users')
    .select('id, name, username, plan, logo_url, accent_color')
    .eq('id', invoice.user_id)
    .single()

  const accent = owner?.accent_color ?? '#6366F1'
  const subtotal = (invoice.items ?? []).reduce(
    (s: number, i: { amount: number }) => s + (i.amount ?? 0),
    0
  )
  const taxRate = Number(invoice.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount
  const currency = invoice.currency || 'USD'

  // Re-fetch status in case webhook already marked it paid
  const isPaid = invoice.status === 'paid'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] py-12 px-4 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative">
        <InvoicePrint invoice={invoice} owner={owner} />

        {/* Paid confirmation — shown after returning from Stripe */}
        {paid === '1' || isPaid ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-5 flex items-center gap-3.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Payment Received & Confirmed</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">An official settlement receipt has been sent to your email.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pay Now button */}
            <PayNowButton invoiceId={invoice.id} total={total} currency={currency} accentColor={accent} />

            {/* Contact note */}
            <div className="mt-4 rounded-2xl p-4 text-center border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Questions regarding this invoice? Contact {owner?.name ?? 'your studio lead'} directly.
              </p>
            </div>
          </>
        )}

        {/* Powered by Frevio with referral attribution */}
        <PoweredByReferral
          refHandle={owner?.username || owner?.id}
          isWhiteLabel={isPaidPlan(owner?.plan)}
        />
      </div>
    </div>
  )
}
