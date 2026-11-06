'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

type Project = { id: string; project_name: string }

function localTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
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
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(localTodayStr())
  }, [])

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
    setDate(localTodayStr())
    setOpen(false)
    router.refresh()
  }

  async function remove(id: string) {
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-accent dark:text-indigo-400">
            Recorded Disbursements
          </span>
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-[#eaecf2] dark:border-white/[0.08] rounded-full px-2 py-0.5">
            {expenses.length}
          </span>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="bg-accent hover:bg-accent-hover rounded-md text-white font-semibold px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{open ? 'Close' : 'Log expense'}</span>
        </button>
      </div>

      {open && (
        <form onSubmit={addExpense} className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/95 p-6 shadow-xs dark:shadow-none backdrop-blur-md space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#f1f3f7] dark:border-white/[0.05] pb-3">
            <span className="text-xs font-semibold text-accent dark:text-indigo-400">
              New Expense Entry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
              <input
                placeholder="e.g. Figma subscription, Hosting, Contractor fee"
                value={description}
                onChange={e => setDescription(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 text-xs border border-[#eaecf2] dark:border-white/[0.08] rounded-md bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="15.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#eaecf2] dark:border-white/[0.08] rounded-md bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category (optional)</label>
              <input
                placeholder="e.g. Software, Infrastructure, Contractor"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#eaecf2] dark:border-white/[0.08] rounded-md bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#eaecf2] dark:border-white/[0.08] rounded-md bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Project attribution (optional)</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-[#eaecf2] dark:border-white/[0.08] rounded-md bg-slate-50 dark:bg-[#12141c] text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-white/30 focus:ring-1 focus:ring-slate-300 dark:focus:ring-white/20 transition-all"
              >
                <option value="">No specific project (General business expense)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#12141c] text-slate-900 dark:text-white">
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-accent-hover rounded-md text-white font-semibold px-4 py-2 text-xs transition-all disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Saving...' : 'Save expense'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError('') }}
              className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs transition-colors shadow-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!expenses.length ? (
        <div className="rounded-md border border-dashed border-[#eaecf2] dark:border-white/[0.08] bg-white/60 dark:bg-[#12141c]/60 p-12 text-center">
          <p className="text-sm text-slate-700 dark:text-slate-300">No expenses logged yet.</p>
          <p className="text-xs text-slate-500 mt-1">Track software, server costs, contractors, and subscriptions to see real take-home profits.</p>
        </div>
      ) : (
        <div className="rounded-md border border-[#eaecf2] dark:border-white/[0.08] bg-white dark:bg-[#12141c]/90 divide-y divide-[#f1f3f7] dark:divide-white/[0.05] overflow-hidden shadow-xs dark:shadow-none backdrop-blur-md">
          {expenses.map(ex => (
            <div key={ex.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{ex.description}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(ex.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {ex.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-[#eaecf2] dark:border-white/[0.08]">
                      {ex.category}
                    </span>
                  )}
                  {ex.projectName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                      {ex.projectName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="font-mono text-sm font-medium text-rose-600 dark:text-rose-400 tabular-nums">
                  −{fmt(ex.amount)}
                </span>
                <button
                  onClick={() => remove(ex.id)}
                  className="text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
