'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap, CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react'

interface Doc {
  id: string; type: string; title: string; content: string
  client_name: string | null; amount: number | null; status: string
  signed_name: string | null; signed_at: string | null
  users: { name: string | null; accent_color: string | null; logo_url: string | null } | null
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
      .select('*, users(name, accent_color, logo_url)')
      .eq('id', id).single()
      .then(({ data }: { data: any }) => { setDoc(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-400">Loading…</div>
  if (!doc)    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Document not found.</div>

  const accent = doc.users?.accent_color ?? '#6366F1'
  const freelancer = doc.users?.name ?? 'your freelancer'

  // Already responded
  const alreadyDone = done || doc.status === 'signed' || doc.status === 'accepted' || doc.status === 'declined'

  if (alreadyDone) {
    const o = outcome ?? (doc.status as any)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-sm w-full text-center">
          {o === 'declined' ? (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Response recorded</h1>
              <p className="text-slate-500 text-sm">{freelancer} has been notified. They'll be in touch shortly.</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">
                {o === 'signed' ? 'Contract signed!' : 'Confirmed!'}
              </h1>
              <p className="text-slate-500 text-sm">
                {o === 'signed'
                  ? `Signed by ${doc.signed_name ?? signName}. ${freelancer} has been notified.`
                  : `${freelancer} has been notified and will be in touch soon.`}
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
    // Never show "signed!" unless it actually persisted — this is a binding
    // signature; a false confirmation is worse than an error.
    if (error) { setActionError('We couldn’t record your signature. Please try again.'); return }
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
    if (error) { setActionError('We couldn’t record your response. Please try again.'); return }
    setOutcome(action); setDone(true)
  }

  const TYPE_LABELS: Record<string, string> = {
    proposal: 'Project Proposal', agreement: 'Service Agreement', requirements: 'Requirements Document',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          {doc.users?.logo_url ? (
            <img src={doc.users.logo_url} alt={freelancer} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900 text-sm">{doc.title}</div>
            <div className="text-xs text-slate-400">from {freelancer}</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {TYPE_LABELS[doc.type] ?? doc.type}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Document body */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-7 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 mb-2">{doc.title}</h1>
            <div className="flex items-center gap-3">
              {doc.amount && (
                <span className="text-sm font-semibold text-slate-700">
                  ${doc.amount.toLocaleString()}
                </span>
              )}
              {doc.client_name && (
                <span className="text-sm text-slate-500">for {doc.client_name}</span>
              )}
            </div>
          </div>
          <div className="px-8 py-7">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {doc.content}
            </pre>
          </div>
          <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
        </div>

        {/* Response section */}
        {doc.type === 'agreement' ? (
          /* ── Sign ───────────────────────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <h2 className="font-bold text-slate-900 mb-1">Sign this agreement</h2>
            <p className="text-sm text-slate-500 mb-5">By signing, you agree to all terms above.</p>
            <form onSubmit={sign} className="space-y-4">
              <Input
                label="Your full name"
                placeholder="Jane Smith"
                value={signName}
                onChange={e => setSignName(e.target.value)}
                required
              />
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">
                  I, <strong>{signName || 'the undersigned'}</strong>, have read and agree to the terms of this agreement. I understand this is legally binding.
                </span>
              </label>
              <Button
                type="submit" loading={signing}
                disabled={!agreed || !signName.trim()}
                className="w-full justify-center"
                style={{ backgroundColor: accent }}
              >
                Sign agreement
              </Button>
              {actionError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{actionError}</div>
              )}
            </form>
            <p className="text-xs text-slate-400 mt-3 text-center">Your name and timestamp will be recorded.</p>
          </div>
        ) : (
          /* ── Accept / decline (proposal + requirements) ──────────────── */
          <div className="bg-white rounded-2xl border border-slate-200 p-7">
            <h2 className="font-bold text-slate-900 mb-1">
              {doc.type === 'proposal' ? 'Respond to this proposal' : 'Approve requirements'}
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              {doc.type === 'proposal'
                ? 'Let the freelancer know if you\'d like to proceed.'
                : 'Confirm these requirements accurately reflect your project needs.'}
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-colors"
                rows={3}
                placeholder={doc.type === 'proposal' ? 'Any questions or comments?' : 'Any changes needed?'}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              {doc.type !== 'requirements' && (
                <Button
                  variant="secondary"
                  onClick={() => respond('declined')}
                  loading={responding}
                  className="flex-1 justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {doc.type === 'proposal' ? 'Decline' : 'Request changes'}
                </Button>
              )}
              <Button
                onClick={() => respond('accepted')}
                loading={responding}
                className="flex-1 justify-center"
                style={{ backgroundColor: accent }}
              >
                <ThumbsUp className="w-4 h-4" />
                {doc.type === 'proposal' ? 'Accept proposal' : 'Approve & sign off'}
              </Button>
            </div>
            {actionError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">{actionError}</div>
            )}
          </div>
        )}
      </div>

      <div className="py-6 text-center text-xs text-slate-400">
        Delivered by <span className="font-medium text-slate-500">{freelancer}</span> via Frevio
      </div>
    </div>
  )
}
