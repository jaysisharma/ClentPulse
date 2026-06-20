'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

type Project = { id: string; project_name: string }
type Expense = {
  id: string
  description: string
  amount: number
  category: string | null
  date: string
  project_id: string | null
  projectName?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

export function ExpensesClient({ expenses, projects }: { expenses: Expense[]; projects: Project[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!description.trim() || isNaN(value) || value <= 0) {
      setError('Enter a description and a positive amount.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error: err } = await supabase.from('expenses').insert({
      user_id: user.id,
      project_id: projectId || null,
      description: description.trim(),
      amount: value,
      category: category.trim() || null,
      date,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setDescription(''); setAmount(''); setCategory(''); setProjectId('')
    setDate(new Date().toISOString().slice(0, 10))
    setOpen(false)
    router.refresh()
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">All expenses</h2>
        <Button size="sm" onClick={() => setOpen(o => !o)}>
          <Plus className="w-4 h-4" />Add expense
        </Button>
      </div>

      {open && (
        <form onSubmit={addExpense} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Description" placeholder="Figma subscription" value={description} onChange={e => setDescription(e.target.value)} autoFocus />
            <Input label="Amount (USD)" type="number" step="0.01" min="0" placeholder="15.00" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input label="Category (optional)" placeholder="Software" value={category} onChange={e => setCategory(e.target.value)} />
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Project (optional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" loading={saving} size="sm">Save expense</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => { setOpen(false); setError('') }}>Cancel</Button>
          </div>
        </form>
      )}

      {!expenses.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-400">
          No expenses logged yet. Track software, contractors, and other costs to see your real take-home.
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(ex => (
            <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3.5 group">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{ex.description}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Date(ex.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {ex.category ? ` · ${ex.category}` : ''}
                  {ex.projectName ? ` · ${ex.projectName}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-semibold text-rose-600">−{fmt(ex.amount)}</span>
                <button
                  onClick={() => remove(ex.id)}
                  className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
