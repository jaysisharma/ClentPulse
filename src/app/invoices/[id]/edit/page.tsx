'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Project {
  id: string
  project_name: string
  client_name: string
  client_email: string | null
}

function emptyItem(): LineItem {
  return { description: '', quantity: 1, rate: 0, amount: 0 }
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function EditInvoicePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [budget, setBudget] = useState<number | null>(null)
  const [invoicedSoFar, setInvoicedSoFar] = useState(0)

  // Load the project's budget and what's already invoiced against it,
  // EXCLUDING this invoice (we're editing it, so it shouldn't count twice).
  async function loadBudget(pid: string) {
    if (!pid) {
      setBudget(null)
      setInvoicedSoFar(0)
      return
    }
    const supabase = createClient()
    const { data: proj } = await supabase.from('projects').select('budget').eq('id', pid).single()
    const b = proj?.budget ? parseFloat(proj.budget) : 0
    setBudget(b > 0 ? b : null)
    const { data: existing } = await supabase
      .from('invoices')
      .select('items, status')
      .eq('project_id', pid)
      .neq('id', id)
    const already = (existing ?? [])
      .filter((inv: any) => inv.status !== 'canceled')
      .flatMap((inv: any) => inv.items ?? [])
      .reduce((s: number, it: any) => s + (it.amount ?? 0), 0)
    setInvoicedSoFar(already)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      Promise.all([
        supabase.from('projects').select('id,project_name,client_name,client_email').eq('user_id', user.id),
        supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single(),
      ]).then(([{ data: projs }, { data: inv }]: any[]) => {
        setProjects(projs ?? [])
        if (inv) {
          setProjectId(inv.project_id ?? '')
          setClientName(inv.client_name ?? '')
          setClientEmail(inv.client_email ?? '')
          setInvoiceNumber(inv.invoice_number ?? '')
          setDueDate(inv.due_date ? inv.due_date.slice(0, 10) : '')
          setItems(inv.items?.length ? inv.items : [emptyItem()])
          setNotes(inv.notes ?? '')
          loadBudget(inv.project_id ?? '')
        }
        setFetching(false)
      })
    })
  }, [id])

  function handleProjectChange(pid: string) {
    setProjectId(pid)
    const p = projects.find(p => p.id === pid)
    if (p) {
      setClientName(p.client_name)
      setClientEmail(p.client_email ?? '')
    }
    loadBudget(pid)
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    if (field === 'quantity' || field === 'rate') {
      next[i].amount = Number(next[i].quantity) * Number(next[i].rate)
    }
    setItems(next)
  }

  const total = items.reduce((s, i) => s + (i.amount || 0), 0)
  const remaining = budget != null ? budget - invoicedSoFar : null
  const overBudget = remaining != null && total > remaining

  async function handleSave() {
    if (overBudget) {
      setError(
        `This invoice exceeds the project budget. Only ${fmt$(Math.max(remaining!, 0))} of the ${fmt$(budget!)} budget remains. Raise the project budget or lower the invoice amount.`
      )
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('invoices')
      .update({
        project_id: projectId || null,
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail || null,
        due_date: dueDate || null,
        items,
        notes: notes || null,
      })
      .eq('id', id)

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push(`/invoices/${id}`)
  }

  const valid =
    clientName.trim() && invoiceNumber.trim() && items.some(i => i.description.trim()) && !overBudget

  if (fetching) {
    return (
      <AppLayout>
        <DarkShell>
          <div className="max-w-3xl py-12 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <Loader2 className="w-4 h-4 animate-spin text-slate-900 dark:text-white" />
            Loading invoice details…
          </div>
        </DarkShell>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12">
          {/* Back link */}
          <Link
            href={`/invoices/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to invoice
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Financial Ledger
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Edit invoice
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Update line items, deliverables, and payment terms. Changes update immediately upon saving.
            </p>
          </div>

          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                  Invoice Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                  Reference identifier, due date, and client linkage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Invoice number
                  </label>
                  <input
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Due date
                  </label>
                  <input
                    type="date"
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Link to project <span className="font-normal lowercase text-slate-400">(optional)</span>
                </label>
                <select
                  value={projectId}
                  onChange={e => handleProjectChange(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0c0d12] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                >
                  <option value="">— Standalone / No linked project —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.project_name} ({p.client_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Client name
                  </label>
                  <input
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Client email
                  </label>
                  <input
                    type="email"
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none space-y-4 backdrop-blur-md">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Line items
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">
                    Specify deliverables, billable hours, and fixed scope components.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setItems([...items, emptyItem()])}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" /> Add item
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Qty / Hrs</span>
                  <span className="col-span-2 text-right">Rate ($)</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>

                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className="col-span-6 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors"
                      placeholder="e.g. Design sprint, brand identity…"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                    />
                    <input
                      className="col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-right focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors font-mono"
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <input
                      className="col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-right focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors font-mono"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                    />
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-xs sm:text-sm font-mono font-medium text-slate-900 dark:text-white">
                        ${item.amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, j) => j !== i))}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors disabled:opacity-0 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Total Amount Due
                  </span>
                  <div
                    className={`text-2xl sm:text-3xl font-light tracking-tight font-mono mt-1 ${
                      overBudget
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    ${total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Budget Context */}
              {budget != null && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
                    overBudget
                      ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wider font-semibold text-[10px]">Project Budget Cap</span>
                    <span className="font-mono font-medium">{fmt$(budget)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="uppercase tracking-wider text-[10px]">Already Billed (Excl. this)</span>
                    <span className="font-mono font-medium">{fmt$(invoicedSoFar)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="uppercase tracking-wider text-[10px]">Available Balance</span>
                    <span className="font-mono font-medium">{fmt$(Math.max(remaining ?? 0, 0))}</span>
                  </div>
                  {overBudget && (
                    <div className="mt-2.5 font-medium border-t border-rose-200 dark:border-rose-900/40 pt-2">
                      Notice: This invoice is {fmt$(total - (remaining ?? 0))} over the remaining project budget.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none space-y-3 backdrop-blur-md">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Payment terms & notes <span className="font-normal lowercase text-slate-400">(optional)</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder="Bank transfer details, payment terms, or a personal note to the client…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                href={`/invoices/${id}`}
                className="w-full sm:w-auto text-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-5 py-2.5 text-xs font-semibold transition-colors shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!valid || loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-6 py-2.5 text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
