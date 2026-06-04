'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, Check, ExternalLink, Printer,
  Pencil, Save, X, Trash2, Send, FileSignature,
} from 'lucide-react'

interface Doc {
  id: string; type: string; title: string; content: string
  client_name: string | null; client_email: string | null
  amount: number | null; status: string
  signed_name: string | null; signed_at: string | null
  response_note: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft:    'bg-slate-100 text-slate-600',
  sent:     'bg-blue-50 text-blue-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  signed:   'bg-emerald-50 text-emerald-700',
  declined: 'bg-red-50 text-red-700',
}

const TYPE_LABELS: Record<string, string> = {
  proposal: 'Proposal', agreement: 'Service Agreement', requirements: 'Requirements Doc',
}

export default function DocDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc]       = useState<Doc | null>(null)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle]   = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current) }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    supabase.from('documents').select('*').eq('id', id).single().then(({ data }) => {
      if (cancelled || !data) return
      setDoc(data); setContent(data.content); setTitle(data.title)
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
    const supabase = createClient()
    await supabase.from('documents').update({ title, content }).eq('id', id)
    setDoc(d => d ? { ...d, title, content } : d)
    setEditing(false); setSaving(false)
  }

  async function markSent() {
    const supabase = createClient()
    await supabase.from('documents').update({ status: 'sent' }).eq('id', id)
    setDoc(d => d ? { ...d, status: 'sent' } : d)
  }

  async function handleDelete() {
    if (!confirm('Delete this document? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('documents').delete().eq('id', id)
    router.push('/docs')
  }

  if (!doc) return (
    <AppLayout>
      <div className="text-sm text-slate-400 animate-pulse">Loading…</div>
    </AppLayout>
  )

  const isSigned   = doc.status === 'signed'   || !!doc.signed_at
  const isAccepted = doc.status === 'accepted'
  const isDeclined = doc.status === 'declined'
  const responded  = isSigned || isAccepted || isDeclined

  return (
    <AppLayout>
      <div className="max-w-2xl animate-fade-in print:max-w-none">

        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />Documents
          </Link>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" />Edit
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />Print
            </Button>
            {doc.status === 'draft' && (
              <Button variant="secondary" size="sm" onClick={markSent}>
                <Send className="w-3.5 h-3.5" />Mark sent
              </Button>
            )}
            <Button size="sm" onClick={copyLink}>
              {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy link</>}
            </Button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <ExternalLink className="w-3.5 h-3.5" />Preview
              </Button>
            </a>
            <button onClick={handleDelete} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Client response banner */}
        {responded && (
          <div className={`rounded-xl border p-4 mb-5 print:hidden ${
            isSigned || isAccepted ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <FileSignature className={`w-4 h-4 ${isSigned || isAccepted ? 'text-emerald-600' : 'text-red-500'}`} />
              <span className={`font-semibold text-sm ${isSigned || isAccepted ? 'text-emerald-800' : 'text-red-700'}`}>
                {isSigned   ? `Signed by ${doc.signed_name}` :
                 isAccepted ? `Accepted by ${doc.client_name ?? 'client'}` :
                              `Declined by ${doc.client_name ?? 'client'}`}
              </span>
              {(doc.signed_at) && (
                <span className="text-xs text-emerald-600 ml-1">
                  · {new Date(doc.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            {doc.response_note && (
              <p className="text-sm text-slate-600 mt-2 ml-6">&quot;{doc.response_note}&quot;</p>
            )}
          </div>
        )}

        {/* Document card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Doc header */}
          <div className="px-8 py-7 border-b border-slate-100">
            {editing ? (
              <input
                className="w-full text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-indigo-400 focus:outline-none pb-1 mb-3"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{doc.title}</h1>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {TYPE_LABELS[doc.type] ?? doc.type}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft}`}>
                {doc.status}
              </span>
              {doc.amount && (
                <span className="text-sm font-semibold text-slate-700">
                  ${doc.amount.toLocaleString()}
                </span>
              )}
              {doc.client_name && (
                <span className="text-sm text-slate-500">· {doc.client_name}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-7">
            {editing ? (
              <>
                <textarea
                  className="w-full text-sm font-mono leading-relaxed border border-slate-200 rounded-xl bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
                  rows={32}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  spellCheck={false}
                />
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={saveEdit} loading={saving}>
                    <Save className="w-3.5 h-3.5" />Save changes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setContent(doc.content); setTitle(doc.title) }}>
                    <X className="w-3.5 h-3.5" />Cancel
                  </Button>
                </div>
              </>
            ) : (
              <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {doc.content}
              </pre>
            )}
          </div>

          {/* Accent bar */}
          <div className="h-1.5 w-full bg-indigo-600" />
        </div>

        <p className="text-xs text-slate-400 text-center mt-4 print:hidden">
          Share with client: <a href={publicUrl} target="_blank" className="text-indigo-500 hover:underline font-mono">{publicUrl}</a>
        </p>
      </div>
    </AppLayout>
  )
}
