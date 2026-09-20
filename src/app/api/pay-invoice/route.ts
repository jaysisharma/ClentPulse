import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as const })

export async function POST(request: Request) {
  const { invoiceId } = await request.json()
  if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })

  const supabase = await createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, items, status, user_id, currency, tax_rate, is_deposit, project_id')
    .eq('id', invoiceId)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  const { data: owner } = await supabase
    .from('users')
    .select('name')
    .eq('id', invoice.user_id)
    .single()

  const subtotal = (invoice.items ?? []).reduce((s: number, i: { amount: number }) => s + (i.amount ?? 0), 0)
  const taxRate = Number(invoice.tax_rate ?? 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = subtotal + taxAmount
  const totalCents = Math.round(total * 100)

  if (totalCents < 50) return NextResponse.json({ error: 'Invoice total too small to process' }, { status: 400 })

  const currencyCode = (invoice.currency || 'usd').toLowerCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: invoice.client_email ?? undefined,
    line_items: [{
      price_data: {
        currency: currencyCode,
        unit_amount: totalCents,
        product_data: {
          name: `${invoice.is_deposit ? 'Upfront Deposit: ' : ''}Invoice ${invoice.invoice_number}`,
          description: `Payment to ${owner?.name ?? 'Freelancer'}${taxRate > 0 ? ` (incl. ${taxRate}% Tax/VAT)` : ''}`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      invoice_id: invoice.id,
      project_id: invoice.project_id || '',
      is_deposit: invoice.is_deposit ? 'true' : 'false',
      type: 'invoice_payment',
    },
    success_url: `${appUrl}/invoice/${invoice.id}?paid=1`,
    cancel_url: `${appUrl}/invoice/${invoice.id}`,
  })

  return NextResponse.json({ url: session.url })
}
