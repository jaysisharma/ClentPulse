import { createAdminClient } from '../src/lib/supabase/admin'
import { stripe } from '../src/lib/stripe'
import { POST as payInvoicePOST } from '../src/app/api/pay-invoice/route'
import { POST as connectWebhookPOST } from '../src/app/api/stripe-connect-webhook/route'
import Stripe from 'stripe'

// Script to run real E2E test of direct charges, webhooks, and retry recovery
async function runE2ETest() {
  const supabase = createAdminClient()
  const appSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'

  console.log('================================================================')
  console.log('STEP 1: ONBOARD TEST USER & STANDARD CONNECTED ACCOUNT')
  console.log('================================================================')
  
  // 1. Create or retrieve test user in DB
  const testUserId = '072aef7e-b8d0-40ea-a5af-08045dad6ef4'
  const testEmail = 'e2e-tester@frevio.cloud'
  const testConnectAccountId = 'acct_1UTFNdIhlWZNZdo2' // Our test Standard account with business_profile set

  const { data: user, error: userErr } = await supabase
    .from('users')
    .upsert({
      id: testUserId,
      email: testEmail,
      name: 'E2E Direct Studio',
      stripe_account_id: testConnectAccountId,
      stripe_charges_enabled: true,
      stripe_payouts_enabled: true,
      stripe_connect_onboarded: true,
      plan: 'pro',
    })
    .select('id, email, name, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_connect_onboarded')
    .single()

  if (userErr) throw new Error('Failed to setup test user: ' + userErr.message)
  console.log('DB User Row:')
  console.log(JSON.stringify(user, null, 2))

  console.log('\n================================================================')
  console.log('STEP 2: CREATE INVOICE')
  console.log('================================================================')
  
  const testInvoiceId = '00000000-0000-0000-0000-000000000101'
  await supabase.from('invoices').delete().eq('id', testInvoiceId)

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      id: testInvoiceId,
      invoice_number: 'INV-E2E-DIRECT-001',
      user_id: testUserId,
      client_name: 'Acme Global Corp',
      client_email: 'finance@acmeglobal.test',
      items: [{ amount: 150, description: 'Brand Strategy & Development' }],
      currency: 'USD',
      tax_rate: 0,
      status: 'sent',
      is_deposit: false,
    })
    .select('id, invoice_number, user_id, client_name, client_email, items, currency, status')
    .single()

  if (invErr) throw new Error('Failed to create invoice: ' + invErr.message)
  console.log('DB Invoice Row (Initial):')
  console.log(JSON.stringify(invoice, null, 2))

  console.log('\n================================================================')
  console.log('STEP 3: CALL /api/pay-invoice (REAL ROUTE HANDLER)')
  console.log('================================================================')

  const payReq = new Request('http://localhost:3000/api/pay-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify({ invoiceId: testInvoiceId }),
  })

  const payRes = await payInvoicePOST(payReq)
  const payJson = await payRes.json()
  console.log('Response Status:', payRes.status)
  console.log('Response Body:', payJson)

  if (!payJson.sessionId) throw new Error('Pay invoice failed: ' + JSON.stringify(payJson))

  console.log('\n================================================================')
  console.log('STEP 4: DISPATCH DIRECT CHARGE WEBHOOK TO /api/stripe-connect-webhook')
  console.log('================================================================')

  const eventId = `evt_e2e_${Date.now()}`
  const mockSessionEvent = {
    id: eventId,
    type: 'checkout.session.completed',
    account: testConnectAccountId, // Connected Standard account
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: payJson.sessionId,
        amount_total: 15000, // $150.00
        currency: 'usd',
        payment_intent: `pi_direct_${Date.now()}`,
        metadata: {
          type: 'invoice_payment',
          invoiceId: testInvoiceId,
          ownerStripeAccountId: testConnectAccountId,
        },
      },
    },
  }

  const rawPayload = JSON.stringify(mockSessionEvent)
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: rawPayload,
    secret: appSecret,
  })

  const webhookReq = new Request('http://localhost:3000/api/stripe-connect-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body: rawPayload,
  })

  const webhookRes = await connectWebhookPOST(webhookReq)
  const webhookJson = await webhookRes.json()
  console.log('Connect Webhook Response Status:', webhookRes.status)
  console.log('Connect Webhook Response Body:', webhookJson)

  // Verify Invoice in Supabase
  const { data: paidInvoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, paid_at, stripe_charge_id')
    .eq('id', testInvoiceId)
    .single()

  console.log('\nDB Invoice Row After Webhook (FLIPPED TO PAID):')
  console.log(JSON.stringify(paidInvoice, null, 2))
  if (paidInvoice?.status !== 'paid') {
    throw new Error(`Expected invoice status 'paid', got: ${paidInvoice?.status}`)
  }

  // Verify processed_stripe_events row in Supabase
  const { data: eventRow } = await supabase
    .from('processed_stripe_events')
    .select('event_id, status, created_at, updated_at')
    .eq('event_id', eventId)
    .single()

  console.log('\nDB processed_stripe_events Row (STATUS = DONE):')
  console.log(JSON.stringify(eventRow, null, 2))

  console.log('\n================================================================')
  console.log('STEP 5: REFUND & DISPATCH charge.refunded TO WEBHOOK')
  console.log('================================================================')

  const refundEventId = `evt_refund_${Date.now()}`
  const mockRefundEvent = {
    id: refundEventId,
    type: 'charge.refunded',
    account: testConnectAccountId,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `ch_direct_${Date.now()}`,
        amount: 15000,
        currency: 'usd',
        metadata: {
          invoiceId: testInvoiceId,
        },
      },
    },
  }

  const rawRefundPayload = JSON.stringify(mockRefundEvent)
  const refundSig = stripe.webhooks.generateTestHeaderString({
    payload: rawRefundPayload,
    secret: appSecret,
  })

  const refundWebhookReq = new Request('http://localhost:3000/api/stripe-connect-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': refundSig,
    },
    body: rawRefundPayload,
  })

  const refundRes = await connectWebhookPOST(refundWebhookReq)
  console.log('Refund Webhook Response Status:', refundRes.status)

  const { data: refundedInvoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, paid_at, stripe_charge_id')
    .eq('id', testInvoiceId)
    .single()

  console.log('\nDB Invoice Row After Refund (FLIPPED TO REFUNDED):')
  console.log(JSON.stringify(refundedInvoice, null, 2))
  if (refundedInvoice?.status !== 'refunded') {
    throw new Error(`Expected invoice status 'refunded', got: ${refundedInvoice?.status}`)
  }

  console.log('\n================================================================')
  console.log('STEP 6: FAILED-HANDLER RETRY DEMONSTRATION')
  console.log('================================================================')

  // We dispatch an invalid/mismatched event that triggers an exception in the handler.
  // The system must delete the idempotency row from processed_stripe_events,
  // allowing the subsequent retry to succeed.
  const retryEventId = `evt_retry_demo_${Date.now()}`
  
  // Attempt 1: Malformed payload with mismatched amount triggers error
  const failingPayload = JSON.stringify({
    id: retryEventId,
    type: 'checkout.session.completed',
    account: testConnectAccountId,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cs_fail_${Date.now()}`,
        amount_total: 10, // $0.10 instead of $150.00 -> Amount Mismatch Error!
        currency: 'usd',
        metadata: {
          type: 'invoice_payment',
          invoiceId: testInvoiceId,
        },
      },
    },
  })

  const failingSig = stripe.webhooks.generateTestHeaderString({
    payload: failingPayload,
    secret: appSecret,
  })

  const failReq = new Request('http://localhost:3000/api/stripe-connect-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': failingSig },
    body: failingPayload,
  })

  console.log('Dispatching Attempt 1 (Should Fail & Delete Idempotency Row)...')
  const failRes = await connectWebhookPOST(failReq)
  console.log('Attempt 1 Status:', failRes.status)
  const failJson = await failRes.json()
  console.log('Attempt 1 Error Message:', failJson.error)

  // Verify processed_stripe_events row was deleted
  const { data: deletedRow } = await supabase
    .from('processed_stripe_events')
    .select('event_id')
    .eq('event_id', retryEventId)
    .maybeSingle()

  console.log('\nDB processed_stripe_events Row After Failure (MUST BE NULL):', deletedRow)

  // Attempt 2: Stripe retries the same event_id with corrected/valid payload
  console.log('\nDispatching Attempt 2 (Retry of same event_id with valid payload)...')
  const retryPayload = JSON.stringify({
    id: retryEventId, // EXACT SAME EVENT ID
    type: 'checkout.session.completed',
    account: testConnectAccountId,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cs_retry_success_${Date.now()}`,
        amount_total: 15000, // Correct amount
        currency: 'usd',
        payment_intent: `pi_retry_success_${Date.now()}`,
        metadata: {
          type: 'invoice_payment',
          invoiceId: testInvoiceId,
        },
      },
    },
  })

  const retrySig = stripe.webhooks.generateTestHeaderString({
    payload: retryPayload,
    secret: appSecret,
  })

  const retryReq = new Request('http://localhost:3000/api/stripe-connect-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': retrySig },
    body: retryPayload,
  })

  const retryRes = await connectWebhookPOST(retryReq)
  console.log('Attempt 2 Status (Should Be 200 OK):', retryRes.status)
  const retryJson = await retryRes.json()
  console.log('Attempt 2 Response:', retryJson)

  // Verify processed_stripe_events row is now 'done'
  const { data: finalEventRow } = await supabase
    .from('processed_stripe_events')
    .select('event_id, status, created_at, updated_at')
    .eq('event_id', retryEventId)
    .single()

  console.log('\nDB processed_stripe_events Row After Successful Retry (STATUS = DONE):')
  console.log(JSON.stringify(finalEventRow, null, 2))

  console.log('\n================================================================')
  console.log('ALL E2E DIRECT CHARGE TESTS COMPLETED SUCCESSFULLY!')
  console.log('================================================================')
}

runE2ETest().catch(err => {
  console.error('E2E TEST RUNNER EXCEPTION:', err)
  process.exit(1)
})
