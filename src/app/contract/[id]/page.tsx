'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PoweredByReferral } from '@/components/ui/powered-by-referral'
import { isPaidPlan } from '@/lib/plans'
import { notFound } from 'next/navigation'

interface Contract {
  id: string; title: string; type: string; amount: number | null; terms: string
  signed_at: string | null; signed_name: string | null
  projects: { project_name: string; client_name: string } | null
  users: { id?: string; name: string | null; username?: string | null; plan?: string | null; accent_color: string | null } | null
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
    supabase.from('contracts').select('*, projects(project_name,client_name), users(id,name,username,plan,accent_color)').eq('id', id).single()
      .then(({ data }: { data: any }) => { setContract(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-mono">
      Loading agreement…
    </div>
  )
  if (!contract) return notFound()

  const accent = contract.users?.accent_color ?? '#6366F1'

  if (contract.signed_at || signed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-8 sm:p-10 max-w-md w-full text-center shadow-xl dark:shadow-none space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
            Agreement Executed
          </div>
          <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
            Contract Legally Signed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Signed by <strong className="text-slate-900 dark:text-white">{contract.signed_name || name}</strong>
            {contract.signed_at && ` on ${new Date(contract.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}.
            A copy has been recorded in the studio ledger.
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#08090a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: accent }}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{contract.title}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">Prepared by {contract.users?.name ?? 'Studio Lead'}</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6 relative">
        {/* Document Card */}
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xs dark:shadow-none">
          <div className="flex items-start justify-between mb-5 pb-5 border-b border-slate-100 dark:border-white/5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
                Official Agreement
              </div>
              <h1 className="text-xl sm:text-2xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
                {contract.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full capitalize">
                  {contract.type}
                </span>
                {contract.amount && (
                  <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    ${contract.amount.toLocaleString()} USD
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans">
              {contract.terms}
            </p>
          </div>
        </div>

        {/* Signature Card */}
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xs dark:shadow-none">
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Digital Signature Execution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Please enter your full legal name to execute this agreement.
            </p>
          </div>

          <form onSubmit={sign} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                I, <strong className="text-slate-900 dark:text-white">{name || 'the undersigned client'}</strong>, have reviewed and agree to the specified contractual terms. I acknowledge that this digital signature constitutes a binding legal agreement.
              </span>
            </label>

            <Button
              type="submit"
              loading={signing}
              disabled={!agreed || !name.trim()}
              className="w-full h-11 justify-center rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm text-white"
              style={{ backgroundColor: accent, borderColor: accent }}
            >
              Sign & Execute Agreement
            </Button>
          </form>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
            Your cryptographic timestamp and IP record will be permanently archived with this contract.
          </p>
        </div>

        {/* Powered by Frevio with referral attribution */}
        <PoweredByReferral
          refHandle={contract.users?.username || contract.users?.id}
          isWhiteLabel={isPaidPlan(contract.users?.plan)}
        />
      </div>
    </div>
  )
}
