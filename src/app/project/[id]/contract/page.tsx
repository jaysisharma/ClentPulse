'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSignature, Copy, Check, ExternalLink } from 'lucide-react'

interface Contract {
  id: string; title: string; type: string; amount: number | null; terms: string
  signed_at: string | null; signed_name: string | null; created_at: string
}

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  const [title, setTitle] = useState('')
  const [type, setType] = useState<'fixed' | 'retainer'>('fixed')
  const [amount, setAmount] = useState('')
  const [terms, setTerms] = useState('')

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled || !user) { if (!cancelled) router.push('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('contracts')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (cancelled) return
      if (data) setContract(data)
    }

    load()
    return () => { cancelled = true }
  }, [id, router])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('contracts').insert({
      project_id: id, user_id: userId, title, type, amount: amount ? parseFloat(amount) : null, terms,
    }).select().single()
    setContract(data)
    setShowForm(false); setSaving(false)
  }

  const signingUrl = contract ? `${typeof window !== 'undefined' ? window.location.origin : ''}/contract/${contract.id}` : ''

  async function copyLink() {
    await navigator.clipboard.writeText(signingUrl)
    setCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in">
        <Link href={`/project/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to project
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Contract</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Create a contract and send the signing link to your client.</p>

        {!contract && !showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileSignature className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">No contract yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Create a contract and share the signing link with your client.</p>
            <Button onClick={() => setShowForm(true)}>Create contract</Button>
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Contract title" placeholder="e.g. Website Redesign Agreement" value={title} onChange={e => setTitle(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">Contract type</label>
                  <select value={type} onChange={e => setType(e.target.value as 'fixed' | 'retainer')}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="fixed">Fixed price</option>
                    <option value="retainer">Retainer</option>
                  </select>
                </div>
                <Input label="Amount ($)" type="number" min="0" step="0.01" placeholder="5000" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1.5">Terms & scope</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={8}
                  placeholder="Describe the scope of work, deliverables, payment terms, revision policy…"
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>Create contract</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {contract && (
          <div className="space-y-4">
            {/* Signing status */}
            <div className={`rounded-xl border p-5 flex items-center justify-between ${contract.signed_at ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div>
                <div className={`font-semibold ${contract.signed_at ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {contract.signed_at ? `Signed by ${contract.signed_name}` : 'Awaiting signature'}
                </div>
                {contract.signed_at && (
                  <div className="text-xs text-emerald-600 mt-0.5">
                    {new Date(contract.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              {!contract.signed_at && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copyLink}>
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy signing link</>}
                  </Button>
                  <a href={signingUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" />Preview</Button>
                  </a>
                </div>
              )}
            </div>

            {/* Contract preview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{contract.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full capitalize">{contract.type}</span>
                    {contract.amount && <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">${contract.amount.toLocaleString()}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{contract.terms}</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
