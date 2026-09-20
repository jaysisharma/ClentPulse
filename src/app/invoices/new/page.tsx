'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Clock } from 'lucide-react'

import { DarkShell } from '@/components/layout/dark-shell'

import { fmtCurrency, SUPPORTED_CURRENCIES } from '@/lib/currencies'

interface LineItem { description: string; quantity: number; rate: number; amount: number }
interface Project { id: string; project_name: string; client_name: string; client_email: string | null; budget: string | null; hourly_rate: number | null }

function emptyItem(): LineItem {
  return { description: '', quantity: 1, rate: 0, amount: 0 }
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [isDeposit, setIsDeposit] = useState(false)
  const [taxRate, setTaxRate] = useState<number>(0)
  const [taxId, setTaxId] = useState('')
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
        .then(({ data }: { data: any }) => {
          const list = data ?? []
          setProjects(list)

          // Check URL query parameters for milestone auto-fill
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const targetProjectId = params.get('projectId')
            const milestoneTitle = params.get('milestoneTitle')
            const amountParam = parseFloat(params.get('amount') || '0')

            if (targetProjectId) {
              const matchedProj = list.find((p: any) => p.id === targetProjectId)
              if (matchedProj) {
                setProjectId(targetProjectId)
                setClientName(matchedProj.client_name)
                setClientEmail(matchedProj.client_email ?? '')
                const b = matchedProj.budget ? parseFloat(matchedProj.budget) : 0
                setBudget(b > 0 ? b : null)
              }
            }

            if (milestoneTitle) {
              setItems([{
                description: `Milestone Deliverable: ${milestoneTitle}`,
                quantity: 1,
                rate: amountParam > 0 ? amountParam : 0,
                amount: amountParam > 0 ? amountParam : 0,
              }])
            }
          }
        })
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

  function applyDepositPreset(percent: number) {
    const p = projects.find(p => p.id === projectId)
    const baseBudget = budget || 0
    if (baseBudget <= 0) return
    const depositAmt = Math.round(baseBudget * (percent / 100) * 100) / 100
    setIsDeposit(true)
    setItems([{
      description: `${percent}% Upfront Project Deposit — ${p?.project_name ?? 'Project Kickoff'}`,
      quantity: 1,
      rate: depositAmt,
      amount: depositAmt,
    }])
  }

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const taxAmount = Math.round(subtotal * ((taxRate || 0) / 100) * 100) / 100
  const total = subtotal + taxAmount
  const remaining = budget != null ? budget - invoicedSoFar : null
  const overBudget = remaining != null && subtotal > remaining

  async function handleSubmit(status: 'draft' | 'sent') {
    if (overBudget) {
      setError(`This invoice exceeds the project budget. Only ${fmtCurrency(Math.max(remaining!, 0), currency)} of the ${fmtCurrency(budget!, currency)} budget remains. Raise the project budget or lower the invoice amount.`)
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
      currency,
      tax_rate: taxRate > 0 ? taxRate : 0,
      tax_id: taxId.trim() || null,
      is_deposit: isDeposit,
      items,
      notes: notes || null,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }

    // If it's a deposit invoice linked to a project, set deposit_required on the project
    if (isDeposit && projectId) {
      await supabase.from('projects').update({
        deposit_required: total,
        deposit_paid: false,
      }).eq('id', projectId)
    }

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
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12">
          {/* Back link */}
          <Link 
            href="/invoices" 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to invoices
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
              New invoice
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Configure billable deliverables, hourly logs, and payment terms. Save as draft or send directly.
            </p>
          </div>

          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 space-y-5 backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Invoice Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Reference identifier, due date, and client linkage.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0c0d12] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upfront Deposit Option */}
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-900 dark:text-white">
                    <input
                      type="checkbox"
                      checked={isDeposit}
                      onChange={e => setIsDeposit(e.target.checked)}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span>⚡ Mark as Upfront Project Deposit (Kickoff Gate)</span>
                  </label>
                  {isDeposit && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Gate Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                  Requires settlement before project work commences. Paying unlocks the client portal and activates project status.
                </p>

                {isDeposit && budget != null && budget > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Deposit presets:</span>
                    <button
                      type="button"
                      onClick={() => applyDepositPreset(50)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-mono transition-colors"
                    >
                      50% ({fmtCurrency(budget * 0.5, currency)})
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDepositPreset(33)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-mono transition-colors"
                    >
                      33% ({fmtCurrency(budget * 0.33, currency)})
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDepositPreset(25)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-mono transition-colors"
                    >
                      25% ({fmtCurrency(budget * 0.25, currency)})
                    </button>
                  </div>
                )}
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
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.client_name})</option>)}
                </select>
              </div>

              {unbilledEntries.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 font-sans mt-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>
                      Found <strong className="font-semibold text-slate-900 dark:text-white">{unbilledEntries.length}</strong> unbilled time logs ({unbilledEntries.reduce((s, e) => s + e.hours, 0).toFixed(2)} hours).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={importTimeEntries}
                    className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold px-3.5 py-1.5 text-xs transition-all shadow-xs self-start sm:self-auto"
                  >
                    Import time logs
                  </button>
                </div>
              )}

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
              <div className="pb-3 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Line Items</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">Specify task items, quantities, and hourly rates.</p>
              </div>

              <div className="space-y-3">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 px-1 tracking-wider">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-2 text-right">Rate ($)</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>

                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className="col-span-6 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors"
                      placeholder="e.g. Design sprint, frontend code"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                    />
                    <input
                      className="col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-right focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors font-mono"
                      type="number" min="0" step="0.5"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <input
                      className="col-span-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-right focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors font-mono"
                      type="number" min="0" step="0.01"
                      value={item.rate}
                      onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                    />
                    <div className="col-span-1 text-xs sm:text-sm text-slate-900 dark:text-white text-right font-mono font-medium truncate">
                      ${item.amount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, j) => j !== i))}
                      disabled={items.length === 1}
                      className="col-span-1 flex justify-end text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors disabled:opacity-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setItems([...items, emptyItem()])}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add line item
                </button>
              </div>

              {/* Tax & VAT Configuration */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tax / VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    value={taxRate || ''}
                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tax / VAT ID <span className="font-normal lowercase text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EU123456789 or ABN"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                  />
                </div>
              </div>

              {/* Total & Subtotal Breakdown */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <div className="w-64 space-y-2 text-right">
                  <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{fmtCurrency(subtotal, currency)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between items-baseline text-xs text-slate-500 dark:text-slate-400">
                      <span>Tax / VAT ({taxRate}%):</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{fmtCurrency(taxAmount, currency)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Due:</span>
                    <span className={`text-2xl sm:text-3xl font-light tracking-tight font-mono ${overBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {fmtCurrency(total, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget context for the linked project */}
              {budget != null && (
                <div className={`mt-4 rounded-xl border p-4 text-xs font-mono backdrop-blur-md ${overBudget
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400'}`}>
                  <div className="flex items-center justify-between">
                    <span>Project budget</span><span className="font-semibold text-slate-900 dark:text-white tabular-nums">{fmtCurrency(budget, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span>Already invoiced</span><span className="font-semibold text-slate-900 dark:text-white tabular-nums">{fmtCurrency(invoicedSoFar, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span>Remaining budget</span><span className="font-semibold text-slate-900 dark:text-white tabular-nums">{fmtCurrency(Math.max(remaining ?? 0, 0), currency)}</span>
                  </div>
                  {overBudget && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 font-semibold text-rose-700 dark:text-rose-300">
                      Warning: Invoice is {fmtCurrency(subtotal - (remaining ?? 0), currency)} over project budget.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none space-y-2 backdrop-blur-md">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Payment Terms & Notes <span className="font-normal lowercase text-slate-400">(optional)</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors resize-none leading-relaxed"
                rows={3}
                placeholder="Direct deposit instructions, routing details, thank you notes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading || !valid}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-5 py-2.5 text-xs font-semibold transition-all shadow-xs flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save as draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('sent')}
                disabled={loading || !valid}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2.5 text-xs transition-all shadow-xs flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Save & mark sent'}
              </button>
            </div>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}

