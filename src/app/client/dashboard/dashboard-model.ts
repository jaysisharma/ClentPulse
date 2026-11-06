import type { ChangeOrder } from '@/types'
import { fmtCurrency } from '@/lib/currencies'
import type { ClientWorkspace, WorkspaceProject, WorkspaceStudio } from '@/lib/client-workspace'
import { billingSummary, changeOrderNeedsPayment, isMilestoneOverdue } from '@/app/p/[slug]/portal-model'

// Pure rules for the client dashboard: what needs the client, in what order, and
// how each project is going — in plain language. Shares its core rules with the
// project portal (portal-model) so the two pages never disagree.

export type ActionKind =
  | 'waiting' | 'deposit' | 'invoice' | 'extra_payment'
  | 'approval' | 'change_order' | 'document' | 'contract' | 'task'

export interface ActionItem {
  key: string
  kind: ActionKind
  title: string
  /** Short context for the list row, e.g. the studio or project. */
  context: string
  /** Right-hand detail in the list: an amount and/or a date. */
  meta: string | null
  /** Why it matters, shown on the focus card. */
  reason: string
  /** True when the studio can't continue until the client acts. */
  blocking: boolean
  dueDate: string | null
  since: string | null
  href: string
  actionLabel: string
  projectName: string
  studio: WorkspaceStudio
}

export interface ProjectLine {
  id: string
  name: string
  slug: string
  studio: WorkspaceStudio
  status: string
  needsYou: number
}

export interface BudgetLine {
  id: string
  name: string
  studioName: string
  currency: string
  agreed: number | null
  /** Approved extras (change orders) on top of the agreed budget. */
  extras: number
  paid: number
  outstanding: number
  /** Agreed work not invoiced yet: agreed + extras − paid − outstanding (never negative). */
  notBilled: number
}

export interface Dashboard {
  items: ActionItem[]
  active: ProjectLine[]
  finished: (ProjectLine & { hasTestimonial: boolean })[]
  budgets: BudgetLine[]
  studioCount: number
}

function shortDate(d: string) {
  return new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dayValue(d: string) {
  return new Date(d.length === 10 ? d + 'T12:00:00' : d).getTime()
}

function isPast(d: string, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return dayValue(d) < today
}

function money(value: number, currency: string) {
  return fmtCurrency(value, currency || 'USD')
}

function depositInvoiceFor(p: WorkspaceProject) {
  return p.invoices.find(i => i.isDeposit && i.status === 'sent') ?? null
}

function isDepositPending(p: WorkspaceProject) {
  return p.depositRequired > 0 && !p.depositPaid
}

function projectActions(p: WorkspaceProject, now: Date): ActionItem[] {
  const base = { projectName: p.name, studio: p.studio }
  const items: ActionItem[] = []
  const portal = `/p/${p.slug}`

  const finished = p.status === 'completed'

  if (p.waitingOnClient && !finished) {
    items.push({
      ...base,
      key: `waiting-${p.id}`,
      kind: 'waiting',
      title: p.waitingReason || `${p.studio.name} is waiting on something from you`,
      context: `${p.studio.name} can’t continue until this arrives.`,
      meta: null,
      reason: `Holding up ${p.name}`,
      blocking: true,
      dueDate: null,
      since: null,
      href: `${portal}#files`,
      actionLabel: 'Send it',
    })
  }

  const deposit = isDepositPending(p) && !finished ? depositInvoiceFor(p) : null
  if (deposit) {
    items.push({
      ...base,
      key: `deposit-${deposit.id}`,
      kind: 'deposit',
      title: `Pay the deposit to start ${p.name}`,
      context: p.studio.name,
      meta: money(deposit.total, deposit.currency),
      reason: `Work on ${p.name} starts once this is paid`,
      blocking: true,
      dueDate: deposit.dueDate,
      since: null,
      href: `/invoice/${deposit.id}`,
      actionLabel: `Pay ${money(deposit.total, deposit.currency)}`,
    })
  }

  for (const inv of p.invoices) {
    if (inv.status !== 'sent' || inv.id === deposit?.id) continue
    const overdue = inv.dueDate ? isPast(inv.dueDate, now) : false
    items.push({
      ...base,
      key: `invoice-${inv.id}`,
      kind: 'invoice',
      title: `Pay ${p.studio.name}`,
      context: `${inv.number ? `Invoice ${inv.number}` : 'Invoice'} · ${p.name}`,
      meta: [money(inv.total, inv.currency), inv.dueDate ? shortDate(inv.dueDate) : null].filter(Boolean).join(' · '),
      reason: inv.dueDate ? (overdue ? `Overdue since ${shortDate(inv.dueDate)}` : `Due ${shortDate(inv.dueDate)}`) : 'Due on receipt',
      blocking: false,
      dueDate: inv.dueDate,
      since: null,
      href: `/invoice/${inv.id}`,
      actionLabel: `Pay ${money(inv.total, inv.currency)}`,
    })
  }

  for (const co of p.changeOrders as ChangeOrder[]) {
    const amount = money(Number(co.amount) || 0, co.currency || 'USD')
    if (changeOrderNeedsPayment(co)) {
      items.push({
        ...base,
        key: `extra-pay-${co.id}`,
        kind: 'extra_payment',
        title: `Pay for “${co.title}”`,
        context: `Extra you approved · ${p.name}`,
        meta: amount,
        reason: 'You approved this extra — pay to add it to the project',
        blocking: false,
        dueDate: null,
        since: co.approved_at ?? null,
        href: `${portal}#billing`,
        actionLabel: `Pay ${amount}`,
      })
    } else if (co.status === 'pending' && !finished) {
      items.push({
        ...base,
        key: `extra-${co.id}`,
        kind: 'change_order',
        title: `Decide on an extra: “${co.title}”`,
        context: p.name,
        meta: Number(co.amount) > 0 ? `+${amount}` : null,
        reason: 'A change to the agreed scope needs your yes or no',
        blocking: false,
        dueDate: null,
        since: co.created_at ?? null,
        href: `${portal}#review`,
        actionLabel: 'Review',
      })
    }
  }

  if (finished) return items

  for (const a of p.approvals) {
    if (a.status !== 'pending') continue
    items.push({
      ...base,
      key: `approval-${a.id}`,
      kind: 'approval',
      title: `Review “${a.title}”`,
      context: `${p.studio.name} · ${p.name}`,
      meta: null,
      reason: 'Ready for your sign-off',
      blocking: false,
      dueDate: null,
      since: a.created_at,
      href: `${portal}#review`,
      actionLabel: 'Review',
    })
  }

  for (const d of p.documents) {
    if (d.status !== 'sent') continue
    const isAgreement = d.type === 'agreement'
    items.push({
      ...base,
      key: `doc-${d.id}`,
      kind: 'document',
      title: isAgreement ? `Sign “${d.title}”` : d.type === 'proposal' ? `Review the proposal “${d.title}”` : `Approve “${d.title}”`,
      context: `${p.studio.name} · ${p.name}`,
      meta: null,
      reason: isAgreement ? 'Waiting for your signature' : 'Waiting for your response',
      blocking: false,
      dueDate: null,
      since: d.created_at,
      href: `/doc/${d.id}`,
      actionLabel: isAgreement ? 'Read & sign' : 'Review',
    })
  }

  for (const c of p.contracts) {
    if (c.signed_at) continue
    items.push({
      ...base,
      key: `contract-${c.id}`,
      kind: 'contract',
      title: `Sign “${c.title}”`,
      context: `${p.studio.name} · ${p.name}`,
      meta: null,
      reason: 'Waiting for your signature',
      blocking: false,
      dueDate: null,
      since: null,
      href: `/contract/${c.id}`,
      actionLabel: 'Read & sign',
    })
  }

  for (const t of p.checklist) {
    if (t.assigned_to !== 'client' || t.done) continue
    items.push({
      ...base,
      key: `task-${t.id}`,
      kind: 'task',
      title: t.title,
      context: `Your task · ${p.name}`,
      meta: null,
      reason: `Part of getting ${p.name} started`,
      blocking: false,
      dueDate: null,
      since: null,
      href: `${portal}#checklist`,
      actionLabel: 'Open',
    })
  }

  return items
}

// Blocking first; then anything with a due date (soonest, so overdue lands on
// top); then the rest oldest-first; the client's own tasks last.
function rank(item: ActionItem): [number, number] {
  if (item.blocking) return [0, item.since ? dayValue(item.since) : 0]
  if (item.dueDate) return [1, dayValue(item.dueDate)]
  if (item.kind === 'task') return [3, 0]
  return [2, item.since ? dayValue(item.since) : Number.MAX_SAFE_INTEGER]
}

export function rankActions(items: ActionItem[]): ActionItem[] {
  return items
    .map((item, i) => ({ item, i, r: rank(item) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i)
    .map(x => x.item)
}

/** One plain sentence on how a project is going. */
export function projectStatus(p: WorkspaceProject, now = new Date()): string {
  if (p.status === 'completed') return 'Finished'
  if (p.status === 'paused') return 'Paused'

  if (isDepositPending(p) && !p.milestones.some(m => m.done)) {
    const needsSignature = p.documents.some(d => d.type === 'agreement' && d.status === 'sent') || p.contracts.some(c => !c.signed_at)
    return needsSignature ? 'Starts once you sign and pay the deposit' : 'Starts once the deposit is paid'
  }

  const overdue = p.milestones.find(m => isMilestoneOverdue(m, now))
  if (overdue) return `Running behind · ${overdue.title} was due ${shortDate(overdue.due_date!)}`

  const next = p.milestones.find(m => !m.done) ?? null
  const dated = p.milestones.filter(m => m.due_date).map(m => m.due_date!)
  const target = dated.length > 0 ? dated.reduce((a, b) => (dayValue(a) > dayValue(b) ? a : b)) : null

  if (p.milestones.length > 0 && !next) return 'All milestones done · wrapping up'
  if (target) return `On track for ${shortDate(target)}${next ? ` · next: ${next.title}` : ''}`

  const latest = p.updates[0]
  return latest ? `In progress · last update ${shortDate(latest.sent_at)}` : 'In progress'
}

export function buildDashboard(workspace: ClientWorkspace, now = new Date()): Dashboard {
  const perProject = new Map(workspace.projects.map(p => [p.id, projectActions(p, now)]))

  const loose: ActionItem[] = workspace.looseInvoices
    .filter(inv => inv.status === 'sent')
    .map(inv => ({
      key: `invoice-${inv.id}`,
      kind: 'invoice' as const,
      title: `Pay ${inv.studio.name}`,
      context: inv.number ? `Invoice ${inv.number}` : 'Invoice',
      meta: [money(inv.total, inv.currency), inv.dueDate ? shortDate(inv.dueDate) : null].filter(Boolean).join(' · '),
      reason: inv.dueDate ? (isPast(inv.dueDate, now) ? `Overdue since ${shortDate(inv.dueDate)}` : `Due ${shortDate(inv.dueDate)}`) : 'Due on receipt',
      blocking: false,
      dueDate: inv.dueDate,
      since: null,
      href: `/invoice/${inv.id}`,
      actionLabel: `Pay ${money(inv.total, inv.currency)}`,
      projectName: '',
      studio: inv.studio,
    }))

  const items = rankActions([...[...perProject.values()].flat(), ...loose])

  const line = (p: WorkspaceProject): ProjectLine => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    studio: p.studio,
    status: projectStatus(p, now),
    needsYou: perProject.get(p.id)?.length ?? 0,
  })

  const budgets: BudgetLine[] = []
  for (const p of workspace.projects) {
    const summary = billingSummary(
      p.invoices.map(i => ({ id: i.id, status: i.status, total: i.total, currency: i.currency })),
      p.changeOrders as ChangeOrder[],
    )
    if (!summary.currency || (summary.paid === 0 && summary.outstanding === 0 && p.budget == null)) continue
    const extras = (p.changeOrders as ChangeOrder[])
      .filter(c => c.requires_payment && (c.status === 'approved' || c.status === 'paid'))
      .reduce((s, c) => s + (Number(c.amount) || 0), 0)
    budgets.push({
      id: p.id,
      name: p.name,
      studioName: p.studio.name,
      currency: summary.currency,
      agreed: p.budget,
      extras,
      paid: summary.paid,
      outstanding: summary.outstanding,
      notBilled: p.budget != null ? Math.max(0, p.budget + extras - summary.paid - summary.outstanding) : 0,
    })
  }

  return {
    items,
    active: workspace.projects.filter(p => p.status !== 'completed').map(line),
    finished: workspace.projects.filter(p => p.status === 'completed').map(p => ({ ...line(p), hasTestimonial: p.hasTestimonial })),
    budgets,
    studioCount: new Set(workspace.projects.map(p => p.studio.id)).size,
  }
}

// ── Sub pages ────────────────────────────────────────────────────────────────

export interface Money {
  currency: string
  amount: number
}

function addMoney(totals: Map<string, number>, currency: string, amount: number) {
  totals.set(currency, (totals.get(currency) ?? 0) + amount)
}

function moneyList(totals: Map<string, number>): Money[] {
  return [...totals.entries()].map(([currency, amount]) => ({ currency, amount })).sort((a, b) => a.currency.localeCompare(b.currency))
}

export interface PayRow {
  key: string
  title: string
  context: string
  amount: number
  currency: string
  /** "Due Nov 4", "Overdue since Oct 2", "Due on receipt" */
  due: string
  overdue: boolean
  href: string
}

export interface StudioPayGroup {
  studio: WorkspaceStudio
  rows: PayRow[]
  totals: Money[]
}

export interface PaidRow {
  key: string
  title: string
  context: string
  amount: number
  currency: string
  paidAt: string | null
  href: string
}

export interface Billing {
  toPay: StudioPayGroup[]
  toPayTotals: Money[]
  paid: PaidRow[]
  paidThisYear: Money[]
  budgets: BudgetLine[]
  year: number
}

function dueText(dueDate: string | null, now: Date): { due: string; overdue: boolean } {
  if (!dueDate) return { due: 'Due on receipt', overdue: false }
  const overdue = isPast(dueDate, now)
  return { due: overdue ? `Overdue since ${shortDate(dueDate)}` : `Due ${shortDate(dueDate)}`, overdue }
}

/** Everything money-related across studios, kept per currency and including tax. */
export function buildBilling(workspace: ClientWorkspace, now = new Date()): Billing {
  const groups = new Map<string, StudioPayGroup>()
  const toPayTotals = new Map<string, number>()
  const paidThisYear = new Map<string, number>()
  const paid: PaidRow[] = []
  const year = now.getFullYear()

  function owe(studio: WorkspaceStudio, row: PayRow) {
    const group = groups.get(studio.id) ?? { studio, rows: [], totals: [] }
    group.rows.push(row)
    groups.set(studio.id, group)
    addMoney(toPayTotals, row.currency, row.amount)
  }

  function settled(row: PaidRow) {
    paid.push(row)
    if (row.paidAt && new Date(row.paidAt).getFullYear() === year) addMoney(paidThisYear, row.currency, row.amount)
  }

  const invoiceSources = [
    ...workspace.projects.flatMap(p => p.invoices.map(inv => ({ inv, studio: p.studio, project: p.name }))),
    ...workspace.looseInvoices.map(inv => ({ inv, studio: inv.studio, project: '' })),
  ]

  for (const { inv, studio, project } of invoiceSources) {
    const label = `${inv.isDeposit ? 'Deposit' : 'Invoice'}${inv.number ? ` ${inv.number}` : ''}`
    if (inv.status === 'sent') {
      owe(studio, {
        key: `invoice-${inv.id}`,
        title: label,
        context: project,
        amount: inv.total,
        currency: inv.currency,
        ...dueText(inv.dueDate, now),
        href: `/invoice/${inv.id}`,
      })
    } else if (inv.status === 'paid') {
      settled({ key: `invoice-${inv.id}`, title: label, context: [studio.name, project].filter(Boolean).join(' · '), amount: inv.total, currency: inv.currency, paidAt: inv.paidAt, href: `/invoice/${inv.id}` })
    }
  }

  for (const p of workspace.projects) {
    for (const co of p.changeOrders as ChangeOrder[]) {
      const amount = Number(co.amount) || 0
      const currency = (co.currency || 'USD').toUpperCase()
      if (changeOrderNeedsPayment(co)) {
        owe(p.studio, {
          key: `extra-${co.id}`,
          title: `Extra: ${co.title}`,
          context: p.name,
          amount,
          currency,
          due: 'Approved — pay to add it',
          overdue: false,
          href: `/p/${p.slug}#billing`,
        })
      } else if (co.status === 'paid' && co.requires_payment && amount > 0) {
        settled({ key: `extra-${co.id}`, title: `Extra: ${co.title}`, context: `${p.studio.name} · ${p.name}`, amount, currency, paidAt: co.paid_at ?? null, href: `/p/${p.slug}#billing` })
      }
    }
  }

  const toPay = [...groups.values()].map(g => {
    const totals = new Map<string, number>()
    for (const row of g.rows) addMoney(totals, row.currency, row.amount)
    // Overdue first, then by due date as written
    g.rows.sort((a, b) => Number(b.overdue) - Number(a.overdue))
    return { ...g, totals: moneyList(totals) }
  })

  paid.sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''))

  return {
    toPay,
    toPayTotals: moneyList(toPayTotals),
    paid,
    paidThisYear: moneyList(paidThisYear),
    budgets: buildDashboard(workspace, now).budgets,
    year,
  }
}

export interface ProjectCard extends ProjectLine {
  done: number
  total: number
  lastUpdate: string | null
}

export interface ProjectList {
  active: ProjectCard[]
  paused: ProjectCard[]
  finished: (ProjectCard & { hasTestimonial: boolean })[]
  studioCount: number
}

export function buildProjectList(workspace: ClientWorkspace, now = new Date()): ProjectList {
  const card = (p: WorkspaceProject): ProjectCard => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    studio: p.studio,
    status: projectStatus(p, now),
    needsYou: projectActions(p, now).length,
    done: p.milestones.filter(m => m.done).length,
    total: p.milestones.length,
    lastUpdate: p.updates[0]?.sent_at ?? null,
  })
  // Projects that need the client first, then the most recently active
  const byAttention = (a: ProjectCard, b: ProjectCard) =>
    b.needsYou - a.needsYou || (b.lastUpdate ?? '').localeCompare(a.lastUpdate ?? '')

  return {
    active: workspace.projects.filter(p => p.status === 'active').map(card).sort(byAttention),
    paused: workspace.projects.filter(p => p.status === 'paused').map(card).sort(byAttention),
    finished: workspace.projects.filter(p => p.status === 'completed').map(p => ({ ...card(p), hasTestimonial: p.hasTestimonial })),
    studioCount: new Set(workspace.projects.map(p => p.studio.id)).size,
  }
}

export interface UpdateEntry {
  id: string
  sentAt: string
  bullets: string[]
  note: string | null
  projectName: string
  slug: string
  studio: WorkspaceStudio
}

/** Every update sent to the client, newest first. */
export function buildUpdates(workspace: ClientWorkspace): UpdateEntry[] {
  return workspace.projects
    .flatMap(p => p.updates.map(u => ({
      id: u.id,
      sentAt: u.sent_at,
      bullets: (u.bullets ?? []).filter(Boolean),
      note: u.note,
      projectName: p.name,
      slug: p.slug,
      studio: p.studio,
    })))
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}
