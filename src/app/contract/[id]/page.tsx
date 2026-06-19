'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notFound } from 'next/navigation'

interface Contract {
  id: string; title: string; type: string; amount: number | null; terms: string
  signed_at: string | null; signed_name: string | null
  projects: { project_name: string; client_name: string } | null
  users: { name: string | null; accent_color: string | null } | null
}

export default function ContractSignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('contracts').select('*, projects(project_name,client_name), users(name,accent_color)').eq('id', id).single()
      .then(({ data }: { data: any }) => { setContract(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-400">Loading…</div>
  if (!contract) return notFound()

  const accent = contract.users?.accent_color ?? '#6366F1'

  if (contract.signed_at || signed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-sm text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Contract signed!</h1>
          <p className="text-slate-500 text-sm">
            Signed by {contract.signed_name || name}.
            {contract.signed_at && ` on ${new Date(contract.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>
      </div>
    )
  }

  async function sign(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || !name.trim()) return
    setSigning(true)
    const supabase = createClient()
    await supabase.from('contracts').update({ signed_at: new Date().toISOString(), signed_name: name }).eq('id', id)
    setSigned(true); setSigning(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{contract.title}</div>
            <div className="text-xs text-slate-400">from {contract.users?.name ?? 'your freelancer'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{contract.title}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{contract.type}</span>
                {contract.amount && <span className="text-sm font-semibold text-slate-700">${contract.amount.toLocaleString()}</span>}
              </div>
            </div>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">{contract.terms}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Sign this contract</h2>
          <form onSubmit={sign} className="space-y-4">
            <Input label="Your full name" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-600">
                I, <strong>{name || 'the undersigned'}</strong>, have read and agree to the terms of this contract. I understand this constitutes a legally binding agreement.
              </span>
            </label>
            <Button type="submit" loading={signing} disabled={!agreed || !name.trim()} className="w-full justify-center"
              style={{ backgroundColor: accent, borderColor: accent }}>
              Sign contract
            </Button>
          </form>
          <p className="text-xs text-slate-400 mt-3 text-center">Your signature and timestamp will be recorded.</p>
        </div>
      </div>
    </div>
  )
}
