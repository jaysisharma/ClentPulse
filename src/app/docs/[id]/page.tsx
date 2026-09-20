'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { DarkShell } from '@/components/layout/dark-shell'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, Check, ExternalLink, Printer,
  Pencil, Save, X, Trash2, Send, FileSignature, Loader2,
} from 'lucide-react'

interface Doc {
  id: string
  type: string
  title: string
  content: string
  client_name: string | null
  client_email: string | null
  amount: number | null
  status: string
  signed_name: string | null
  signed_at: string | null
  response_note: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10',
  sent:     'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  signed:   'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  declined: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
}

const TYPE_LABELS: Record<string, string> = {
  proposal: 'Proposal',
  agreement: 'Service Agreement',
  requirements: 'Requirements Doc',
}

export default function DocDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc]       = useState<Doc | null>(null)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle]   = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.from('documents').select('*').eq('id', id).single().then(({ data }: { data: any }) => {
      if (cancelled || !data) return
      setDoc(data)
      setContent(data.content)
      setTitle(data.title)
    })
    return () => { cancelled = true }
  }, [id])

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/doc/${id}` : ''

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  async function saveEdit() {
    setSaving(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('documents').update({ title, content }).eq('id', id)
    setSaving(false)
    if (error) { setActionError('Could not save your changes. Please try again.'); return }
    setDoc(d => d ? { ...d, title, content } : d)
    setEditing(false)
  }

  async function markSent() {
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('documents').update({ status: 'sent' }).eq('id', id)
    if (error) { setActionError('Could not update the status. Please try again.'); return }
    setDoc(d => d ? { ...d, status: 'sent' } : d)
  }

  async function handleDelete() {
    if (!confirm('Delete this document? This cannot be undone.')) return
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (error) { setActionError('Could not delete this document. Please try again.'); return }
    router.push('/docs')
  }

  if (!doc) {
    return (
      <AppLayout>
        <DarkShell>
          <div className="max-w-3xl py-12 flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <Loader2 className="w-4 h-4 animate-spin text-slate-900 dark:text-white" />
            Loading document…
          </div>
        </DarkShell>
      </AppLayout>
    )
  }

  const isSigned   = doc.status === 'signed'   || !!doc.signed_at
  const isAccepted = doc.status === 'accepted'
  const isDeclined = doc.status === 'declined'
  const responded  = isSigned || isAccepted || isDeclined

  return (
    <AppLayout>
      <DarkShell>
        <div className="max-w-3xl animate-fade-in relative z-10 pb-12 print:max-w-none">
          {/* Back & top action pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to documents
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              {doc.status === 'draft' && (
                <button
                  type="button"
                  onClick={markSent}
                  className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Mark sent
                </button>
              )}
              <button
                type="button"
                onClick={copyLink}
                className="rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-4 py-1.5 text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied link
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy link
                  </>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </a>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {actionError && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 mb-5 print:hidden">
              {actionError}
            </div>
          )}

          {/* Client response banner */}
          {responded && (
            <div
              className={`rounded-2xl border p-4 sm:p-5 mb-6 backdrop-blur-md print:hidden ${
                isSigned || isAccepted
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSignature
                  className={`w-4 h-4 flex-shrink-0 ${
                    isSigned || isAccepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                />
                <span className="font-semibold text-xs sm:text-sm">
                  {isSigned
                    ? `Signed by ${doc.signed_name}`
                    : isAccepted
                    ? `Accepted by ${doc.client_name ?? 'client'}`
                    : `Declined by ${doc.client_name ?? 'client'}`}
                </span>
                {doc.signed_at && (
                  <span className="text-[11px] opacity-75 ml-1">
                    · {new Date(doc.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
              {doc.response_note && (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2.5 ml-6 italic">
                  &ldquo;{doc.response_note}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Document card */}
          <div className="bg-white dark:bg-[#0c0d12]/90 rounded-2xl border border-slate-200 dark:border-white/10 ring-1 ring-slate-950/5 dark:ring-white/5 overflow-hidden backdrop-blur-md shadow-xs dark:shadow-none">
            {/* Doc Header */}
            <div className="px-6 sm:px-8 py-6 sm:py-7 border-b border-slate-100 dark:border-white/5">
              {editing ? (
                <input
                  className="w-full text-2xl sm:text-3xl font-light uppercase tracking-tight text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-white/20 focus:outline-none pb-1 mb-4"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[-0.03em] text-slate-900 dark:text-white mb-3">
                  {doc.title}
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {TYPE_LABELS[doc.type] ?? doc.type}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft
                  }`}
                >
                  {doc.status}
                </span>
                {doc.amount != null && (
                  <span className="text-xs sm:text-sm font-mono font-medium text-slate-900 dark:text-white">
                    ${doc.amount.toLocaleString()}
                  </span>
                )}
                {doc.client_name && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    · Client: <strong className="font-medium text-slate-700 dark:text-slate-300">{doc.client_name}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Doc Body */}
            <div className="px-6 sm:px-8 py-6 sm:py-7">
              {editing ? (
                <>
                  <textarea
                    className="w-full text-xs sm:text-sm font-mono leading-relaxed border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/60 dark:bg-white/[0.03] px-4 py-3 focus:outline-none focus:border-slate-400 dark:focus:border-white/30 text-slate-800 dark:text-slate-100 transition-colors resize-none"
                    rows={32}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    spellCheck={false}
                  />
                  <div className="flex items-center gap-2.5 mt-4">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold px-5 py-2 text-xs transition-all shadow-xs disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setContent(doc.content)
                        setTitle(doc.title)
                      }}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <pre className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {doc.content}
                </pre>
              )}
            </div>

            {/* Bottom accent glow */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 opacity-60" />
          </div>

          {/* Public share capsule */}
          <div className="mt-5 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 print:hidden">
            <span className="font-light">
              Client Access URL: <code className="font-mono text-slate-700 dark:text-slate-300 text-[11px] break-all">{publicUrl}</code>
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white hover:opacity-80 transition-opacity"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </DarkShell>
    </AppLayout>
  )
}
