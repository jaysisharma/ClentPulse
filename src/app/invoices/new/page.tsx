'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Clock } from 'lucide-react'

interface LineItem { description: string; quantity: number; rate: number; amount: number }
interface Project { id: string; project_name: string; client_name: string; client_email: string | null; budget: string | null; hourly_rate: number | null }

function emptyItem(): LineItem {
  return { description: '', quantity: 1, rate: 0, amount: 0 }
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Budget context for the linked project (null = no budget set, so no cap).
  const [budget, setBudget] = useState<number | null>(null)
  const [invoicedSoFar, setInvoicedSoFar] = useState(0)
  const [unbilledEntries, setUnbilledEntries] = useState<any[]>([])
  const [importedEntryIds, setImportedEntryIds] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      supabase.from('projects').select('id,project_name,client_name,client_email,budget,hourly_rate').eq('user_id', user.id).eq('status', 'active')
        .then(({ data }: { data: any }) => setProjects(data ?? []))
      const year = new Date().getFullYear()
      const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
      setInvoiceNumber(`INV-${year}-${rand}`)
    })
  }, [])

  async function handleProjectChange(id: string) {
    setProjectId(id)
    const p = projects.find(p => p.id === id)
    if (!p) { setBudget(null); setInvoicedSoFar(0); setUnbilledEntries([]); setImportedEntryIds([]); return }
    setClientName(p.client_name)
    setClientEmail(p.client_email ?? '')

    const b = p.budget ? parseFloat(p.budget) : 0
    setBudget(b > 0 ? b : null)

    // Sum what's already been invoiced against this project so we can cap.
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('invoices')
      .select('items, status')
      .eq('project_id', id)
    const already = (existing ?? [])
      .filter((inv: any) => inv.status !== 'canceled')
      .flatMap((inv: any) => inv.items ?? [])
      .reduce((s: number, it: any) => s + (it.amount ?? 0), 0)
    setInvoicedSoFar(already)

    // Fetch unbilled time entries
    const { data: unbilled } = await supabase
      .from('time_entries')
      .select('id, description, hours, date')
      .eq('project_id', id)
      .eq('invoiced', false)
    setUnbilledEntries(unbilled ?? [])
  }

  function importTimeEntries() {
    const p = projects.find(p => p.id === projectId)
    if (!p) return
    const rate = p.hourly_rate ? Number(p.hourly_rate) : 0
    const newItems = unbilledEntries.map(e => ({
      description: `${e.date}: ${e.description}`,
      quantity: e.hours,
      rate,
      amount: e.hours * rate
    }))

    if (items.length === 1 && !items[0].description.trim() && items[0].rate === 0) {
      setItems(newItems)
    } else {
      setItems([...items, ...newItems])
    }
    setImportedEntryIds(unbilledEntries.map(e => e.id))
    setUnbilledEntries([])
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

  async function handleSubmit(status: 'draft' | 'sent') {
    if (overBudget) {
      setError(`This invoice exceeds the project budget. Only ${fmt$(Math.max(remaining!, 0))} of the ${fmt$(budget!)} budget remains. Raise the project budget or lower the invoice amount.`)
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error: err } = await supabase.from('invoices').insert({
      user_id: user.id,
      project_id: projectId || null,
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail || null,
      due_date: dueDate || null,
      status,
      items,
      notes: notes || null,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }

    // If we imported time entries, mark them as invoiced in the DB
    if (importedEntryIds.length > 0) {
      const { error: timeUpdateErr } = await supabase
        .from('time_entries')
        .update({ invoiced: true, invoice_id: data.id })
        .in('id', importedEntryIds)
      if (timeUpdateErr) {
        console.error('Failed to mark time entries as invoiced:', timeUpdateErr)
      }
    }

    router.push(`/invoices/${data.id}`)
  }

  const valid = clientName.trim() && invoiceNumber.trim() && items.some(i => i.description.trim()) && !overBudget

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to invoices
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">New invoice</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Fill in the details below. You can save as draft or send immediately.</p>

        <div className="space-y-5">
          {/* Header info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Invoice details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Invoice number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
              <Input label="Due date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">Link to project (optional)</label>
              <select
                value={projectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— No project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.client_name})</option>)}
              </select>
            </div>

            {unbilledEntries.length > 0 && (
              <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 font-sans mt-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>
                    Found <strong>{unbilledEntries.length}</strong> unbilled time logs ({unbilledEntries.reduce((s, e) => s + e.hours, 0).toFixed(2)} hours).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={importTimeEntries}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors cursor-pointer"
                >
                  Import logs
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Client name" value={clientName} onChange={e => setClientName(e.target.value)} required />
              <Input label="Client email" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Line items</h2>

            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Rate ($)</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>

              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-6 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                  />
                  <input
                    className="col-span-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number" min="0" step="0.5"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    className="col-span-2 px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number" min="0" step="0.01"
                    value={item.rate}
                    onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                  />
                  <div className="col-span-1 text-sm text-slate-700 dark:text-slate-200 text-right font-medium">
                    ${item.amount.toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                    className="col-span-1 flex justify-end text-slate-300 hover:text-red-500 transition-colors disabled:opacity-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setItems([...items, emptyItem()])}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />Add line item
            </button>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
                <div className={`text-2xl font-bold ${overBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>${total.toFixed(2)}</div>
              </div>
            </div>

            {/* Budget context for the linked project */}
            {budget != null && (
              <div className={`mt-4 rounded-lg border px-3.5 py-2.5 text-xs ${overBudget
                ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span>Project budget</span><span className="font-semibold tabular-nums">{fmt$(budget)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Already invoiced</span><span className="font-semibold tabular-nums">{fmt$(invoicedSoFar)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Remaining</span><span className="font-semibold tabular-nums">{fmt$(Math.max(remaining ?? 0, 0))}</span>
                </div>
                {overBudget && (
                  <div className="mt-2 font-semibold">
                    This invoice is {fmt$(total - (remaining ?? 0))} over budget. Lower the amount or raise the project budget in its settings.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Notes (optional)</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              placeholder="Payment terms, bank details, thank-you note…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => handleSubmit('draft')} loading={loading} disabled={!valid} className="flex-1 justify-center">
              Save as draft
            </Button>
            <Button onClick={() => handleSubmit('sent')} loading={loading} disabled={!valid} className="flex-1 justify-center">
              Save & mark sent
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
