import { describe, it, expect } from 'vitest'
import type { ClientWorkspace, WorkspaceProject, WorkspaceInvoice } from '@/lib/client-workspace'
import { buildBilling, buildDashboard, buildProjectList, buildUpdates, projectStatus, rankActions } from './dashboard-model'

const NOW = new Date('2026-10-29T10:00:00')
const vanguard = { id: 'org-v', name: 'Vanguard', logoUrl: null, accent: '#4F46E5', contactEmail: 'alex@vanguard.test' }

function project(overrides: Partial<WorkspaceProject> = {}): WorkspaceProject {
  return {
    id: 'p1', name: 'Website Redesign', clientName: 'Northwind', slug: 'website', status: 'active', createdAt: '2026-09-01',
    budget: null, waitingOnClient: false, waitingReason: null, depositRequired: 0, depositPaid: false,
    hideApprovals: false, studio: vanguard,
    milestones: [], approvals: [], changeOrders: [], checklist: [], updates: [], documents: [], contracts: [], invoices: [],
    hasTestimonial: false,
    ...overrides,
  }
}

function invoice(overrides: Partial<WorkspaceInvoice> = {}): WorkspaceInvoice {
  return { id: 'i1', number: '003', status: 'sent', currency: 'USD', total: 2250, dueDate: '2026-11-04', paidAt: null, isDeposit: false, projectId: 'p1', ...overrides }
}

const ws = (projects: WorkspaceProject[]): ClientWorkspace => ({ projects, looseInvoices: [] })

describe('buildDashboard — what needs the client', () => {
  it('puts work-blocking asks first, then due dates, then reviews, then tasks', () => {
    const d = buildDashboard(ws([project({
      waitingOnClient: true,
      waitingReason: 'Send your DNS settings',
      invoices: [invoice({ id: 'late', dueDate: '2026-11-04' }), invoice({ id: 'soon', dueDate: '2026-11-01' })],
      approvals: [{ id: 'a1', title: 'Homepage', status: 'pending', created_at: '2026-10-27' }],
      checklist: [{ id: 't1', title: 'Send menu photos', assigned_to: 'client', done: false, done_at: null }],
    })]), NOW)

    expect(d.items.map(i => i.key)).toEqual(['waiting-p1', 'invoice-soon', 'invoice-late', 'approval-a1', 'task-t1'])
    expect(d.items[0]).toMatchObject({ blocking: true, title: 'Send your DNS settings', href: '/p/website#files' })
  })

  it('shows a pending deposit once, as a blocking payment, not again as an invoice', () => {
    const d = buildDashboard(ws([project({
      depositRequired: 1800,
      invoices: [invoice({ id: 'dep', isDeposit: true, total: 1800, currency: 'EUR', dueDate: null })],
    })]), NOW)
    expect(d.items).toHaveLength(1)
    expect(d.items[0]).toMatchObject({ kind: 'deposit', blocking: true, href: '/invoice/dep' })
  })

  it('asks for payment on approved extras and a decision on pending ones', () => {
    const d = buildDashboard(ws([project({
      changeOrders: [
        { id: 'c1', title: 'Blog', status: 'approved', requires_payment: true, amount: 1200, currency: 'USD' },
        { id: 'c2', title: 'Shop', status: 'pending', requires_payment: true, amount: 900, currency: 'USD', created_at: '2026-10-20' },
        { id: 'c3', title: 'Old', status: 'declined', requires_payment: true, amount: 50, currency: 'USD' },
      ],
    })]), NOW)
    expect(d.items.map(i => i.kind).sort()).toEqual(['change_order', 'extra_payment'])
  })

  it('still asks for payment on finished projects, but nothing else', () => {
    const d = buildDashboard(ws([
      project({
        id: 'done', status: 'completed', waitingOnClient: true, invoices: [invoice()],
        approvals: [{ id: 'a1', title: 'Old', status: 'pending', created_at: null }],
        checklist: [{ id: 't1', title: 'Old task', assigned_to: 'client', done: false, done_at: null }],
      }),
    ]), NOW)
    expect(d.items.map(i => i.kind)).toEqual(['invoice'])
    expect(d.finished.map(p => p.id)).toEqual(['done'])
  })

  it('only lists sent documents and unsigned contracts', () => {
    const d = buildDashboard(ws([project({
      documents: [
        { id: 'd1', type: 'agreement', title: 'Service agreement', status: 'sent', amount: null, created_at: '2026-10-28' },
        { id: 'd2', type: 'proposal', title: 'Old proposal', status: 'accepted', amount: null, created_at: '2026-10-01' },
      ],
      contracts: [{ id: 'k1', title: 'NDA', signed_at: '2026-10-02' }],
    })]), NOW)
    expect(d.items.map(i => i.key)).toEqual(['doc-d1'])
    expect(d.items[0].href).toBe('/doc/d1')
  })
})

describe('projectStatus', () => {
  const m = (title: string, due_date: string | null, done = false) => ({ id: title, title, due_date, done })

  it('reads as a sentence the client can act on', () => {
    expect(projectStatus(project({ milestones: [m('Design', '2026-10-01', true), m('Build', '2026-11-18')] }), NOW))
      .toBe('On track for Nov 18 · next: Build')
    expect(projectStatus(project({ milestones: [m('Design', '2026-10-24')] }), NOW))
      .toBe('Running behind · Design was due Oct 24')
    expect(projectStatus(project({ depositRequired: 500, documents: [{ id: 'd', type: 'agreement', title: 'A', status: 'sent', amount: null, created_at: null }] }), NOW))
      .toBe('Starts once you sign and pay the deposit')
    expect(projectStatus(project({ status: 'paused' }), NOW)).toBe('Paused')
    expect(projectStatus(project({ updates: [{ id: 'u', sent_at: '2026-10-27T09:00:00Z', bullets: [], note: null }] }), NOW))
      .toBe('In progress · last update Oct 27')
  })
})

describe('budgets', () => {
  it('totals paid and outstanding per project in its currency', () => {
    const d = buildDashboard(ws([project({
      budget: 13500,
      invoices: [invoice({ id: 'a', status: 'paid', total: 6750 }), invoice({ id: 'b', total: 2250 })],
      changeOrders: [{ id: 'c', title: 'Blog', status: 'approved', requires_payment: true, amount: 1200, currency: 'USD' }],
    })]), NOW)
    expect(d.budgets).toEqual([{
      id: 'p1', name: 'Website Redesign', studioName: 'Vanguard', currency: 'USD',
      agreed: 13500, extras: 1200, paid: 6750, outstanding: 3450,
      // 13,500 agreed + 1,200 extra − 10,200 invoiced or due = 4,500 still to be billed
      notBilled: 4500,
    }])
  })
})

describe('rankActions', () => {
  it('keeps the original order for ties', () => {
    const item = (key: string) => ({ key, kind: 'approval', blocking: false, dueDate: null, since: null } as any)
    expect(rankActions([item('a'), item('b')]).map(i => i.key)).toEqual(['a', 'b'])
  })
})

describe('buildBilling', () => {
  const harbor = { id: 'org-h', name: 'Harbor', logoUrl: null, accent: '#0F766E', contactEmail: null }

  it('groups what to pay by studio and keeps currencies apart', () => {
    const b = buildBilling(ws([
      project({
        invoices: [invoice({ id: 'late', dueDate: '2026-10-01' }), invoice({ id: 'later', dueDate: '2026-11-30', total: 100 })],
        changeOrders: [{ id: 'c', title: 'Blog', status: 'approved', requires_payment: true, amount: 1200, currency: 'usd' }],
      }),
      project({ id: 'p2', studio: harbor, invoices: [invoice({ id: 'eur', currency: 'EUR', total: 1800, projectId: 'p2' })] }),
    ]), NOW)

    expect(b.toPay.map(g => g.studio.name)).toEqual(['Vanguard', 'Harbor'])
    expect(b.toPay[0].rows[0]).toMatchObject({ key: 'invoice-late', overdue: true, due: 'Overdue since Oct 1' })
    expect(b.toPay[0].totals).toEqual([{ currency: 'USD', amount: 3550 }])
    expect(b.toPayTotals).toEqual([{ currency: 'EUR', amount: 1800 }, { currency: 'USD', amount: 3550 }])
  })

  it('lists receipts newest first and totals only this year', () => {
    const b = buildBilling(ws([project({
      invoices: [
        invoice({ id: 'old', status: 'paid', total: 500, paidAt: '2025-12-20' }),
        invoice({ id: 'new', status: 'paid', total: 700, paidAt: '2026-10-20' }),
      ],
      changeOrders: [{ id: 'c', title: 'Blog', status: 'paid', requires_payment: true, amount: 300, currency: 'USD', paid_at: '2026-10-25' }],
    })]), NOW)
    expect(b.paid.map(r => r.key)).toEqual(['extra-c', 'invoice-new', 'invoice-old'])
    expect(b.paidThisYear).toEqual([{ currency: 'USD', amount: 1000 }])
    expect(b.year).toBe(2026)
  })
})

describe('buildProjectList', () => {
  it('splits by state and puts projects that need the client first', () => {
    const list = buildProjectList(ws([
      project({ id: 'quiet', name: 'Quiet' }),
      project({ id: 'busy', name: 'Busy', invoices: [invoice({ projectId: 'busy' })] }),
      project({ id: 'held', status: 'paused' }),
      project({ id: 'done', status: 'completed', hasTestimonial: true }),
    ]), NOW)
    expect(list.active.map(p => p.id)).toEqual(['busy', 'quiet'])
    expect(list.active[0].needsYou).toBe(1)
    expect(list.paused.map(p => p.id)).toEqual(['held'])
    expect(list.finished[0]).toMatchObject({ id: 'done', hasTestimonial: true })
  })
})

describe('buildUpdates', () => {
  it('merges every project’s updates, newest first', () => {
    const updates = buildUpdates(ws([
      project({ updates: [{ id: 'a', sent_at: '2026-10-20T10:00:00Z', bullets: ['x', ''], note: null }] }),
      project({ id: 'p2', name: 'App', updates: [{ id: 'b', sent_at: '2026-10-27T10:00:00Z', bullets: null, note: 'Hi' }] }),
    ]))
    expect(updates.map(u => u.id)).toEqual(['b', 'a'])
    expect(updates[1].bullets).toEqual(['x'])
  })
})
