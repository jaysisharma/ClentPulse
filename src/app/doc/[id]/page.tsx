'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Zap, CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { PoweredByReferral } from '@/components/ui/powered-by-referral'
import { isPaidPlan } from '@/lib/plans'

interface Doc {
  id: string; type: string; title: string; content: string
  client_name: string | null; amount: number | null; status: string
  signed_name: string | null; signed_at: string | null
  users: { id?: string; name: string | null; username?: string | null; plan?: string | null; accent_color: string | null; logo_url: string | null } | null
}

export default function PublicDocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [doc, setDoc]   = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [outcome, setOutcome] = useState<'accepted' | 'signed' | 'declined' | null>(null)

  // Signing form (agreement)
  const [signName, setSignName] = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [signing, setSigning]   = useState(false)

  // Proposal / requirements response
  const [note, setNote]           = useState('')
  const [responding, setResponding] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('documents')
      .select('*, users(id, name, username, plan, accent_color, logo_url)')
      .eq('id', id).single()
      .then(({ data }: { data: any }) => { setDoc(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-mono">
      Loading document…
    </div>
  )
  if (!doc) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-mono">
      Document not found.
    </div>
  )

  const accent = doc.users?.accent_color ?? '#6366F1'
  const freelancer = doc.users?.name ?? 'Studio Lead'

  // Already responded
  const alreadyDone = done || doc.status === 'signed' || doc.status === 'accepted' || doc.status === 'declined'

  if (alreadyDone) {
    const o = outcome ?? (doc.status as any)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="relative bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-8 sm:p-10 max-w-sm w-full text-center shadow-xl dark:shadow-none space-y-4">
          {o === 'declined' ? (
            <>
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-[10px] font-medium tracking-widest uppercase text-rose-700 dark:text-rose-400">
                Response Recorded
              </div>
              <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
                Feedback Submitted
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {freelancer} has been notified of your response and will reach out promptly.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                Confirmed & Verified
              </div>
              <h1 className="text-xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white">
                {o === 'signed' ? 'Agreement Executed' : 'Proposal Accepted'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {o === 'signed'
                  ? `Executed by ${doc.signed_name ?? signName}. ${freelancer} has received the verified copy.`
                  : `${freelancer} has been alerted and will begin onboarding the engagement.`}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Agreement: sign ──────────────────────────────────────────────────────

  async function sign(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || !signName.trim()) return
    setSigning(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('documents').update({
      status: 'signed',
      signed_name: signName.trim(),
      signed_at: new Date().toISOString(),
    }).eq('id', id)
    setSigning(false)
    if (error) { setActionError('We could not record your signature. Please try again.'); return }
    setOutcome('signed'); setDone(true)
  }

  // ── Proposal / requirements: accept or decline ───────────────────────────

  async function respond(action: 'accepted' | 'declined') {
    setResponding(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('documents').update({
      status: action,
      response_note: note.trim() || null,
    }).eq('id', id)
    setResponding(false)
    if (error) { setActionError('We could not record your response. Please try again.'); return }
    setOutcome(action); setDone(true)
  }

  const TYPE_LABELS: Record<string, string> = {
    proposal: 'Project Proposal', agreement: 'Service Agreement', requirements: 'Scope & Requirements',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090a] text-slate-900 dark:text-white font-sans relative overflow-hidden selection:bg-slate-200 dark:selection:bg-white/20">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-3xl pointer-events-none" />

      {/* Sticky header */}
      <header className="bg-white/80 dark:bg-[#08090a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {doc.users?.logo_url ? (
              <img src={doc.users.logo_url} alt={freelancer} className="h-8 w-auto object-contain rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: accent }}>
                <Zap className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{doc.title}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">Prepared by {freelancer}</div>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full">
              {TYPE_LABELS[doc.type] ?? doc.type}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 relative">
        {/* Document body */}
        <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md overflow-hidden shadow-xs dark:shadow-none">
          <div className="px-8 py-7 border-b border-slate-100 dark:border-white/5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] text-[10px] font-medium tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2">
              Official Document
            </div>
            <h1 className="text-xl sm:text-2xl font-light uppercase tracking-[-0.02em] text-slate-900 dark:text-white mb-2">
              {doc.title}
            </h1>
            <div className="flex items-center gap-3">
              {doc.amount && (
                <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                  ${doc.amount.toLocaleString()} USD
                </span>
              )}
              {doc.client_name && (
                <span className="text-xs text-slate-500 dark:text-slate-400">Prepared for {doc.client_name}</span>
              )}
            </div>
          </div>
          <div className="px-8 py-7">
            <pre className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
              {doc.content}
            </pre>
          </div>
          <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
        </div>

        {/* Response section */}
        {doc.type === 'agreement' ? (
          /* ── Sign ───────────────────────────────────────────────────── */
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xs dark:shadow-none">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              Sign & Execute Agreement
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              By providing your legal signature below, you endorse and agree to all contractual terms stated above.
            </p>
            <form onSubmit={sign} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={signName}
                  onChange={e => setSignName(e.target.value)}
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
                  I, <strong className="text-slate-900 dark:text-white">{signName || 'the undersigned client'}</strong>, have read and agree to all terms of this service agreement. I understand this constitutes a binding legal agreement.
                </span>
              </label>

              <Button
                type="submit"
                loading={signing}
                disabled={!agreed || !signName.trim()}
                className="w-full h-11 justify-center rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm text-white mt-2"
                style={{ backgroundColor: accent }}
              >
                Sign Agreement
              </Button>

              {actionError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
                  {actionError}
                </div>
              )}
            </form>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
              Your name, cryptographic hash, and timestamp will be securely archived.
            </p>
          </div>
        ) : (
          /* ── Accept / decline (proposal + requirements) ──────────────── */
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xs dark:shadow-none">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              {doc.type === 'proposal' ? 'Respond to Proposal' : 'Approve Scope & Requirements'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              {doc.type === 'proposal'
                ? 'Inform the studio team if you wish to proceed with this proposal.'
                : 'Confirm that these specifications accurately represent the intended project deliverables.'}
            </p>

            <div className="mb-5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                Note <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 resize-none transition-colors"
                rows={3}
                placeholder={doc.type === 'proposal' ? 'Add any questions or comments regarding the proposal...' : 'List any alterations or clarifications required...'}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              {doc.type !== 'requirements' && (
                <button
                  type="button"
                  onClick={() => respond('declined')}
                  disabled={responding}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {doc.type === 'proposal' ? 'Decline' : 'Request Changes'}
                </button>
              )}
              <button
                type="button"
                onClick={() => respond('accepted')}
                disabled={responding}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-full text-white text-xs font-semibold uppercase tracking-wider transition-all hover:opacity-95 shadow-xs cursor-pointer"
                style={{ backgroundColor: accent }}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {doc.type === 'proposal' ? 'Accept Proposal' : 'Approve & Sign Off'}
              </button>
            </div>
            {actionError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5 mt-4">
                {actionError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Powered by Frevio with referral attribution */}
      <PoweredByReferral
        refHandle={doc.users?.username || doc.users?.id}
        isWhiteLabel={isPaidPlan(doc.users?.plan)}
      />
    </div>
  )
}
