import { describe, it, expect } from 'vitest'
import type { ChangeOrder } from '@/types'
import {
  billingSummary, changeOrderNeedsPayment, collectTodos, isMilestoneOverdue, scheduleStatus, tabFromHash,
  type PortalChecklistItem, type PortalInvoice, type PortalMilestone,
} from './portal-model'

function co(overrides: Partial<ChangeOrder>): ChangeOrder {
  return {
    id: 'co', project_id: 'p', user_id: 'u', title: 'Blog', amount: 1200, currency: 'USD',
    status: 'pending', requires_payment: true, created_at: '2026-10-01', ...overrides,
  }
}

const inv = (overrides: Partial<PortalInvoice>): PortalInvoice => ({ id: 'i', status: 'sent', total: 100, currency: 'USD', ...overrides })
const task = (overrides: Partial<PortalChecklistItem>): PortalChecklistItem => ({ id: 't', title: 'Send logo', assigned_to: 'client', done: false, done_at: null, ...overrides })
const NOW = new Date('2026-10-29T10:00:00')

describe('tabFromHash', () => {
  it('maps tab hashes and legacy anchors', () => {
    expect(tabFromHash('#billing')).toBe('billing')
    expect(tabFromHash('#files')).toBe('files')
    expect(tabFromHash('#checklist')).toBe('overview')
    expect(tabFromHash('')).toBeNull()
    expect(tabFromHash('#co-123')).toBeNull()
  })
})

describe('changeOrderNeedsPayment', () => {
  it('is true only for approved, paid-for changes with an amount', () => {
    expect(changeOrderNeedsPayment(co({ status: 'approved' }))).toBe(true)
    expect(changeOrderNeedsPayment(co({ status: 'pending' }))).toBe(false)
    expect(changeOrderNeedsPayment(co({ status: 'paid' }))).toBe(false)
    expect(changeOrderNeedsPayment(co({ status: 'approved', requires_payment: false }))).toBe(false)
    expect(changeOrderNeedsPayment(co({ status: 'approved', amount: 0 }))).toBe(false)
  })
})

describe('schedule', () => {
  const m = (overrides: Partial<PortalMilestone>): PortalMilestone => ({ id: 'm', title: 'Build', due_date: '2026-11-04', done: false, ...overrides })

  it('treats a milestone due today as not overdue', () => {
    expect(isMilestoneOverdue(m({ due_date: '2026-10-29' }), NOW)).toBe(false)
    expect(isMilestoneOverdue(m({ due_date: '2026-10-28' }), NOW)).toBe(true)
    expect(isMilestoneOverdue(m({ due_date: '2026-10-28', done: true }), NOW)).toBe(false)
  })

  it('derives the headline status', () => {
    expect(scheduleStatus('completed', [m({ due_date: '2026-01-01' })], NOW)).toBe('complete')
    expect(scheduleStatus('paused', [], NOW)).toBe('paused')
    expect(scheduleStatus('active', [m({ due_date: '2026-10-01' })], NOW)).toBe('late')
    expect(scheduleStatus('active', [m({})], NOW)).toBe('on_track')
  })
})

describe('collectTodos', () => {
  const base = {
    isDepositPending: false, depositInvoice: null, waitingOnClient: false,
    invoices: [] as PortalInvoice[], approvals: [] as any[], changeOrders: [] as ChangeOrder[], checklist: [] as PortalChecklistItem[],
  }

  it('is empty when nothing is outstanding', () => {
    expect(collectTodos(base).count).toBe(0)
  })

  it('counts every kind of action once', () => {
    const todos = collectTodos({
      ...base,
      waitingOnClient: true,
      invoices: [inv({ id: 'a' }), inv({ id: 'b', status: 'paid' })],
      approvals: [{ id: 'x', status: 'pending' }, { id: 'y', status: 'approved' }],
      changeOrders: [co({ id: '1' }), co({ id: '2', status: 'approved' }), co({ id: '3', status: 'declined' })],
      checklist: [task({ id: 't1' }), task({ id: 't2', done: true }), task({ id: 't3', assigned_to: 'freelancer' })],
    })
    expect(todos.unpaidInvoices.map(i => i.id)).toEqual(['a'])
    expect(todos.pendingApprovals.map(a => a.id)).toEqual(['x'])
    expect(todos.pendingChangeOrders.map(c => c.id)).toEqual(['1'])
    expect(todos.payableChangeOrders.map(c => c.id)).toEqual(['2'])
    expect(todos.openClientTasks.map(t => t.id)).toEqual(['t1'])
    expect(todos.count).toBe(6)
  })

  it('shows a pending deposit once, not also as an invoice', () => {
    const deposit = inv({ id: 'dep', is_deposit: true })
    const todos = collectTodos({ ...base, isDepositPending: true, depositInvoice: deposit, invoices: [deposit] })
    expect(todos.depositInvoice?.id).toBe('dep')
    expect(todos.unpaidInvoices).toEqual([])
    expect(todos.count).toBe(1)
  })
})

describe('billingSummary', () => {
  it('totals invoices and billable change orders in one currency', () => {
    const summary = billingSummary(
      [inv({ id: 'a', total: 2400, status: 'paid' }), inv({ id: 'b', total: 2400 }), inv({ id: 'c', total: 999, status: 'draft' })],
      [co({ status: 'approved', amount: 1200 }), co({ status: 'paid', amount: 300 }), co({ status: 'pending', amount: 5000 })],
    )
    expect(summary).toEqual({ currency: 'USD', outstanding: 3600, paid: 2700 })
  })

  it('declines to total mixed currencies', () => {
    const summary = billingSummary([inv({ currency: 'USD' }), inv({ id: 'e', currency: 'EUR' })], [])
    expect(summary.currency).toBeNull()
  })
})
