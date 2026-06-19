import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Weekly "needs attention" digest. Triggered by Vercel Cron (see vercel.json).
// Emails each freelancer a summary of overdue updates, pending approvals,
// unsigned contracts, and unpaid invoices — so nothing slips when they're
// not logged in. Protected by CRON_SECRET.

export const dynamic = 'force-dynamic'

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const url = new URL(request.url)
  return url.searchParams.get('secret') === secret
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }

  const supabase = createAdminClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const now = new Date()

  const [{ data: users }, { data: projects }, { data: invoices }] = await Promise.all([
    supabase.from('users').select('id, email, name, accent_color'),
    supabase.from('projects')
      .select('id, user_id, project_name, status, created_at, updates(sent_at), approvals(status), contracts(signed_at)'),
    supabase.from('invoices').select('user_id, status, items, due_date'),
  ])

  type Proj = {
    id: string; user_id: string; project_name: string; status: string; created_at: string
    updates: { sent_at: string | null }[]; approvals: { status: string }[]; contracts: { signed_at: string | null }[]
  }
  type Inv = { user_id: string; status: string; items: { amount: number }[] | null; due_date: string | null }

  const allProjects = (projects ?? []) as Proj[]
  const allInvoices = (invoices ?? []) as Inv[]

  let sent = 0

  for (const user of users ?? []) {
    if (!user.email) continue
    const mine = allProjects.filter(p => p.user_id === user.id)
    const myInvoices = allInvoices.filter(i => i.user_id === user.id)

    const overdueProjects = mine.filter(p => {
      if (p.status !== 'active') return false
      const sentUpdates = p.updates.filter(u => u.sent_at)
      if (!sentUpdates.length) return new Date(p.created_at) < sevenDaysAgo
      const latest = sentUpdates.reduce((a, b) => (new Date(b.sent_at!) > new Date(a.sent_at!) ? b : a))
      return new Date(latest.sent_at!) < sevenDaysAgo
    })
    const pendingApprovals = mine.flatMap(p => p.approvals.filter(a => a.status === 'pending'))
    const unsignedContracts = mine.flatMap(p => p.contracts.filter(c => !c.signed_at))
    const unpaidInvoices = myInvoices.filter(i => i.status === 'sent')
    const outstanding = unpaidInvoices.flatMap(i => i.items ?? []).reduce((s, x) => s + (x.amount ?? 0), 0)
    const overdueInvoices = unpaidInvoices.filter(i => i.due_date && new Date(i.due_date) < now).length

    const total = overdueProjects.length + pendingApprovals.length + unsignedContracts.length + unpaidInvoices.length
    if (total === 0) continue

    const accent = user.accent_color ?? '#6366F1'
    const rows: string[] = []
    if (overdueProjects.length)
      rows.push(row('Projects with no update in 7+ days', overdueProjects.length, overdueProjects.map(p => p.project_name)))
    if (pendingApprovals.length)
      rows.push(row('Approvals awaiting client response', pendingApprovals.length))
    if (unsignedContracts.length)
      rows.push(row('Contracts not yet signed', unsignedContracts.length))
    if (unpaidInvoices.length)
      rows.push(row(`Unpaid invoices (${fmt(outstanding)} outstanding${overdueInvoices ? `, ${overdueInvoices} overdue` : ''})`, unpaidInvoices.length))

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,'Inter',sans-serif;margin:0;padding:0;background:#f8fafc">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
  <div style="background:${accent};padding:24px 32px">
    <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Your week ahead</div>
    <div style="font-size:20px;font-weight:700;color:white">${total} item${total !== 1 ? 's' : ''} need your attention</div>
  </div>
  <div style="padding:24px 32px">
    <p style="color:#475569;margin-top:0;font-size:15px">Hi ${user.name ?? 'there'}, here's what's waiting in Frevio:</p>
    <div style="margin:20px 0">${rows.join('')}</div>
    <div style="text-align:center;margin-top:8px">
      <a href="${appUrl}/dashboard" style="background:${accent};color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">Open dashboard →</a>
    </div>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:12px;color:#94a3b8">Frevio · Weekly digest</div>
</div></body></html>`

    try {
      await resend.emails.send({
        from: 'Frevio <digest@frevio.cloud>',
        to: [user.email],
        subject: `${total} thing${total !== 1 ? 's' : ''} need your attention this week`,
        html,
      })
      sent++
    } catch (err) {
      console.error('weekly-digest send failed for', user.id, err)
    }
  }

  return NextResponse.json({ ok: true, sent })
}

function row(label: string, count: number, names: string[] = []) {
  const detail = names.length ? `<div style="font-size:12px;color:#94a3b8;margin-top:2px">${names.slice(0, 4).join(', ')}${names.length > 4 ? `, +${names.length - 4} more` : ''}</div>` : ''
  return `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid #f1f5f9">
    <div style="font-size:14px;color:#334155;font-weight:500">${label}${detail}</div>
    <div style="font-size:14px;color:#0f172a;font-weight:700;margin-left:16px">${count}</div>
  </div>`
}
