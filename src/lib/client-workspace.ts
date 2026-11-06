import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

// Everything a signed-in client can see across every studio they work with.
//
// Loaded with the service role because clients have no RLS read access to
// projects, invoices, approvals, documents or contracts. Access is decided here:
// a project belongs to this client when its client_user_id is theirs, or its
// client_email matches their *confirmed* email. Only client-facing rows are
// returned (sent/paid invoices, non-draft change orders, sent updates, …).

export interface WorkspaceStudio {
  id: string
  name: string
  logoUrl: string | null
  accent: string | null
  contactEmail: string | null
}

export interface WorkspaceProject {
  id: string
  name: string
  /** How the studio addressed the client on this project (shown as their name in messages). */
  clientName: string
  slug: string
  status: string
  createdAt: string
  budget: number | null
  waitingOnClient: boolean
  waitingReason: string | null
  depositRequired: number
  depositPaid: boolean
  hideApprovals: boolean
  studio: WorkspaceStudio
  milestones: { id: string; title: string; due_date: string | null; done: boolean }[]
  approvals: { id: string; title: string; status: string; created_at: string | null }[]
  changeOrders: any[]
  checklist: { id: string; title: string; assigned_to: 'freelancer' | 'client'; done: boolean; done_at: string | null }[]
  updates: { id: string; sent_at: string; bullets: string[] | null; note: string | null }[]
  documents: { id: string; type: string; title: string; status: string; amount: number | null; created_at: string | null }[]
  contracts: { id: string; title: string; signed_at: string | null }[]
  invoices: WorkspaceInvoice[]
  hasTestimonial: boolean
}

export interface WorkspaceInvoice {
  id: string
  number: string | null
  status: string
  currency: string
  /** What the client is charged: line items plus tax, as /api/pay-invoice computes it. */
  total: number
  dueDate: string | null
  paidAt: string | null
  isDeposit: boolean
  projectId: string | null
}

export interface ClientWorkspace {
  projects: WorkspaceProject[]
  /** Invoices sent to this client that aren't attached to a project. */
  looseInvoices: (WorkspaceInvoice & { studio: WorkspaceStudio })[]
}

/** Escape LIKE wildcards so an email is matched literally (case-insensitively). */
function likeLiteral(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

export function invoiceChargeTotal(inv: { items?: { amount?: number }[] | null; tax_rate?: number | null; total?: number | null; amount?: number | null }): number {
  if (Array.isArray(inv.items) && inv.items.length > 0) {
    const subtotal = inv.items.reduce((s, i) => s + (Number(i?.amount) || 0), 0)
    const tax = Math.round(subtotal * (Number(inv.tax_rate ?? 0) / 100) * 100) / 100
    return subtotal + tax
  }
  return Number(inv.total || inv.amount || 0)
}

function toInvoice(row: any): WorkspaceInvoice {
  return {
    id: row.id,
    number: row.invoice_number ?? null,
    status: row.status,
    currency: (row.currency || 'USD').toUpperCase(),
    total: invoiceChargeTotal(row),
    dueDate: row.due_date ?? null,
    paidAt: row.paid_at ?? null,
    isDeposit: Boolean(row.is_deposit),
    projectId: row.project_id ?? null,
  }
}

function groupBy<T extends { project_id: string }>(rows: T[] | null): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const row of rows ?? []) {
    const list = map.get(row.project_id) ?? []
    list.push(row)
    map.set(row.project_id, list)
  }
  return map
}

export async function loadClientWorkspace(user: User): Promise<ClientWorkspace> {
  const admin = createAdminClient()
  const email = user.email_confirmed_at && user.email ? user.email.trim() : null

  // 1. The client's projects: linked by account, or by confirmed email
  const projectColumns = 'id, user_id, org_id, project_name, client_name, slug, status, created_at, budget, waiting_on_client, waiting_reason, deposit_required, deposit_paid, hide_approvals'
  const [{ data: byId }, { data: byEmail }] = await Promise.all([
    admin.from('projects').select(projectColumns).eq('client_user_id', user.id),
    email
      ? admin.from('projects').select(projectColumns).ilike('client_email', likeLiteral(email))
      : Promise.resolve({ data: [] as any[] }),
  ])
  const projectRows = [...new Map([...(byId ?? []), ...(byEmail ?? [])].map(p => [p.id, p])).values()]
  const ids = projectRows.map(p => p.id)

  // 2. Everything client-facing on those projects, in one round of queries
  const none = Promise.resolve({ data: [] as any[] })
  const [
    milestones, approvals, changeOrders, checklist, updates, documents, contracts, invoices, testimonials, looseInvoices,
  ] = await Promise.all([
    ids.length ? admin.from('milestones').select('id, project_id, title, due_date, done').in('project_id', ids).order('due_date', { ascending: true, nullsFirst: false }) : none,
    ids.length ? admin.from('approvals').select('*').in('project_id', ids) : none,
    ids.length ? admin.from('change_orders').select('*').in('project_id', ids).neq('status', 'draft') : none,
    ids.length ? admin.from('checklist_items').select('id, project_id, title, assigned_to, done, done_at').in('project_id', ids).order('created_at', { ascending: true }) : none,
    ids.length ? admin.from('updates').select('id, project_id, sent_at, bullets, note').in('project_id', ids).not('sent_at', 'is', null).order('sent_at', { ascending: false }) : none,
    ids.length ? admin.from('documents').select('id, project_id, type, title, status, amount, created_at').in('project_id', ids).neq('status', 'draft') : none,
    ids.length ? admin.from('contracts').select('id, project_id, title, signed_at').in('project_id', ids) : none,
    ids.length ? admin.from('invoices').select('*').in('project_id', ids).in('status', ['sent', 'paid']) : none,
    ids.length ? admin.from('testimonials').select('project_id').in('project_id', ids) : none,
    email
      ? admin.from('invoices').select('*').ilike('client_email', likeLiteral(email)).is('project_id', null).in('status', ['sent', 'paid'])
      : none,
  ])

  // 3. Studio branding: the project's organization if it has one, else its owner
  const ownerIds = [...new Set([...projectRows.map(p => p.user_id), ...(looseInvoices.data ?? []).map((i: any) => i.user_id)].filter(Boolean))]
  const orgIds = [...new Set(projectRows.map(p => p.org_id).filter(Boolean))]
  const [{ data: owners }, { data: orgs }] = await Promise.all([
    ownerIds.length ? admin.from('users').select('id, name, email, logo_url, accent_color').in('id', ownerIds) : none,
    orgIds.length ? admin.from('organizations').select('id, name, logo_url, accent_color').in('id', orgIds) : none,
  ])
  const ownerById = new Map((owners ?? []).map((o: any) => [o.id, o]))
  const orgById = new Map((orgs ?? []).map((o: any) => [o.id, o]))

  function studioFor(userId: string, orgId: string | null): WorkspaceStudio {
    const owner = ownerById.get(userId)
    const org = orgId ? orgById.get(orgId) : null
    return {
      id: org?.id ?? userId,
      name: org?.name || owner?.name || 'Your studio',
      logoUrl: org?.logo_url || owner?.logo_url || null,
      accent: org?.accent_color || owner?.accent_color || null,
      contactEmail: owner?.email ?? null,
    }
  }

  const m = groupBy(milestones.data as any[])
  const a = groupBy(approvals.data as any[])
  const co = groupBy(changeOrders.data as any[])
  const cl = groupBy(checklist.data as any[])
  const up = groupBy(updates.data as any[])
  const docs = groupBy(documents.data as any[])
  const ct = groupBy(contracts.data as any[])
  const inv = groupBy(invoices.data as any[])
  const reviewed = new Set((testimonials.data ?? []).map((t: any) => t.project_id))

  const projects: WorkspaceProject[] = projectRows
    .map(p => ({
      id: p.id,
      name: p.project_name,
      clientName: p.client_name ?? '',
      slug: p.slug,
      status: p.status,
      createdAt: p.created_at,
      budget: p.budget != null ? Number(p.budget) : null,
      waitingOnClient: Boolean(p.waiting_on_client),
      waitingReason: p.waiting_reason ?? null,
      depositRequired: Number(p.deposit_required) || 0,
      depositPaid: Boolean(p.deposit_paid),
      hideApprovals: Boolean(p.hide_approvals),
      studio: studioFor(p.user_id, p.org_id),
      milestones: m.get(p.id) ?? [],
      approvals: p.hide_approvals ? [] : (a.get(p.id) ?? []),
      changeOrders: co.get(p.id) ?? [],
      checklist: cl.get(p.id) ?? [],
      updates: up.get(p.id) ?? [],
      documents: docs.get(p.id) ?? [],
      contracts: ct.get(p.id) ?? [],
      invoices: (inv.get(p.id) ?? []).map(toInvoice),
      hasTestimonial: reviewed.has(p.id),
    }))
    .sort((x, y) => (y.createdAt ?? '').localeCompare(x.createdAt ?? ''))

  return {
    projects,
    looseInvoices: (looseInvoices.data ?? []).map((row: any) => ({ ...toInvoice(row), studio: studioFor(row.user_id, null) })),
  }
}
