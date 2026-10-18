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

  // SAFETY GUARD (Phase 2):
  // Direct online card payments for client invoices are temporarily disabled because
  // Frevio does not yet route funds via verified Stripe Connect destination charges.
  // Creating a platform checkout session would hold client funds in the platform's
  // Stripe account without an automated payout mechanism, posing critical regulatory
  // and money-transmission risks.
  return NextResponse.json({
    error: 'Direct online card processing for client invoices is temporarily disabled pending studio direct payout (Stripe Connect) integration. Please settle directly with the freelancer/studio via bank transfer or their preferred payment method.',
    code: 'PAYMENTS_UNAVAILABLE',
    disabled: true,
  }, { status: 503 })
}
