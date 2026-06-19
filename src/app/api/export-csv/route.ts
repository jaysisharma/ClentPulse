import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ].join('\n')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'earnings' | 'time'

  if (type !== 'earnings' && type !== 'time') {
    return NextResponse.json({ error: 'type must be earnings or time' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let csv = ''
  let filename = ''

  if (type === 'earnings') {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('invoice_number, client_name, status, items, due_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const rows = (invoices ?? []).map(inv => ({
      invoice_number: inv.invoice_number,
      client_name:    inv.client_name,
      status:         inv.status,
      total:          (inv.items ?? []).reduce((s: number, i: { amount: number }) => s + (i.amount ?? 0), 0).toFixed(2),
      due_date:       inv.due_date ?? '',
      created_at:     inv.created_at.slice(0, 10),
    }))
    csv = toCSV(rows)
    filename = 'frevio-earnings.csv'
  } else {
    const { data: entries } = await supabase
      .from('time_entries')
      .select('description, hours, date, projects(project_name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    const rows = (entries ?? []).map(e => {
      const proj = Array.isArray(e.projects) ? e.projects[0] : e.projects
      return {
        date:         e.date,
        project:      proj?.project_name ?? '',
        description:  e.description,
        hours:        e.hours,
      }
    })
    csv = toCSV(rows)
    filename = 'frevio-time.csv'
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
