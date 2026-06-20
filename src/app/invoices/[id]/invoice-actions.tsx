'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Mail, Pencil, Printer, Send, Trash2 } from 'lucide-react'
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
    <div className="flex items-center gap-2">
      <Link href={`/invoices/${invoice.id}/edit`}>
        <Button variant="secondary" size="sm">
          <Pencil className="w-3.5 h-3.5" />Edit
        </Button>
      </Link>
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <Printer className="w-3.5 h-3.5" />Print / PDF
      </Button>

      {invoice.status === 'draft' && (
        invoice.client_email ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={sendInvoice}
            loading={sendStatus === 'sending'}
            disabled={sendStatus === 'sent'}
          >
            {sendStatus === 'sent'
              ? <><Check className="w-3.5 h-3.5" />Sent!</>
              : <><Send className="w-3.5 h-3.5" />Send to client</>
            }
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              setLoading(true)
              setActionError('')
              const supabase = createClient()
              const { error } = await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoice.id)
              setLoading(false)
              if (error) { setActionError('Could not update this invoice. Please try again.'); return }
              router.refresh()
            }}
            loading={loading}
          >
            <Mail className="w-3.5 h-3.5" />Mark as sent
          </Button>
        )
      )}

      {/* Reminder button — only on sent invoices with a client email */}
      {invoice.status === 'sent' && invoice.client_email && (
        <Button
          variant="secondary"
          size="sm"
          onClick={sendReminder}
          loading={reminderStatus === 'sending'}
          disabled={reminderStatus === 'sent'}
        >
          {reminderStatus === 'sent'
            ? <><Check className="w-3.5 h-3.5" />Reminder sent!</>
            : <><Mail className="w-3.5 h-3.5" />Send reminder</>
          }
        </Button>
      )}

      {invoice.status !== 'paid' && (
        <Button size="sm" onClick={markPaid} loading={loading}>
          <Check className="w-3.5 h-3.5" />Mark paid
        </Button>
      )}

      {(sendStatus === 'error' || reminderStatus === 'error') && (
        <span className="text-xs text-red-600">Failed to send — check client email</span>
      )}
      {actionError && <span className="text-xs text-red-600">{actionError}</span>}

      <button
        onClick={handleDelete}
        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
