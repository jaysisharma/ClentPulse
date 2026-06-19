'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

interface LineItem { description: string; quantity: number; rate: number; amount: number }
interface Project { id: string; project_name: string; client_name: string; client_email: string | null }

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
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      const user = data?.user
      if (!user) return
      supabase.from('projects').select('id,project_name,client_name,client_email').eq('user_id', user.id).eq('status', 'active')
        .then(({ data }: { data: any }) => setProjects(data ?? []))
      const year = new Date().getFullYear()
      const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
      setInvoiceNumber(`INV-${year}-${rand}`)
    })
  }, [])

  function handleProjectChange(id: string) {
    setProjectId(id)
    const p = projects.find(p => p.id === id)
    if (p) { setClientName(p.client_name); setClientEmail(p.client_email ?? '') }
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

  async function handleSubmit(status: 'draft' | 'sent') {
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
    router.push(`/invoices/${data.id}`)
  }

  const valid = clientName.trim() && invoiceNumber.trim() && items.some(i => i.description.trim())

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to invoices
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">New invoice</h1>
        <p className="text-slate-500 text-sm mb-8">Fill in the details below. You can save as draft or send immediately.</p>

        <div className="space-y-5">
          {/* Header info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm">Invoice details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Invoice number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
              <Input label="Due date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Link to project (optional)</label>
              <select
                value={projectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— No project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name} ({p.client_name})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Client name" value={clientName} onChange={e => setClientName(e.target.value)} required />
              <Input label="Client email" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-4">Line items</h2>

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
                    className="col-span-6 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                  />
                  <input
                    className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number" min="0" step="0.5"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    className="col-span-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="number" min="0" step="0.01"
                    value={item.rate}
                    onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                  />
                  <div className="col-span-1 text-sm text-slate-700 text-right font-medium">
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
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total</div>
                <div className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <label className="text-sm font-medium text-slate-700 block mb-2">Notes (optional)</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
