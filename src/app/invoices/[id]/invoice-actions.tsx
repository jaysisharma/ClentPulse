'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, Mail, Pencil, Printer, Send, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Invoice { id: string; status: string; client_email: string | null }

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [reminderStatus, setReminderStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const router = useRouter()
  const sendTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (sendTimerRef.current)    clearTimeout(sendTimerRef.current)
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current)
  }, [])

  async function sendReminder() {
    setReminderStatus('sending')
    const res = await fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id, reminder: true }),
    })
    setReminderStatus(res.ok ? 'sent' : 'error')
    if (res.ok) {
      if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current)
      reminderTimerRef.current = setTimeout(() => setReminderStatus('idle'), 3000)
    }
  }

  async function markPaid() {
    setLoading(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', invoice.id)
    setLoading(false)
    if (error) { setActionError('Could not mark this invoice as paid. Please try again.'); return }
    router.refresh()
  }

  async function sendInvoice() {
    setSendStatus('sending')
    const res = await fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id }),
    })
    if (res.ok) {
      setSendStatus('sent')
      router.refresh()
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current)
      sendTimerRef.current = setTimeout(() => setSendStatus('idle'), 3000)
    } else {
      setSendStatus('error')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    setLoading(true)
    setActionError('')
    const supabase = createClient()
    const { error } = await supabase.from('invoices').delete().eq('id', invoice.id)
    if (error) { setActionError('Could not delete this invoice. Please try again.'); setLoading(false); return }
    router.push('/invoices')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/invoices/${invoice.id}/edit`}>
        <span className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </span>
      </Link>
      <button 
        type="button" 
        onClick={() => window.print()}
        className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5" /> Print / PDF
      </button>

      {invoice.status === 'draft' && (
        invoice.client_email ? (
          <button
            type="button"
            onClick={sendInvoice}
            disabled={sendStatus === 'sending' || sendStatus === 'sent'}
            className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {sendStatus === 'sending' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
            ) : sendStatus === 'sent' ? (
              <><Check className="w-3.5 h-3.5 text-emerald-500" /> Sent!</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send to client</>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              setLoading(true)
              setActionError('')
              const supabase = createClient()
              const { error } = await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoice.id)
              setLoading(false)
              if (error) { setActionError('Could not update this invoice. Please try again.'); return }
              router.refresh()
            }}
            disabled={loading}
            className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
            Mark as sent
          </button>
        )
      )}

      {/* Reminder button — only on sent invoices with a client email */}
      {invoice.status === 'sent' && invoice.client_email && (
        <button
          type="button"
          onClick={sendReminder}
          disabled={reminderStatus === 'sending' || reminderStatus === 'sent'}
          className="rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {reminderStatus === 'sending' ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
          ) : reminderStatus === 'sent' ? (
            <><Check className="w-3.5 h-3.5 text-emerald-500" /> Reminder sent!</>
          ) : (
            <><Mail className="w-3.5 h-3.5" /> Send reminder</>
          )}
        </button>
      )}

      {invoice.status !== 'paid' && (
        <button 
          type="button"
          onClick={markPaid} 
          disabled={loading}
          className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 text-xs transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Mark paid
        </button>
      )}

      {(sendStatus === 'error' || reminderStatus === 'error') && (
        <span className="text-xs text-rose-500 font-medium">Failed to send — check client email</span>
      )}
      {actionError && <span className="text-xs text-rose-500 font-medium">{actionError}</span>}

      <button
        type="button"
        onClick={handleDelete}
        title="Delete invoice"
        className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

