import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export async function POST(request: Request) {
  const { invoiceId, reminder = false } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (!invoice.client_email) return NextResponse.json({ error: 'No client email on invoice' }, { status: 400 })

  const { data: owner } = await supabase
    .from('users')
    .select('name, accent_color, logo_url')
    .eq('id', user.id)
    .single()

  const accent = owner?.accent_color ?? '#6366F1'
  const total = (invoice.items ?? []).reduce((s: number, i: { amount: number }) => s + (i.amount ?? 0), 0)
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}`

  const itemRows = (invoice.items ?? [])
    .map((item: { description: string; quantity: number; rate: number; amount: number }) => `
      <tr style="border-bottom:1px solid #f1f5f9">
        <td style="padding:10px 0;font-size:14px;color:#334155">${item.description}</td>
        <td style="padding:10px 0;font-size:14px;color:#64748b;text-align:right">${item.quantity}</td>
        <td style="padding:10px 0;font-size:14px;color:#64748b;text-align:right">${fmt(item.rate)}</td>
        <td style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;text-align:right">${fmt(item.amount)}</td>
      </tr>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Inter',sans-serif;margin:0;padding:0;background:#f8fafc">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">

  <div style="background:${accent};padding:28px 32px">
    <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Invoice</div>
    <div style="font-size:22px;font-weight:700;color:white">${invoice.invoice_number}</div>
    <div style="font-size:14px;color:rgba(255,255,255,.8);margin-top:2px">from ${owner?.name ?? 'Your freelancer'}</div>
  </div>

  <div style="padding:32px">
    <p style="color:#475569;margin-top:0;font-size:15px">Hi ${invoice.client_name},</p>
    <p style="color:#475569;font-size:15px">${reminder ? 'This is a friendly reminder that the following invoice has not been paid yet.' : 'Please find your invoice details below.'}</p>

    <table style="width:100%;border-collapse:collapse;margin-top:20px">
      <thead>
        <tr style="border-bottom:2px solid #e2e8f0">
          <th style="text-align:left;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px">Description</th>
          <th style="text-align:right;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px">Qty</th>
          <th style="text-align:right;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px">Rate</th>
          <th style="text-align:right;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;padding-bottom:8px">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #1e293b;display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;font-size:15px;color:#0f172a">Total due</span>
      <span style="font-weight:700;font-size:20px;color:#0f172a">${fmt(total)}</span>
    </div>

    ${invoice.due_date ? `<p style="font-size:13px;color:#64748b;margin-top:12px">Due by <strong>${new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>` : ''}

    ${invoice.notes ? `<div style="background:#f8fafc;border-left:3px solid ${accent};padding:12px 16px;border-radius:4px;margin-top:16px;font-size:14px;color:#64748b">${invoice.notes}</div>` : ''}

    <div style="margin-top:28px;text-align:center">
      <a href="${invoiceUrl}" style="background:${accent};color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">
        View invoice →
      </a>
    </div>
  </div>

  <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8">
    Sent by ${owner?.name ?? 'your freelancer'} via Frevio
  </div>
</div>
</body>
</html>`

  const subject = reminder
    ? `Payment reminder: Invoice ${invoice.invoice_number} — ${fmt(total)} unpaid`
    : `Invoice ${invoice.invoice_number} — ${fmt(total)} due`

  const { error: sendErr } = await resend.emails.send({
    from: `${owner?.name ?? 'Frevio'} <invoices@frevio.cloud>`,
    to: [invoice.client_email],
    subject,
    html,
  })

  if (sendErr) return NextResponse.json({ error: sendErr.message }, { status: 500 })

  await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoiceId)

  return NextResponse.json({ success: true })
}
