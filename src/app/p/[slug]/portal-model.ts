import type { ChangeOrder } from '@/types'

// Pure derivations for the client portal. Kept free of React so the rules for
// "what needs the client" and "are we on track" are unit-testable.

export type PortalTab = 'overview' | 'review' | 'updates' | 'files' | 'billing'

export const PORTAL_TABS: { key: PortalTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'review', label: 'Review' },
  { key: 'updates', label: 'Updates' },
  { key: 'files', label: 'Files' },
  { key: 'billing', label: 'Billing' },
]

/** Maps a URL hash to a tab. Older anchors (#files, #checklist) keep working. */
export function tabFromHash(hash: string): PortalTab | null {
  const key = hash.replace(/^#/, '').toLowerCase()
  if (key === 'checklist') return 'overview'
  return PORTAL_TABS.some(t => t.key === key) ? (key as PortalTab) : null
}

export interface PortalInvoice {
  id: string
  invoice_number?: string | null
  amount?: number | null
  total?: number | null
  currency?: string | null
  status: string
  due_date?: string | null
  paid_at?: string | null
  is_deposit?: boolean | null
  is_retainer?: boolean | null
  retainer_period?: string | null
}

export interface PortalMilestone {
  id: string
  title: string
  due_date: string | null
  done: boolean
}

export interface PortalChecklistItem {
  id: string
  title: string
  assigned_to: 'freelancer' | 'client'
  done: boolean
  done_at: string | null
}

export function invoiceTotal(inv: PortalInvoice): number {
  return Number(inv.total || inv.amount || 0)
}

/** An approved scope change the client still has to pay for. */
export function changeOrderNeedsPayment(co: ChangeOrder): boolean {
  return co.status === 'approved' && co.requires_payment && Number(co.amount) > 0
}

function startOfToday(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

/** Milestone due dates are plain dates; compare them at local noon to dodge TZ shifts. */
export function isMilestoneOverdue(m: PortalMilestone, now = new Date()): boolean {
  if (m.done || !m.due_date) return false
  return new Date(m.due_date + 'T12:00:00').getTime() < startOfToday(now)
}

export type ScheduleStatus = 'complete' | 'paused' | 'late' | 'on_track'

export function scheduleStatus(
  projectStatus: string | null | undefined,
  milestones: PortalMilestone[],
  now = new Date(),
): ScheduleStatus {
  if (projectStatus === 'completed') return 'complete'
  if (projectStatus === 'paused') return 'paused'
  return milestones.some(m => isMilestoneOverdue(m, now)) ? 'late' : 'on_track'
}

export const SCHEDULE_LABELS: Record<ScheduleStatus, string> = {
  complete: 'Complete',
  paused: 'Paused',
  late: 'Running late',
  on_track: 'On track',
}

export interface PortalTodos {
  depositPending: boolean
  depositInvoice: PortalInvoice | null
  waitingOnClient: boolean
  unpaidInvoices: PortalInvoice[]
  payableChangeOrders: ChangeOrder[]
  pendingApprovals: any[]
  pendingChangeOrders: ChangeOrder[]
  openClientTasks: PortalChecklistItem[]
  count: number
}

export function collectTodos(input: {
  isDepositPending: boolean
  depositInvoice: PortalInvoice | null
  waitingOnClient: boolean
  invoices: PortalInvoice[]
  approvals: any[]
  changeOrders: ChangeOrder[]
  checklist: PortalChecklistItem[]
}): PortalTodos {
  const depositInvoice = input.isDepositPending ? input.depositInvoice : null
  // The deposit gets its own row, so leave it out of the invoice rows.
  const unpaidInvoices = input.invoices.filter(
    i => i.status === 'sent' && !(input.isDepositPending && i.id === input.depositInvoice?.id)
  )
  const payableChangeOrders = input.changeOrders.filter(changeOrderNeedsPayment)
  const pendingApprovals = input.approvals.filter(a => a.status === 'pending')
  const pendingChangeOrders = input.changeOrders.filter(c => c.status === 'pending')
  const openClientTasks = input.checklist.filter(i => i.assigned_to === 'client' && !i.done)

  const count =
    (input.isDepositPending ? 1 : 0) +
    (input.waitingOnClient ? 1 : 0) +
    unpaidInvoices.length +
    payableChangeOrders.length +
    pendingApprovals.length +
    pendingChangeOrders.length +
    openClientTasks.length

  return {
    depositPending: input.isDepositPending,
    depositInvoice,
    waitingOnClient: input.waitingOnClient,
    unpaidInvoices,
    payableChangeOrders,
    pendingApprovals,
    pendingChangeOrders,
    openClientTasks,
    count,
  }
}

export interface BillingSummary {
  /** Set only when every amount shares one currency, so the totals are meaningful. */
  currency: string | null
  outstanding: number
  paid: number
}

export function billingSummary(invoices: PortalInvoice[], changeOrders: ChangeOrder[]): BillingSummary {
  const billable = changeOrders.filter(c => c.requires_payment && Number(c.amount) > 0 && (c.status === 'approved' || c.status === 'paid'))
  const currencies = new Set([
    ...invoices.map(i => (i.currency || 'USD').toUpperCase()),
    ...billable.map(c => (c.currency || 'USD').toUpperCase()),
  ])
  if (currencies.size > 1) return { currency: null, outstanding: 0, paid: 0 }

  let outstanding = 0
  let paid = 0
  for (const inv of invoices) {
    if (inv.status === 'paid') paid += invoiceTotal(inv)
    else if (inv.status === 'sent') outstanding += invoiceTotal(inv)
  }
  for (const co of billable) {
    if (co.status === 'paid') paid += Number(co.amount)
    else outstanding += Number(co.amount)
  }
  return { currency: [...currencies][0] ?? 'USD', outstanding, paid }
}
