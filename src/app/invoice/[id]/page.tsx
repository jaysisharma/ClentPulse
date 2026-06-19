import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InvoicePrint } from '@/app/invoices/[id]/invoice-print'
import { PayNowButton } from './pay-button'
import { CheckCircle2 } from 'lucide-react'
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
    title: `Invoice from ${owner?.name ?? 'Freelancer'} | Frevio`,
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
    .select('name, logo_url, accent_color')
    .eq('id', invoice.user_id)
    .single()

  const accent = owner?.accent_color ?? '#6366F1'
  const total = (invoice.items ?? []).reduce(
    (s: number, i: { amount: number }) => s + (i.amount ?? 0),
    0
  )

  // Re-fetch status in case webhook already marked it paid
  const isPaid = invoice.status === 'paid'

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <InvoicePrint invoice={invoice} owner={owner} />

        {/* Paid confirmation — shown after returning from Stripe */}
        {paid === '1' || isPaid ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Payment received — thank you!</p>
              <p className="text-xs text-emerald-600 mt-0.5">A receipt has been sent to your email.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pay Now button */}
            <PayNowButton invoiceId={invoice.id} total={total} accentColor={accent} />

            {/* Contact note */}
            <div
              className="mt-4 rounded-xl p-4 text-center"
              style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}25` }}
            >
              <p className="text-xs font-medium" style={{ color: accent }}>
                Questions about this invoice? Contact {owner?.name ?? 'your freelancer'} directly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
