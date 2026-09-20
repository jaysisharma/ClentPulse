'use client'

import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSignature, Copy, Check, ExternalLink } from 'lucide-react'

import { DarkShell } from '@/components/layout/dark-shell'

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
      <DarkShell>
        <div className="max-w-2xl animate-fade-in relative z-10 pb-12">
          {/* Back link */}
          <Link 
            href={`/project/${id}`} 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to project
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Legal Agreements
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white">
              Project Contract
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
              Create an agreement and distribute the secure signing link to your client.
            </p>
          </div>

          {!contract && !showForm && (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center backdrop-blur-md shadow-xs dark:shadow-none">
              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                <FileSignature className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                No contract generated yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-6 max-w-sm mx-auto">
                Generate a contract outlining scope, payment structure, and terms for client signature.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2.5 text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                Create contract
              </button>
            </div>
          )}

          {showForm && (
            <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none backdrop-blur-md">
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Contract title
                  </label>
                  <input 
                    placeholder="e.g. Website Redesign Agreement" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Contract type
                    </label>
                    <select 
                      value={type} 
                      onChange={e => setType(e.target.value as 'fixed' | 'retainer')}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0c0d12] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full"
                    >
                      <option value="fixed">Fixed price</option>
                      <option value="retainer">Retainer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Amount ($)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="5000" 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Terms & scope of work
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Outline key deliverables, review timelines, payment schedules, and revision limits..."
                    value={terms}
                    onChange={e => setTerms(e.target.value)}
                    required
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-white/30 focus:outline-none transition-colors w-full leading-relaxed resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2.5 text-xs transition-all shadow-xs disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create contract'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {contract && (
            <div className="space-y-4">
              {/* Signing status pill/card */}
              <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md ${
                contract.signed_at 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300'
              }`}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider">
                    {contract.signed_at ? `Signed by ${contract.signed_name}` : 'Awaiting client signature'}
                  </div>
                  {contract.signed_at && (
                    <div className="text-xs opacity-75 mt-0.5 font-mono">
                      {new Date(contract.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
                {!contract.signed_at && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyLink}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                    >
                      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
                    </button>
                    <a href={signingUrl} target="_blank" rel="noopener noreferrer">
                      <span className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                      </span>
                    </a>
                  </div>
                )}
              </div>

              {/* Contract preview */}
              <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 p-6 sm:p-7 shadow-xs dark:shadow-none backdrop-blur-md space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">{contract.title}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-white/5">
                        {contract.type}
                      </span>
                      {contract.amount && (
                        <span className="text-xs font-semibold font-mono text-slate-900 dark:text-white">
                          ${contract.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-light">
                  {contract.terms}
                </p>
              </div>
            </div>
          )}
        </div>
      </DarkShell>
    </AppLayout>
  )
}

